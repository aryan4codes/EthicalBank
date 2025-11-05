"""
Generalized Chatbot Service - Handles any banking query with automatic attribute tracking
Extensible data extraction system that automatically includes all user data sources
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
from database import get_database
from config import settings
from openai import OpenAI
from services.privacy import filter_allowed_attributes
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

# Data Extraction Registry - Easy to extend with new data sources
DATA_EXTRACTORS = {
    "user": {
        "collections": ["users"],
        "keywords": ["user", "profile", "me", "my", "personal"],
        "always_include": True
    },
    "accounts": {
        "collections": ["accounts"],
        "keywords": ["account", "balance", "checking", "deposit", "withdraw"],
        "always_include": False
    },
    "transactions": {
        "collections": ["transactions"],
        "keywords": ["transaction", "spending", "purchase", "payment", "spent", "expense"],
        "always_include": False
    },
    "savings_accounts": {
        "collections": ["savings_accounts"],
        "keywords": ["savings", "saving", "goal", "emergency fund", "target", "apy", "interest"],
        "always_include": False
    },
    "savings_goals": {
        "collections": ["savings_goals"],
        "keywords": ["goal", "target", "saving goal", "financial goal", "milestone", "deadline"],
        "always_include": False
    },
    # Future data sources can be easily added here:
    # "investments": {
    #     "collections": ["investments"],
    #     "keywords": ["investment", "stock", "portfolio", "mutual fund"],
    #     "always_include": False
    # },
    # "loans": {
    #     "collections": ["loans"],
    #     "keywords": ["loan", "repayment", "emi", "installment"],
    #     "always_include": False
    # },
}

def extract_user_basic(user_id: ObjectId, db) -> tuple[Dict, List[str]]:
    """Extract basic user information"""
    user = db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    data = {
        "name": f"{user.get('firstName', '')} {user.get('lastName', '')}",
        "email": user.get("email"),
        "firstName": user.get("firstName"),
        "lastName": user.get("lastName"),
    }
    
    attributes = ["user.email", "user.firstName", "user.lastName"]
    
    # Add financial data if available
    if user.get("income") or user.get("creditScore"):
        data["income"] = user.get("income")
        data["creditScore"] = user.get("creditScore")
        data["employmentStatus"] = user.get("employmentStatus")
        attributes.extend(["user.income", "user.creditScore", "user.employmentStatus"])
        
        if user.get("dateOfBirth"):
            today = datetime.now()
            dob = user.get("dateOfBirth")
            if isinstance(dob, datetime):
                age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
                data["age"] = age
                attributes.append("user.dateOfBirth")
    
    return data, attributes

def extract_accounts(user_id: ObjectId, db) -> tuple[Dict, List[str]]:
    """Extract account data"""
    from services.privacy import check_attribute_permission
    
    if not check_attribute_permission(user_id, "accounts.balance", db):
        return {}, []
    
    accounts = list(db.accounts.find(
        {"userId": user_id, "status": {"$ne": "closed"}},
        {"balance": 1, "accountType": 1, "accountNumber": 1, "status": 1}
    ))
    
    if not accounts:
        return {}, []
    
    data = {
        "accounts": [
            {
                "type": acc.get("accountType"),
                "balance": acc.get("balance"),
                "accountNumber": acc.get("accountNumber"),
                "status": acc.get("status")
            }
            for acc in accounts
        ],
        "total_balance": sum(acc.get("balance", 0) for acc in accounts),
        "account_count": len(accounts)
    }
    
    attributes = [
        "accounts.balance",
        "accounts.accountType",
        "accounts.accountNumber",
        "accounts.status"
    ]
    
    return data, attributes

def extract_transactions(user_id: ObjectId, db) -> tuple[Dict, List[str]]:
    """Extract transaction data"""
    from services.privacy import check_attribute_permission
    
    if not check_attribute_permission(user_id, "transactions.amount", db):
        return {}, []
    
    six_months_ago = datetime.now() - timedelta(days=180)
    transactions = list(db.transactions.find(
        {
            "userId": user_id,
            "createdAt": {"$gte": six_months_ago},
            "status": "completed"
        },
        {"amount": 1, "category": 1, "type": 1, "description": 1, "createdAt": 1}
    ).limit(50))
    
    if not transactions:
        return {}, []
    
    categories = {}
    monthly_spending = 0
    
    for t in transactions:
        cat = t.get("category", "other")
        if cat not in categories:
            categories[cat] = 0
        categories[cat] += abs(t.get("amount", 0))
        if t.get("type") == "debit":
            monthly_spending += abs(t.get("amount", 0))
    
    data = {
        "recent_count": len(transactions),
        "monthly_spending": monthly_spending / 6,
        "categories": categories
    }
    
    attributes = [
        "transactions.amount",
        "transactions.category",
        "transactions.type",
        "transactions.description",
        "transactions.createdAt"
    ]
    
    return data, attributes

def extract_savings_accounts(user_id: ObjectId, db) -> tuple[Dict, List[str]]:
    """Extract savings accounts data"""
    from services.privacy import check_attribute_permission
    
    if not check_attribute_permission(user_id, "savings_accounts.balance", db):
        return {}, []
    
    savings_accounts = list(db.savings_accounts.find(
        {"userId": user_id},
        {"name": 1, "balance": 1, "accountType": 1, "accountNumber": 1, "apy": 1, "interestRate": 1, "monthlyGrowth": 1, "minimumBalance": 1}
    ))
    
    if not savings_accounts:
        return {}, []
    
    # Calculate monthly growth if not present
    for acc in savings_accounts:
        if "monthlyGrowth" not in acc or acc.get("monthlyGrowth") is None:
            balance = acc.get("balance", 0)
            apy = acc.get("apy", 0)
            monthly_rate = pow(1 + apy / 100, 1/12) - 1
            acc["monthlyGrowth"] = balance * monthly_rate
    
    data = {
        "savings_accounts": [
            {
                "name": acc.get("name"),
                "type": acc.get("accountType"),
                "balance": acc.get("balance"),
                "accountNumber": acc.get("accountNumber"),
                "apy": acc.get("apy"),
                "interestRate": acc.get("interestRate"),
                "monthlyGrowth": acc.get("monthlyGrowth", 0),
                "minimumBalance": acc.get("minimumBalance")
            }
            for acc in savings_accounts
        ],
        "total_savings": sum(acc.get("balance", 0) for acc in savings_accounts),
        "total_monthly_growth": sum(acc.get("monthlyGrowth", 0) for acc in savings_accounts),
        "average_apy": sum(acc.get("apy", 0) for acc in savings_accounts) / len(savings_accounts) if savings_accounts else 0,
        "savings_account_count": len(savings_accounts)
    }
    
    attributes = [
        "savings_accounts.name",
        "savings_accounts.balance",
        "savings_accounts.accountType",
        "savings_accounts.accountNumber",
        "savings_accounts.apy",
        "savings_accounts.interestRate",
        "savings_accounts.monthlyGrowth",
        "savings_accounts.minimumBalance"
    ]
    
    return data, attributes

def extract_savings_goals(user_id: ObjectId, db) -> tuple[Dict, List[str]]:
    """Extract savings goals data"""
    from services.privacy import check_attribute_permission
    
    if not check_attribute_permission(user_id, "savings_goals.targetAmount", db):
        return {}, []
    
    goals = list(db.savings_goals.find(
        {"userId": user_id},
        {"name": 1, "targetAmount": 1, "currentAmount": 1, "deadline": 1, "monthlyContribution": 1, "priority": 1, "category": 1, "status": 1}
    ))
    
    if not goals:
        return {}, []
    
    # Calculate progress and status for each goal
    for goal in goals:
        target = goal.get("targetAmount", 0)
        current = goal.get("currentAmount", 0)
        goal["progress_percentage"] = (current / target * 100) if target > 0 else 0
        goal["remaining"] = target - current
        
        # Calculate status if not present
        if "status" not in goal or not goal.get("status"):
            deadline = goal.get("deadline")
            if isinstance(deadline, str):
                deadline = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
            
            if isinstance(deadline, datetime):
                months_remaining = max(0, (deadline - datetime.now()).days / 30)
                needed_per_month = (target - current) / months_remaining if months_remaining > 0 else float('inf')
                monthly_contribution = goal.get("monthlyContribution", 0)
                
                if goal["progress_percentage"] >= 100:
                    goal["status"] = "Completed"
                elif needed_per_month <= monthly_contribution * 0.9:
                    goal["status"] = "Ahead"
                elif needed_per_month <= monthly_contribution * 1.1:
                    goal["status"] = "On Track"
                else:
                    goal["status"] = "Behind"
    
    data = {
        "savings_goals": [
            {
                "name": goal.get("name"),
                "targetAmount": goal.get("targetAmount"),
                "currentAmount": goal.get("currentAmount"),
                "deadline": goal.get("deadline").isoformat() if isinstance(goal.get("deadline"), datetime) else goal.get("deadline"),
                "monthlyContribution": goal.get("monthlyContribution"),
                "priority": goal.get("priority"),
                "category": goal.get("category"),
                "status": goal.get("status"),
                "progress_percentage": goal.get("progress_percentage"),
                "remaining": goal.get("remaining")
            }
            for goal in goals
        ],
        "total_goals": len(goals),
        "total_target": sum(g.get("targetAmount", 0) for g in goals),
        "total_current": sum(g.get("currentAmount", 0) for g in goals),
        "active_goals": len([g for g in goals if g.get("status") != "Completed"])
    }
    
    attributes = [
        "savings_goals.name",
        "savings_goals.targetAmount",
        "savings_goals.currentAmount",
        "savings_goals.deadline",
        "savings_goals.monthlyContribution",
        "savings_goals.priority",
        "savings_goals.category",
        "savings_goals.status"
    ]
    
    return data, attributes

# Map extractor names to functions
EXTRACTOR_FUNCTIONS = {
    "user": extract_user_basic,
    "accounts": extract_accounts,
    "transactions": extract_transactions,
    "savings_accounts": extract_savings_accounts,
    "savings_goals": extract_savings_goals,
}

def extract_all_relevant_data(user_id: ObjectId, query: str, db) -> tuple[Dict, List[str]]:
    """
    Intelligently extract relevant user/bank data based on query content
    Uses extensible registry system - automatically includes all relevant data sources
    Returns: (data_dict, attributes_accessed_list)
    """
    attributes_accessed = []
    data = {}
    
    query_lower = query.lower()
    
    # Determine which extractors to use based on keywords and always_include flag
    extractors_to_use = []
    
    for extractor_name, config in DATA_EXTRACTORS.items():
        if config.get("always_include", False):
            extractors_to_use.append(extractor_name)
        else:
            # Check if any keywords match
            if any(keyword in query_lower for keyword in config["keywords"]):
                extractors_to_use.append(extractor_name)
    
    # Execute extractors
    for extractor_name in extractors_to_use:
        if extractor_name in EXTRACTOR_FUNCTIONS:
            try:
                extractor_func = EXTRACTOR_FUNCTIONS[extractor_name]
                extracted_data, extracted_attributes = extractor_func(user_id, db)
                
                if extracted_data:
                    # Use the extractor name as the key (e.g., "savings_accounts", "savings_goals")
                    data[extractor_name] = extracted_data
                    attributes_accessed.extend(extracted_attributes)
            except Exception as e:
                logger.warning(f"Error extracting {extractor_name}: {e}")
                # Continue with other extractors even if one fails
    
    # Ensure user data is always included
    if "user" not in data:
        user_data, user_attrs = extract_user_basic(user_id, db)
        data["user"] = user_data
        attributes_accessed.extend(user_attrs)
    
    return data, list(set(attributes_accessed))  # Remove duplicates

def determine_query_type(query: str) -> str:
    """Determine the type of query"""
    query_lower = query.lower()
    
    if any(kw in query_lower for kw in ["loan", "borrow", "lend", "eligibility"]):
        return "loan"
    elif any(kw in query_lower for kw in ["goal", "target", "saving goal", "milestone"]):
        return "goal"
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
    Automatically determines which user/bank data is needed using extensible registry
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
3. Use the format: user.income, accounts.balance, transactions.amount, savings_accounts.balance, savings_goals.targetAmount, etc.
4. Be transparent about what data influenced your answer
5. If you're making recommendations, explain why based on the data
6. Consider ALL available data sources including savings accounts and goals when relevant"""
    
    user_prompt = f"""
User Query: {request.query}

Available Data:
{json.dumps(user_data, indent=2, default=str)}

CRITICAL: In your response, you MUST include:
1. A helpful answer to the user's question
2. An 'attributes_used' array listing ALL schema attributes from the data that influenced your response
   Format: ["user.income", "accounts.balance", "transactions.category", "savings_accounts.balance", "savings_goals.targetAmount", etc.]
3. Consider savings accounts, savings goals, and all other available data when making recommendations

Return JSON:
{{
    "response": "Your helpful response to the user",
    "attributes_used": ["user.income", "accounts.balance", "savings_accounts.balance", ...],
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
    
    # Validate attributes - check against known prefixes
    known_prefixes = ["user.", "accounts.", "transactions.", "savings_accounts.", "savings_goals.", "bank."]
    
    validated_attributes = []
    for attr in ai_reported:
        if attr in attributes_accessed:
            validated_attributes.append(attr)
        elif any(attr.startswith(prefix) for prefix in known_prefixes):
            # Valid attribute format even if not in our accessed list
            validated_attributes.append(attr)
    
    # Add any attributes we accessed but AI didn't report
    for attr in attributes_accessed:
        if attr not in validated_attributes:
            validated_attributes.append(attr)
    
    # Filter attributes based on user permissions
    final_attributes = filter_allowed_attributes(user_id, validated_attributes, db)
    
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
        "validatedAttributes": final_attributes,
        "validationStatus": "matched" if len(final_attributes) == len(attributes_accessed) else "partial",
        "timestamp": datetime.now(),
        "processingTimeMs": processing_time
    }
    
    log_result = db.ai_query_logs.insert_one(log_entry)
    query_log_id = str(log_result.inserted_id)
    
    return ChatResponse(
        response=ai_response.get("response", ""),
        attributes_used=final_attributes,
        query_type=query_type,
        confidence=ai_response.get("confidence"),
        queryLogId=query_log_id
    )
