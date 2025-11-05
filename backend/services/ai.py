"""
AI Service - Loan eligibility and profile explanation with attribute tracking
Hybrid Approach: Two-Step Process + MongoDB Query Logging
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

router = APIRouter(prefix="/api/ai", tags=["ai"])

# Initialize OpenAI client
try:
    client = OpenAI(api_key=settings.openai_api_key)
except Exception as e:
    logger.warning(f"OpenAI client initialization failed: {e}")
    client = None

# Request/Response Models
class LoanEligibilityRequest(BaseModel):
    loanAmount: float = Field(..., gt=0, description="Loan amount in INR")
    loanType: str = Field(default="personal", description="Type of loan")
    purpose: Optional[str] = Field(None, description="Purpose of loan")

class Factor(BaseModel):
    name: str
    value: Any
    weight: float = Field(..., ge=0, le=1)
    impact: str = Field(..., pattern="^(positive|negative|neutral)$")
    reason: str

class LoanEligibilityResponse(BaseModel):
    decision: str = Field(..., pattern="^(approved|denied|requires_review)$")
    confidence: float = Field(..., ge=0, le=1)
    explanation: str
    attributes_used: List[str]
    factors: List[Factor]
    queryLogId: Optional[str] = None
    viewDetailsUrl: Optional[str] = None

class ExplainProfileRequest(BaseModel):
    aspects: Optional[List[str]] = Field(None, description="Specific aspects to explain")

class ProfileExplanationResponse(BaseModel):
    profile_summary: str
    ai_insights: Dict[str, Any]
    attributes_analyzed: List[str]
    recommendations: List[str]
    queryLogId: Optional[str] = None

def get_user_from_clerk_id(clerk_id: str, db):
    """Get user from MongoDB using Clerk ID"""
    user = db.users.find_one({"clerkId": clerk_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def calculate_age(date_of_birth: datetime) -> Optional[int]:
    """Calculate age from date of birth"""
    if not date_of_birth:
        return None
    today = datetime.now()
    age = today.year - date_of_birth.year - ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))
    return age

def map_queries_to_attributes(queries: List[Dict]) -> List[str]:
    """Map MongoDB queries to schema attributes"""
    attributes = []
    collection_map = {
        "users": "user",
        "accounts": "accounts",
        "transactions": "transactions",
        "savings_accounts": "savings_accounts",
        "savings_goals": "savings_goals"
    }
    
    for query in queries:
        collection = query.get("collection", "")
        projection = query.get("projection", {})
        
        if collection in collection_map:
            prefix = collection_map[collection]
            for field in projection.keys():
                attributes.append(f"{prefix}.{field}")
    
    return list(set(attributes))

def extract_user_data_for_loan(user_id: ObjectId, db) -> tuple[Dict, List[str]]:
    """
    Step 1: Extract relevant user data for loan eligibility
    Returns: (user_data_dict, attributes_accessed_list)
    """
    attributes_accessed = []
    user_data = {}
    
    # Fetch user data
    user = db.users.find_one(
        {"_id": user_id},
        {
            "dateOfBirth": 1,
            "income": 1,
            "creditScore": 1,
            "employmentStatus": 1,
            "firstName": 1,
            "lastName": 1
        }
    )
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Track attributes accessed
    attributes_accessed.extend([
        "user.dateOfBirth",
        "user.income",
        "user.creditScore",
        "user.employmentStatus"
    ])
    
    # Calculate age
    if user.get("dateOfBirth"):
        user_data["age"] = calculate_age(user["dateOfBirth"])
    else:
        user_data["age"] = None
    
    user_data["income"] = user.get("income")
    user_data["credit_score"] = user.get("creditScore")
    user_data["employment_status"] = user.get("employmentStatus", "unknown")
    user_data["name"] = f"{user.get('firstName', '')} {user.get('lastName', '')}"
    
    # Fetch accounts
    accounts = list(db.accounts.find(
        {"userId": user_id, "status": {"$ne": "closed"}},
        {"balance": 1, "accountType": 1, "status": 1}
    ))
    
    attributes_accessed.extend([
        "accounts.balance",
        "accounts.accountType",
        "accounts.status"
    ])
    
    user_data["total_balance"] = sum(acc.get("balance", 0) for acc in accounts)
    user_data["account_types"] = [acc.get("accountType") for acc in accounts]
    user_data["active_accounts_count"] = len([acc for acc in accounts if acc.get("status") == "active"])
    
    # Fetch recent transactions (last 6 months)
    six_months_ago = datetime.now() - timedelta(days=180)
    
    transactions = list(db.transactions.find(
        {
            "userId": user_id,
            "createdAt": {"$gte": six_months_ago},
            "status": "completed"
        },
        {"amount": 1, "category": 1, "type": 1, "createdAt": 1}
    ).limit(100))
    
    attributes_accessed.extend([
        "transactions.amount",
        "transactions.category",
        "transactions.type",
        "transactions.createdAt"
    ])
    
    # Calculate monthly spending
    debit_transactions = [t for t in transactions if t.get("type") == "debit"]
    monthly_spending = sum(t.get("amount", 0) for t in debit_transactions) / 6 if transactions else 0
    
    user_data["monthly_spending"] = monthly_spending
    user_data["recent_transactions_count"] = len(transactions)
    
    # Fetch savings accounts (relevant for loan eligibility - shows financial stability)
    savings_accounts = list(db.savings_accounts.find(
        {"userId": user_id},
        {"balance": 1, "accountType": 1, "apy": 1}
    ))
    
    if savings_accounts:
        user_data["total_savings"] = sum(acc.get("balance", 0) for acc in savings_accounts)
        user_data["savings_account_count"] = len(savings_accounts)
        attributes_accessed.extend([
            "savings_accounts.balance",
            "savings_accounts.accountType"
        ])
    
    # Fetch savings goals (shows financial planning and discipline)
    savings_goals = list(db.savings_goals.find(
        {"userId": user_id},
        {"targetAmount": 1, "currentAmount": 1, "monthlyContribution": 1, "status": 1}
    ))
    
    if savings_goals:
        user_data["active_savings_goals"] = len([g for g in savings_goals if g.get("status") != "Completed"])
        user_data["total_goal_targets"] = sum(g.get("targetAmount", 0) for g in savings_goals)
        user_data["total_goal_current"] = sum(g.get("currentAmount", 0) for g in savings_goals)
        user_data["total_monthly_contributions"] = sum(g.get("monthlyContribution", 0) for g in savings_goals)
        attributes_accessed.extend([
            "savings_goals.targetAmount",
            "savings_goals.currentAmount",
            "savings_goals.monthlyContribution",
            "savings_goals.status"
        ])
    
    return user_data, list(set(attributes_accessed))

async def call_openai_for_loan_eligibility(user_data: Dict, loan_amount: float, loan_type: str) -> Dict:
    """
    Step 2: Call OpenAI with structured JSON output
    """
    prompt = f"""
    You are a loan eligibility assessor for EthicalBank, a transparent AI banking platform.
    
    User Data:
    {json.dumps(user_data, indent=2, default=str)}
    
    Loan Request:
    - Amount: ₹{loan_amount:,.0f}
    - Type: {loan_type}
    
    CRITICAL REQUIREMENTS:
    1. Analyze the user data and make a decision (approved/denied/requires_review)
    2. Provide confidence score (0-1)
    3. Explain your decision in clear, natural language that a customer can understand
    4. List ALL schema attributes you used in your analysis in 'attributes_used' array
       Use format: user.income, accounts.balance, transactions.amount, savings_accounts.balance, savings_goals.monthlyContribution, etc.
       Consider savings accounts and goals as they indicate financial stability and planning discipline.
    5. Break down factors with weights and impacts
    
    Return JSON with this exact structure:
    {{
        "decision": "approved|denied|requires_review",
        "confidence": 0.0-1.0,
        "explanation": "Clear explanation",
        "attributes_used": ["user.income", "user.creditScore", ...],
        "factors": [
            {{
                "name": "Credit Score",
                "value": 750,
                "weight": 0.3,
                "impact": "positive",
                "reason": "Excellent credit score"
            }},
            ...
        ]
    }}
    """
    
    if not client:
        raise HTTPException(status_code=500, detail="OpenAI client not initialized")
    
    try:
        # Try structured outputs (beta feature)
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a transparent AI loan assessor. Always report which attributes you use."
                },
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
    
    except Exception as e:
        logger.warning(f"Structured outputs not available, using JSON mode: {e}")
        # Fallback to JSON mode
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "You are a transparent AI loan assessor. Always report which attributes you use."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)

def validate_attributes(ai_reported: List[str], actually_accessed: List[str]) -> tuple[List[str], str]:
    """Cross-validate AI-reported attributes with actual queries"""
    matched = [attr for attr in ai_reported if attr in actually_accessed]
    unmatched = [attr for attr in ai_reported if attr not in actually_accessed]
    missing = [attr for attr in actually_accessed if attr not in ai_reported]
    
    if len(matched) == len(actually_accessed) and len(unmatched) == 0:
        status = "matched"
    elif len(matched) > 0:
        status = "partial"
    else:
        status = "mismatch"
    
    validated = matched + missing  # Include all actually accessed
    return validated, status

@router.post("/loan-eligibility", response_model=LoanEligibilityResponse)
async def check_loan_eligibility(
    request: LoanEligibilityRequest,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Check loan eligibility with full attribute tracking"""
    start_time = time.time()
    
    # Get user
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    # Step 1: Extract user data
    user_data, attributes_accessed = extract_user_data_for_loan(user_id, db)
    
    # Get query logs from MongoDB monitoring (if available)
    try:
        from database import get_query_logger
        query_logger = get_query_logger()
        mongo_queries = query_logger.queries.copy()
        query_logger.reset()
    except Exception as e:
        logger.warning(f"Could not get query logger: {e}")
        mongo_queries = []
    
    # Step 2: Call OpenAI
    ai_response = await call_openai_for_loan_eligibility(
        user_data,
        request.loanAmount,
        request.loanType
    )
    
    # Step 3: Validate attributes
    ai_reported = ai_response.get("attributes_used", [])
    validated_attributes, validation_status = validate_attributes(ai_reported, attributes_accessed)
    
    processing_time = (time.time() - start_time) * 1000
    
    # Step 4: Log to MongoDB
    log_entry = {
        "userId": user_id,
        "queryType": "loan_eligibility",
        "queryText": f"Am I eligible for ₹{request.loanAmount:,.0f} {request.loanType} loan?",
        "loanAmount": request.loanAmount,
        "mongoQueries": mongo_queries,
        "attributesAccessed": attributes_accessed,
        "userDataSnapshot": user_data,
        "aiModel": settings.openai_model,
        "aiResponse": ai_response,
        "aiReportedAttributes": ai_reported,
        "validatedAttributes": validated_attributes,
        "validationStatus": validation_status,
        "timestamp": datetime.now(),
        "processingTimeMs": processing_time
    }
    
    log_result = db.ai_query_logs.insert_one(log_entry)
    query_log_id = str(log_result.inserted_id)
    
    # Safely parse factors - handle different formats from AI
    factors_list = []
    try:
        factors_raw = ai_response.get("factors", [])
        if isinstance(factors_raw, list):
            for f in factors_raw:
                if isinstance(f, dict):
                    # Try to create Factor object
                    try:
                        factors_list.append(Factor(**f))
                    except Exception as e:
                        logger.warning(f"Failed to parse factor: {f}, error: {e}")
                        # Create a default factor if parsing fails
                        factors_list.append(Factor(
                            name=f.get("name", "Unknown"),
                            value=f.get("value", ""),
                            weight=f.get("weight", 0.0),
                            impact=f.get("impact", "neutral"),
                            reason=f.get("reason", "")
                        ))
    except Exception as e:
        logger.warning(f"Failed to parse factors: {e}")
        factors_list = []
    
    return LoanEligibilityResponse(
        decision=ai_response.get("decision", "requires_review"),
        confidence=ai_response.get("confidence", 0.5),
        explanation=ai_response.get("explanation", ""),
        attributes_used=validated_attributes,
        factors=factors_list,
        queryLogId=query_log_id,
        viewDetailsUrl=f"/api/ai/query-logs/{query_log_id}"
    )

