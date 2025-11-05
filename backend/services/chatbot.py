"""
Generalized Chatbot Service - Handles any banking query with automatic attribute tracking
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
from database import get_database
from config import settings
from openai import OpenAI
import json
import time
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai/chat", tags=["ai-chat"])

# Initialize OpenAI client
try:
    client = OpenAI(api_key=settings.openai_api_key)
except Exception as e:
    logger.warning(f"OpenAI client initialization failed: {e}")
    client = None

class ChatRequest(BaseModel):
    query: str = Field(..., description="User's banking query")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")

class ChatResponse(BaseModel):
    response: str
    attributes_used: List[str]
    query_type: str  # loan, account, transaction, offer, general, etc.
    confidence: Optional[float] = None
    queryLogId: Optional[str] = None

def get_user_from_clerk_id(clerk_id: str, db):
    """Get user from MongoDB using Clerk ID"""
    user = db.users.find_one({"clerkId": clerk_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def extract_all_relevant_data(user_id: ObjectId, query: str, db) -> tuple[Dict, List[str]]:
    """
    Intelligently extract relevant user/bank data based on query content
    Returns: (data_dict, attributes_accessed_list)
    """
    attributes_accessed = []
    data = {}
    
    query_lower = query.lower()
    
    # Always get basic user info
    user = db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    attributes_accessed.extend([
        "user.email", "user.firstName", "user.lastName"
    ])
    data["user_basic"] = {
        "name": f"{user.get('firstName', '')} {user.get('lastName', '')}",
        "email": user.get("email")
    }
    
    # Extract financial data if query mentions: loan, credit, eligibility, income, money
    financial_keywords = ["loan", "credit", "eligibility", "income", "money", "borrow", "lend", "debt", "salary"]
    if any(keyword in query_lower for keyword in financial_keywords):
        if user.get("income"):
            data["user_financial"] = {
                "income": user.get("income"),
                "creditScore": user.get("creditScore"),
                "employmentStatus": user.get("employmentStatus")
            }
            attributes_accessed.extend([
                "user.income",
                "user.creditScore",
                "user.employmentStatus"
            ])
        
        if user.get("dateOfBirth"):
            from datetime import datetime
            today = datetime.now()
            dob = user.get("dateOfBirth")
            if isinstance(dob, datetime):
                age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
                data["user_financial"]["age"] = age
                attributes_accessed.append("user.dateOfBirth")
    
    # Extract account data if query mentions: account, balance, savings, checking
    account_keywords = ["account", "balance", "savings", "checking", "deposit", "withdraw"]
    if any(keyword in query_lower for keyword in account_keywords):
        accounts = list(db.accounts.find(
            {"userId": user_id, "status": {"$ne": "closed"}},
            {"balance": 1, "accountType": 1, "accountNumber": 1, "status": 1}
        ))
        
        if accounts:
            data["accounts"] = [
                {
                    "type": acc.get("accountType"),
                    "balance": acc.get("balance"),
                    "accountNumber": acc.get("accountNumber"),
                    "status": acc.get("status")
                }
                for acc in accounts
            ]
            attributes_accessed.extend([
                "accounts.balance",
                "accounts.accountType",
                "accounts.accountNumber",
                "accounts.status"
            ])
    
    # Extract transaction data if query mentions: transaction, spending, purchase, payment
    transaction_keywords = ["transaction", "spending", "purchase", "payment", "spent", "expense", "payment"]
    if any(keyword in query_lower for keyword in transaction_keywords):
        six_months_ago = datetime.now() - timedelta(days=180)
        transactions = list(db.transactions.find(
            {
                "userId": user_id,
                "createdAt": {"$gte": six_months_ago},
                "status": "completed"
            },
            {"amount": 1, "category": 1, "type": 1, "description": 1, "createdAt": 1}
        ).limit(50))
        
        if transactions:
            data["transactions"] = {
                "recent_count": len(transactions),
                "monthly_spending": sum(t.get("amount", 0) for t in transactions if t.get("type") == "debit") / 6,
                "categories": {}
            }
            
            # Category breakdown
            for t in transactions:
                cat = t.get("category", "other")
                if cat not in data["transactions"]["categories"]:
                    data["transactions"]["categories"][cat] = 0
                data["transactions"]["categories"][cat] += t.get("amount", 0)
            
            attributes_accessed.extend([
                "transactions.amount",
                "transactions.category",
                "transactions.type",
                "transactions.description",
                "transactions.createdAt"
            ])
    
    # Extract offer/promotion data if query mentions: offer, promotion, discount, deal
    offer_keywords = ["offer", "promotion", "discount", "deal", "benefit", "reward"]
    if any(keyword in query_lower for keyword in offer_keywords):
        # Bank offers/promotions (could be stored in a separate collection)
        # For now, we'll note that offers might be relevant
        data["offers_available"] = True
        attributes_accessed.append("bank.offers")
    
    # Add address if query mentions: address, location, where
    address_keywords = ["address", "location", "where"]
    if any(keyword in query_lower for keyword in address_keywords):
        if user.get("address"):
            data["user_address"] = user.get("address")
            attributes_accessed.append("user.address")
    
    return data, list(set(attributes_accessed))

def determine_query_type(query: str) -> str:
    """Determine the type of query"""
    query_lower = query.lower()
    
    if any(kw in query_lower for kw in ["loan", "borrow", "lend", "eligibility"]):
        return "loan"
    elif any(kw in query_lower for kw in ["account", "balance", "savings", "checking"]):
        return "account"
    elif any(kw in query_lower for kw in ["transaction", "spending", "payment", "purchase"]):
        return "transaction"
    elif any(kw in query_lower for kw in ["offer", "promotion", "discount", "deal"]):
        return "offer"
    elif any(kw in query_lower for kw in ["explain", "what", "how", "why", "profile"]):
        return "explanation"
    else:
        return "general"

@router.post("/query", response_model=ChatResponse)
async def chat_query(
    request: ChatRequest,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """
    Generalized chatbot endpoint - handles any banking query
    Automatically determines which user/bank data is needed
    """
    start_time = time.time()
    
    if not client:
        raise HTTPException(status_code=500, detail="OpenAI client not initialized")
    
    # Get user
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    # Determine query type
    query_type = determine_query_type(request.query)
    
    # Step 1: Intelligently extract relevant data
    # Reset query logger before extracting data
    try:
        from database import get_query_logger
        query_logger = get_query_logger()
        query_logger.reset()
    except Exception as e:
        logger.warning(f"Could not get query logger: {e}")
        query_logger = None
    
    user_data, attributes_accessed = extract_all_relevant_data(user_id, request.query, db)
    
    # Get MongoDB query logs after extraction
    mongo_queries = []
    if query_logger:
        mongo_queries = query_logger.queries.copy()
        query_logger.reset()
    
    # Step 2: Build prompt for OpenAI
    system_prompt = """You are a helpful and transparent AI banking assistant for EthicalBank.
