"""
Transactions Service - All transaction management and AI analysis
"""
from fastapi import APIRouter, HTTPException, Depends, Header, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
from database import get_database
from config import settings
from openai import OpenAI
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

# Initialize OpenAI client
try:
    client = OpenAI(api_key=settings.openai_api_key)
except Exception as e:
    logger.warning(f"OpenAI client initialization failed: {e}")
    client = None

# Request/Response Models
class TransactionRequest(BaseModel):
    accountId: str = Field(..., description="Account ID")
    type: str = Field(..., description="Transaction type: debit or credit")
    amount: float = Field(..., gt=0, description="Transaction amount")
    description: str = Field(..., description="Transaction description")
    category: str = Field(..., description="Transaction category")
    merchantName: Optional[str] = Field(None, description="Merchant name")
    merchantCategory: Optional[str] = Field(None, description="Merchant category")
    currency: str = Field(default="INR", description="Currency code")

class TransactionResponse(BaseModel):
    id: str
    accountId: str
    userId: str
    type: str
    amount: float
    currency: str
    description: str
    category: str
    merchantName: Optional[str] = None
    merchantCategory: Optional[str] = None
    status: str
    aiAnalysis: Optional[Dict[str, Any]] = None
    createdAt: str
    updatedAt: str

class TransactionRecommendation(BaseModel):
    insight: str
    recommendation: str
    potentialSavings: Optional[float] = None
    category: str
    priority: str  # high, medium, low