@router.post("/explain-profile", response_model=ProfileExplanationResponse)
async def explain_profile(
    request: ExplainProfileRequest,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Explain user profile with AI insights"""
    start_time = time.time()
    
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    # Extract comprehensive profile data
    try:
        from database import get_query_logger
        query_logger = get_query_logger()
        query_logger.reset()
        mongo_queries = []
    except Exception as e:
        logger.warning(f"Could not get query logger: {e}")
        mongo_queries = []
    
    # Get user profile
    user_profile = db.users.find_one({"_id": user_id})
    attributes_analyzed = ["user.email", "user.firstName", "user.lastName"]
    
    if user_profile.get("dateOfBirth"):
        attributes_analyzed.append("user.dateOfBirth")
        user_profile["age"] = calculate_age(user_profile["dateOfBirth"])
    if user_profile.get("income"):
        attributes_analyzed.append("user.income")
    if user_profile.get("creditScore"):
        attributes_analyzed.append("user.creditScore")
    if user_profile.get("employmentStatus"):
        attributes_analyzed.append("user.employmentStatus")
    
    # Get accounts
    accounts = list(db.accounts.find({"userId": user_id}))
    if accounts:
        attributes_analyzed.extend(["accounts.balance", "accounts.accountType"])
        user_profile["account_summary"] = {
            "total_balance": sum(acc.get("balance", 0) for acc in accounts),
            "account_count": len(accounts),
            "account_types": [acc.get("accountType") for acc in accounts]
        }
    
    # Get transaction summary
    six_months_ago = datetime.now() - timedelta(days=180)
    transactions = list(db.transactions.find(
        {"userId": user_id, "createdAt": {"$gte": six_months_ago}},
        {"amount": 1, "category": 1, "type": 1}
    ).limit(100))
    
    if transactions:
        attributes_analyzed.extend(["transactions.amount", "transactions.category"])
        user_profile["transaction_summary"] = {
            "total_transactions": len(transactions),
            "monthly_spending": sum(t.get("amount", 0) for t in transactions if t.get("type") == "debit") / 6,
            "top_categories": {}
        }
    
    # Get savings accounts
    savings_accounts = list(db.savings_accounts.find({"userId": user_id}))
    if savings_accounts:
        attributes_analyzed.extend([
            "savings_accounts.balance",
            "savings_accounts.accountType",
            "savings_accounts.apy"
        ])
        user_profile["savings_summary"] = {
            "total_savings": sum(acc.get("balance", 0) for acc in savings_accounts),
            "savings_account_count": len(savings_accounts),
            "average_apy": sum(acc.get("apy", 0) for acc in savings_accounts) / len(savings_accounts) if savings_accounts else 0
        }
    
    # Get savings goals
    savings_goals = list(db.savings_goals.find({"userId": user_id}))
    if savings_goals:
        attributes_analyzed.extend([
            "savings_goals.targetAmount",
            "savings_goals.currentAmount",
            "savings_goals.monthlyContribution",
            "savings_goals.status"
        ])
        user_profile["goals_summary"] = {
            "active_goals": len([g for g in savings_goals if g.get("status") != "Completed"]),
            "total_targets": sum(g.get("targetAmount", 0) for g in savings_goals),
            "total_current": sum(g.get("currentAmount", 0) for g in savings_goals),
            "total_monthly_contributions": sum(g.get("monthlyContribution", 0) for g in savings_goals)
        }
    
    # Call OpenAI for profile explanation
    aspects_text = f" Focus on: {', '.join(request.aspects)}" if request.aspects else ""
    
    if not client:
        raise HTTPException(status_code=500, detail="OpenAI client not initialized")
    
    prompt = f"""
    Analyze this user's banking profile and provide insights:
    
    {json.dumps(user_profile, indent=2, default=str)}{aspects_text}
    
    Provide:
    1. A summary of their profile
    2. AI insights about their financial behavior
    3. Recommendations for improvement
    
    Return JSON:
    {{
        "profile_summary": "...",
        "ai_insights": {{
            "financial_health": "...",
            "spending_patterns": "...",
            "risk_assessment": "..."
        }},
        "recommendations": ["...", "..."]
    }}
    """
    
    response = client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": "You are a transparent AI banking advisor."},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"}
    )
    
    ai_response = json.loads(response.choices[0].message.content)
    
    processing_time = (time.time() - start_time) * 1000
    
    # Log query
    log_entry = {
        "userId": user_id,
        "queryType": "profile_explanation",
        "queryText": f"Explain my profile{aspects_text}",
        "mongoQueries": mongo_queries,
        "attributesAccessed": attributes_analyzed,
        "userDataSnapshot": user_profile,
        "aiModel": settings.openai_model,
        "aiResponse": ai_response,
        "timestamp": datetime.now(),
        "processingTimeMs": processing_time
    }
    
    log_result = db.ai_query_logs.insert_one(log_entry)
    query_log_id = str(log_result.inserted_id)
    
    return ProfileExplanationResponse(
        profile_summary=ai_response.get("profile_summary", ""),
        ai_insights=ai_response.get("ai_insights", {}),
        attributes_analyzed=attributes_analyzed,
        recommendations=ai_response.get("recommendations", []),
        queryLogId=query_log_id
    )

@router.get("/query-logs")
async def list_query_logs(
    limit: int = 50,
    skip: int = 0,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """List all AI query logs for the current user"""
    try:
        user = get_user_from_clerk_id(x_clerk_user_id, db)
        user_id = user["_id"]
        
        logs = list(db.ai_query_logs.find(
            {"userId": user_id}
        ).sort("timestamp", -1).limit(limit).skip(skip))
        
        total = db.ai_query_logs.count_documents({"userId": user_id})
        
        # Convert ObjectIds and datetime to strings
        for log in logs:
            log["_id"] = str(log["_id"])
            log["userId"] = str(log["userId"])
            if log.get("timestamp"):
                log["timestamp"] = log["timestamp"].isoformat()
        
        return {
            "logs": logs,
            "total": total,
            "limit": limit,
            "skip": skip
        }
    except Exception as e:
        logger.error(f"Error listing query logs: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/query-logs/{log_id}")
async def get_query_log(log_id: str, x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"), db = Depends(get_database)):
    """Get AI query log details"""
    try:
        log_entry = db.ai_query_logs.find_one({
            "_id": ObjectId(log_id),
            "userId": get_user_from_clerk_id(x_clerk_user_id, db)["_id"]
        })
        
        if not log_entry:
            raise HTTPException(status_code=404, detail="Log not found")
        
        log_entry["_id"] = str(log_entry["_id"])
        log_entry["userId"] = str(log_entry["userId"])
        if log_entry.get("timestamp"):
            log_entry["timestamp"] = log_entry["timestamp"].isoformat()
        
        return log_entry
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