You must:
1. Answer the user's question accurately and helpfully
2. ALWAYS report which user/bank data attributes you used in your response
3. Use the format: user.income, accounts.balance, transactions.amount, etc.
4. Be transparent about what data influenced your answer
5. If you're making recommendations, explain why based on the data"""
    
    user_prompt = f"""
User Query: {request.query}

Available Data:
{json.dumps(user_data, indent=2, default=str)}

CRITICAL: In your response, you MUST include:
1. A helpful answer to the user's question
2. An 'attributes_used' array listing ALL schema attributes from the data that influenced your response
   Format: ["user.income", "accounts.balance", "transactions.category", etc.]

Return JSON:
{{
    "response": "Your helpful response to the user",
    "attributes_used": ["user.income", "accounts.balance", ...],
    "confidence": 0.0-1.0,
    "reasoning": "Brief explanation of why you used these attributes"
}}
"""
    
    # Step 3: Call OpenAI
    try:
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        ai_response = json.loads(response.choices[0].message.content)
    except Exception as e:
        logger.error(f"OpenAI API error: {e}")
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")
    
    # Step 4: Validate and cross-reference attributes
    ai_reported = ai_response.get("attributes_used", [])
    
    # Validate attributes
    validated_attributes = []
    for attr in ai_reported:
        if attr in attributes_accessed:
            validated_attributes.append(attr)
        else:
            # Check if it's a valid attribute path
            if any(attr.startswith(prefix) for prefix in ["user.", "accounts.", "transactions.", "bank."]):
                validated_attributes.append(attr)
    
    # Add any attributes we accessed but AI didn't report
    for attr in attributes_accessed:
        if attr not in validated_attributes:
            validated_attributes.append(attr)
    
    processing_time = (time.time() - start_time) * 1000
    
    # Step 5: Log to MongoDB
    log_entry = {
        "userId": user_id,
        "queryType": query_type,
        "queryText": request.query,
        "mongoQueries": mongo_queries,
        "attributesAccessed": attributes_accessed,
        "userDataSnapshot": user_data,
        "aiModel": settings.openai_model,
        "aiResponse": ai_response,
        "aiReportedAttributes": ai_reported,
        "validatedAttributes": validated_attributes,
        "validationStatus": "matched" if len(validated_attributes) == len(attributes_accessed) else "partial",
        "timestamp": datetime.now(),
        "processingTimeMs": processing_time
    }
    
    log_result = db.ai_query_logs.insert_one(log_entry)
    query_log_id = str(log_result.inserted_id)
    
    return ChatResponse(
        response=ai_response.get("response", ""),
        attributes_used=validated_attributes,
        query_type=query_type,
        confidence=ai_response.get("confidence"),
        queryLogId=query_log_id
    )