def get_user_from_clerk_id(clerk_id: str, db):
    """Get user from MongoDB using Clerk ID"""
    user = db.users.find_one({"clerkId": clerk_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

async def analyze_transaction_with_ai(transaction_data: Dict, user_data: Dict, db) -> Dict:
    """Analyze transaction with AI for fraud detection and categorization"""
    if not client:
        return {
            "fraudScore": 0.1,
            "riskLevel": "low",
            "categoryConfidence": 0.8,
            "anomalyScore": 0.0,
            "explanation": "AI analysis unavailable"
        }
    
    try:
        # Get user's recent transaction patterns
        six_months_ago = datetime.now() - timedelta(days=180)
        recent_transactions = list(db.transactions.find(
            {
                "userId": user_data["userId"],
                "createdAt": {"$gte": six_months_ago}
            },
            {"amount": 1, "category": 1, "type": 1, "merchantName": 1}
        ).limit(50))
        
        avg_amount = sum(t.get("amount", 0) for t in recent_transactions) / len(recent_transactions) if recent_transactions else 0
        common_categories = {}
        for t in recent_transactions:
            cat = t.get("category", "other")
            common_categories[cat] = common_categories.get(cat, 0) + 1
        
        prompt = f"""
        Analyze this transaction for fraud risk and provide insights:
        
        Transaction:
        - Amount: {transaction_data['amount']}
        - Type: {transaction_data['type']}
        - Description: {transaction_data['description']}
        - Category: {transaction_data['category']}
        - Merchant: {transaction_data.get('merchantName', 'Unknown')}
        
        User's Typical Patterns:
        - Average transaction amount: {avg_amount:.2f}
        - Common categories: {json.dumps(common_categories, indent=2)}
        
        Analyze:
        1. Fraud risk score (0-1, where 0 is safe and 1 is highly suspicious)
        2. Risk level (low, medium, high)
        3. Category confidence (0-1)
        4. Anomaly score (0-1) - how unusual this transaction is
        5. Brief explanation
        
        Return JSON:
        {{
            "fraudScore": 0.0-1.0,
            "riskLevel": "low|medium|high",
            "categoryConfidence": 0.0-1.0,
            "anomalyScore": 0.0-1.0,
            "explanation": "Brief explanation of the analysis"
        }}
        """
        
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "You are a fraud detection AI. Analyze transactions for suspicious activity."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        ai_result = json.loads(response.choices[0].message.content)
        return ai_result
    
    except Exception as e:
        logger.error(f"AI analysis error: {e}")
        return {
            "fraudScore": 0.1,
            "riskLevel": "low",
            "categoryConfidence": 0.8,
            "anomalyScore": 0.0,
            "explanation": f"Analysis error: {str(e)}"
        }

async def get_transaction_recommendations(user_id: ObjectId, db) -> List[TransactionRecommendation]:
    """Get AI-powered recommendations based on transaction patterns"""
    if not client:
        return []
    
    try:
        # Get transaction data
        six_months_ago = datetime.now() - timedelta(days=180)
        transactions = list(db.transactions.find(
            {
                "userId": user_id,
                "createdAt": {"$gte": six_months_ago},
                "status": "completed"
            },
            {"amount": 1, "category": 1, "type": 1, "description": 1, "createdAt": 1}
        ).limit(100))
        
        if not transactions:
            return []
        
        # Calculate spending patterns
        monthly_spending = {}
        category_spending = {}
        
        for t in transactions:
            if t.get("type") == "debit":
                month = t.get("createdAt", datetime.now()).strftime("%Y-%m")
                monthly_spending[month] = monthly_spending.get(month, 0) + t.get("amount", 0)
                cat = t.get("category", "other")
                category_spending[cat] = category_spending.get(cat, 0) + t.get("amount", 0)
        
        total_spending = sum(monthly_spending.values())
        avg_monthly = total_spending / len(monthly_spending) if monthly_spending else 0
        
        prompt = f"""
        Analyze this user's spending patterns and provide actionable recommendations:
        
        Spending Data:
        - Total spending (6 months): {total_spending:.2f}
        - Average monthly spending: {avg_monthly:.2f}
        - Category breakdown: {json.dumps(category_spending, indent=2)}
        - Monthly trends: {json.dumps(monthly_spending, indent=2)}
        
        Provide 3-5 specific, actionable recommendations to help save money and improve financial health.
        Focus on:
        1. Spending reduction opportunities
        2. Category-specific insights
        3. Behavioral patterns
        
        Return JSON:
        {{
            "recommendations": [
                {{
                    "insight": "What pattern you noticed",
                    "recommendation": "Specific actionable advice",
                    "potentialSavings": 0.00,
                    "category": "category_name",
                    "priority": "high|medium|low"
                }}
            ]
        }}
        """
        
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "You are a financial advisor AI. Provide specific, actionable recommendations."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        ai_result = json.loads(response.choices[0].message.content)
        recommendations = []
        
        for rec in ai_result.get("recommendations", []):
            recommendations.append(TransactionRecommendation(
                insight=rec.get("insight", ""),
                recommendation=rec.get("recommendation", ""),
                potentialSavings=rec.get("potentialSavings"),
                category=rec.get("category", "general"),
                priority=rec.get("priority", "medium")
            ))
        
        return recommendations
    
    except Exception as e:
        logger.error(f"Recommendation generation error: {e}")
        return []

# Transaction Endpoints
@router.get("", response_model=List[TransactionResponse])
async def get_transactions(
    accountId: Optional[str] = Query(None, description="Filter by account ID"),
    type: Optional[str] = Query(None, description="Filter by type: debit or credit"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(100, ge=1, le=500),
    skip: int = Query(0, ge=0),
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Get all transactions for the user"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    query = {"userId": user_id}
    
    if accountId:
        query["accountId"] = ObjectId(accountId)
    
    if type:
        query["type"] = type
    
    if category:
        query["category"] = category
    
    transactions = list(db.transactions.find(query)
                       .sort("createdAt", -1)
                       .limit(limit)
                       .skip(skip))
    
    result = []
    for txn in transactions:
        result.append(TransactionResponse(
            id=str(txn["_id"]),
            accountId=str(txn["accountId"]),
            userId=str(txn["userId"]),
            type=txn.get("type", ""),
            amount=txn.get("amount", 0),
            currency=txn.get("currency", "INR"),
            description=txn.get("description", ""),
            category=txn.get("category", ""),
            merchantName=txn.get("merchantName"),
            merchantCategory=txn.get("merchantCategory"),
            status=txn.get("status", "completed"),
            aiAnalysis=txn.get("aiAnalysis"),
            createdAt=txn.get("createdAt", datetime.now()).isoformat(),
            updatedAt=txn.get("updatedAt", datetime.now()).isoformat()
        ))
    
    return result

@router.post("", response_model=TransactionResponse)
async def create_transaction(
    transaction_data: TransactionRequest,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Create a new transaction with AI analysis"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    # Verify account exists and belongs to user
    account = db.accounts.find_one({
        "_id": ObjectId(transaction_data.accountId),
        "userId": user_id
    })
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Validate transaction type
    if transaction_data.type not in ["debit", "credit"]:
        raise HTTPException(status_code=400, detail="Transaction type must be 'debit' or 'credit'")
    
    # Prepare transaction data
    new_transaction = {
        "accountId": ObjectId(transaction_data.accountId),
        "userId": user_id,
        "type": transaction_data.type,
        "amount": transaction_data.amount,
        "currency": transaction_data.currency,
        "description": transaction_data.description,
        "category": transaction_data.category,
        "merchantName": transaction_data.merchantName,
        "merchantCategory": transaction_data.merchantCategory,
        "status": "completed",
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    }
    
    # Analyze with AI
    user_data = {
        "userId": user_id,
        "income": user.get("income"),
        "creditScore": user.get("creditScore")
    }
    
    ai_analysis = await analyze_transaction_with_ai(
        {
            "amount": transaction_data.amount,
            "type": transaction_data.type,
            "description": transaction_data.description,
            "category": transaction_data.category,
            "merchantName": transaction_data.merchantName or ""
        },
        user_data,
        db
    )
    
    new_transaction["aiAnalysis"] = ai_analysis
    
    # Update account balance
    current_balance = account.get("balance", 0)
    if transaction_data.type == "credit":
        new_balance = current_balance + transaction_data.amount
    else:  # debit
        new_balance = current_balance - transaction_data.amount
        # Check for overdraft
        if new_balance < 0:
            min_balance = account.get("metadata", {}).get("minimumBalance", 0)
            if new_balance < -min_balance:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient balance. Available: ₹{current_balance:,.2f}"
                )
    
    # Insert transaction
    result = db.transactions.insert_one(new_transaction)
    new_transaction["_id"] = result.inserted_id
    
    # Update account balance
    db.accounts.update_one(
        {"_id": ObjectId(transaction_data.accountId)},
        {"$set": {"balance": new_balance, "updatedAt": datetime.now()}}
    )
    
    # Also update savings_accounts if this is a savings account
    savings_account = db.savings_accounts.find_one({"accountNumber": account.get("accountNumber")})
    if savings_account:
        db.savings_accounts.update_one(
            {"accountNumber": account.get("accountNumber")},
            {"$set": {"balance": new_balance, "updatedAt": datetime.now()}}
        )
    
    return TransactionResponse(
        id=str(new_transaction["_id"]),
        accountId=str(new_transaction["accountId"]),
        userId=str(new_transaction["userId"]),
        type=new_transaction["type"],
        amount=new_transaction["amount"],
        currency=new_transaction["currency"],
        description=new_transaction["description"],
        category=new_transaction["category"],
        merchantName=new_transaction.get("merchantName"),
        merchantCategory=new_transaction.get("merchantCategory"),
        status=new_transaction["status"],
        aiAnalysis=new_transaction.get("aiAnalysis"),
        createdAt=new_transaction["createdAt"].isoformat(),
        updatedAt=new_transaction["updatedAt"].isoformat()
    )

@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: str,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Get a specific transaction"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    transaction = db.transactions.find_one({
        "_id": ObjectId(transaction_id),
        "userId": user_id
    })
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return TransactionResponse(
        id=str(transaction["_id"]),
        accountId=str(transaction["accountId"]),
        userId=str(transaction["userId"]),
        type=transaction.get("type", ""),
        amount=transaction.get("amount", 0),
        currency=transaction.get("currency", "INR"),
        description=transaction.get("description", ""),
        category=transaction.get("category", ""),
        merchantName=transaction.get("merchantName"),
        merchantCategory=transaction.get("merchantCategory"),
        status=transaction.get("status", "completed"),
        aiAnalysis=transaction.get("aiAnalysis"),
        createdAt=transaction.get("createdAt", datetime.now()).isoformat(),
        updatedAt=transaction.get("updatedAt", datetime.now()).isoformat()
    )

@router.get("/summary/stats")
async def get_transaction_stats(
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Get transaction statistics"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    # Get last 30 days
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    transactions = list(db.transactions.find({
        "userId": user_id,
        "createdAt": {"$gte": thirty_days_ago},
        "status": "completed"
    }))
    
    total_spent = sum(t.get("amount", 0) for t in transactions if t.get("type") == "debit")
    total_received = sum(t.get("amount", 0) for t in transactions if t.get("type") == "credit")
    
    flagged_count = sum(1 for t in transactions if t.get("aiAnalysis", {}).get("riskLevel") in ["medium", "high"])
    
    category_breakdown = {}
    for t in transactions:
        if t.get("type") == "debit":
            cat = t.get("category", "other")
            category_breakdown[cat] = category_breakdown.get(cat, 0) + t.get("amount", 0)
    
    return {
        "totalTransactions": len(transactions),
        "totalSpent": round(total_spent, 2),
        "totalReceived": round(total_received, 2),
        "flaggedCount": flagged_count,
        "categoryBreakdown": category_breakdown
    }

@router.get("/recommendations/insights")
async def get_transaction_recommendations(
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Get AI-powered transaction recommendations"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    recommendations = await get_transaction_recommendations(user_id, db)
    
    return {
        "recommendations": [
            {
                "insight": rec.insight,
                "recommendation": rec.recommendation,
                "potentialSavings": rec.potentialSavings,
                "category": rec.category,
                "priority": rec.priority
            }
            for rec in recommendations
        ]
    }

@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: str,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Delete a transaction (reverse the balance change)"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    transaction = db.transactions.find_one({
        "_id": ObjectId(transaction_id),
        "userId": user_id
    })
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Reverse the balance change
    account = db.accounts.find_one({"_id": transaction["accountId"]})
    if account:
        current_balance = account.get("balance", 0)
        amount = transaction.get("amount", 0)
        
        if transaction.get("type") == "credit":
            new_balance = current_balance - amount  # Reverse credit
        else:  # debit
            new_balance = current_balance + amount  # Reverse debit
        
        db.accounts.update_one(
            {"_id": transaction["accountId"]},
            {"$set": {"balance": new_balance, "updatedAt": datetime.now()}}
        )
        
        # Also update savings_accounts if applicable
        savings_account = db.savings_accounts.find_one({"accountNumber": account.get("accountNumber")})
        if savings_account:
            db.savings_accounts.update_one(
                {"accountNumber": account.get("accountNumber")},
                {"$set": {"balance": new_balance, "updatedAt": datetime.now()}}
            )
    
    # Delete transaction
    db.transactions.delete_one({"_id": ObjectId(transaction_id)})
    
    return {"success": True, "message": "Transaction deleted successfully"}

