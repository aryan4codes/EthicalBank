"""
AI Insights Service - Comprehensive financial insights and planning
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
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai-insights", tags=["ai-insights"])

# Initialize OpenAI client
try:
    client = OpenAI(api_key=settings.openai_api_key)
except Exception as e:
    logger.warning(f"OpenAI client initialization failed: {e}")
    client = None

# Response Models
class SpendingCategory(BaseModel):
    category: str
    amount: float
    percentage: float
    trend: str  # increasing, decreasing, stable
    averageSpending: float
    recommendation: Optional[str] = None

class WasteAnalysis(BaseModel):
    category: str
    wastedAmount: float
    reason: str
    monthlyImpact: float
    recommendation: str

class FinancialPlan(BaseModel):
    title: str
    description: str
    timeframe: str  # short-term, medium-term, long-term
    priority: str  # high, medium, low
    steps: List[str]
    expectedOutcome: str
    attributes_used: List[str]

class FinancialPlanningResponse(BaseModel):
    summary: str
    plans: List[FinancialPlan]
    attributes_used: List[str]

class SpendingAnalysisResponse(BaseModel):
    totalSpending: float
    monthlyAverage: float
    categories: List[SpendingCategory]
    wasteAnalysis: List[WasteAnalysis]
    attributes_used: List[str]

class ComprehensiveInsightsResponse(BaseModel):
    profileSummary: Dict[str, Any]
    financialPlanning: FinancialPlanningResponse
    spendingAnalysis: SpendingAnalysisResponse
    healthScore: Dict[str, Any]
    attributes_used: List[str]

def get_user_from_clerk_id(clerk_id: str, db):
    """Get user from MongoDB using Clerk ID"""
    user = db.users.find_one({"clerkId": clerk_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

async def analyze_spending_patterns(user_id: ObjectId, db) -> SpendingAnalysisResponse:
    """Analyze spending patterns and identify waste"""
    if not client:
        return SpendingAnalysisResponse(
            totalSpending=0,
            monthlyAverage=0,
            categories=[],
            wasteAnalysis=[],
            attributes_used=[]
        )
    
    try:
        # Get transactions
        six_months_ago = datetime.now() - timedelta(days=180)
        transactions = list(db.transactions.find(
            {
                "userId": user_id,
                "createdAt": {"$gte": six_months_ago},
                "type": "debit",
                "status": "completed"
            },
            {"amount": 1, "category": 1, "description": 1, "createdAt": 1}
        ).limit(200))
        
        # Get user profile
        user = db.users.find_one({"_id": user_id})
        income = user.get("income", 0)
        monthly_income = income / 12 if income > 0 else 0
        
        attributes_used = ["transactions.amount", "transactions.category", "transactions.description"]
        if income:
            attributes_used.append("user.income")
        
        # Calculate category spending
        category_spending = {}
        for t in transactions:
            cat = t.get("category", "other")
            category_spending[cat] = category_spending.get(cat, 0) + t.get("amount", 0)
        
        total_spending = sum(category_spending.values())
        monthly_average = total_spending / 6 if transactions else 0
        
        # If no transactions, return empty but valid response
        if not transactions or total_spending == 0:
            # Create default categories from available data
            categories_list = []
            waste_analysis_list = []
            
            # Still return attributes that were considered
            return SpendingAnalysisResponse(
                totalSpending=0,
                monthlyAverage=0,
                categories=categories_list,
                wasteAnalysis=waste_analysis_list,
                attributes_used=filter_allowed_attributes(user_id, attributes_used, db)
            )
        
        prompt = f"""
        Analyze this user's spending patterns and identify waste:
        
        Monthly Income: ₹{monthly_income:,.2f}
        Total Spending (6 months): ₹{total_spending:,.2f}
        Monthly Average Spending: ₹{monthly_average:,.2f}
        
        Category Breakdown:
        {json.dumps(category_spending, indent=2)}
        
        Analyze:
        1. Provide a breakdown for EACH category showing amount, percentage, trend, and average spending
        2. Identify categories with excessive spending or waste
        3. Compare spending to income ratios
        4. Find patterns that indicate wasteful spending
        5. Provide specific recommendations for each category
        
        IMPORTANT: Return ALL categories from the breakdown, not just problematic ones.
        
        Return JSON:
        {{
            "categories": [
                {{
                    "category": "category_name",
                    "amount": 0.0,
                    "percentage": 0.0,
                    "trend": "increasing|decreasing|stable",
                    "averageSpending": 0.0,
                    "recommendation": "Specific advice or null if no recommendation"
                }}
            ],
            "wasteAnalysis": [
                {{
                    "category": "category_name",
                    "wastedAmount": 0.0,
                    "reason": "Why this is wasteful",
                    "monthlyImpact": 0.0,
                    "recommendation": "How to reduce waste"
                }}
            ],
            "attributes_used": ["transactions.amount", "transactions.category", "user.income"]
        }}
        """
        
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "You are a financial advisor AI. Analyze spending patterns and identify wasteful spending with specific recommendations."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        ai_result = json.loads(response.choices[0].message.content)
        
        categories = [
            SpendingCategory(**cat) for cat in ai_result.get("categories", [])
        ]
        
        waste_analysis = [
            WasteAnalysis(**waste) for waste in ai_result.get("wasteAnalysis", [])
        ]
        
        return SpendingAnalysisResponse(
            totalSpending=round(total_spending, 2),
            monthlyAverage=round(monthly_average, 2),
            categories=categories,
            wasteAnalysis=waste_analysis,
            attributes_used=filter_allowed_attributes(user_id, ai_result.get("attributes_used", attributes_used), db)
        )
    
    except Exception as e:
        logger.error(f"Spending analysis error: {e}")
        return SpendingAnalysisResponse(
            totalSpending=0,
            monthlyAverage=0,
            categories=[],
            wasteAnalysis=[],
            attributes_used=[]
        )

async def generate_financial_plans(user_id: ObjectId, db) -> FinancialPlanningResponse:
    """Generate comprehensive financial plans based on profile"""
    if not client:
        return FinancialPlanningResponse(
            summary="AI analysis unavailable",
            plans=[],
            attributes_used=[]
        )
    
    try:
        # Get comprehensive user data
        user = db.users.find_one({"_id": user_id})
        accounts = list(db.accounts.find({"userId": user_id}))
        savings_accounts = list(db.savings_accounts.find({"userId": user_id}))
        savings_goals = list(db.savings_goals.find({"userId": user_id}))
        
        six_months_ago = datetime.now() - timedelta(days=180)
        transactions = list(db.transactions.find(
            {
                "userId": user_id,
                "createdAt": {"$gte": six_months_ago},
                "type": "debit"
            },
            {"amount": 1, "category": 1}
        ).limit(100))
        
        # Calculate metrics
        income = user.get("income", 0)
        credit_score = user.get("creditScore", 0)
        total_balance = sum(acc.get("balance", 0) for acc in accounts)
        total_savings = sum(acc.get("balance", 0) for acc in savings_accounts)
        monthly_spending = sum(t.get("amount", 0) for t in transactions) / 6 if transactions else 0
        active_goals = len([g for g in savings_goals if g.get("status") != "Completed"])
        
        attributes_used = []
        if income:
            attributes_used.append("user.income")
        if credit_score:
            attributes_used.append("user.creditScore")
        if accounts:
            attributes_used.extend(["accounts.balance", "accounts.accountType"])
        if savings_accounts:
            attributes_used.extend(["savings_accounts.balance", "savings_accounts.apy"])
        if savings_goals:
            attributes_used.extend(["savings_goals.targetAmount", "savings_goals.status"])
        if transactions:
            attributes_used.extend(["transactions.amount", "transactions.category"])
        
        prompt = f"""
        Create comprehensive financial plans for this user:
        
        Profile:
        - Annual Income: ₹{income:,.0f}
        - Credit Score: {credit_score}
        - Total Account Balance: ₹{total_balance:,.0f}
        - Total Savings: ₹{total_savings:,.0f}
        - Monthly Spending: ₹{monthly_spending:,.0f}
        - Active Savings Goals: {active_goals}
        
        Create 3-5 detailed financial plans covering:
        1. Short-term (1-3 months): Quick wins, emergency fund building
        2. Medium-term (3-12 months): Debt reduction, savings optimization
        3. Long-term (1+ years): Investment, retirement planning
        
        Each plan should include:
        - Clear title and description
        - Specific actionable steps
        - Expected outcome
        - Priority level
        
        Return JSON:
        {{
            "summary": "Overall financial planning summary",
            "plans": [
                {{
                    "title": "Plan title",
                    "description": "What this plan achieves",
                    "timeframe": "short-term|medium-term|long-term",
                    "priority": "high|medium|low",
                    "steps": ["Step 1", "Step 2", ...],
                    "expectedOutcome": "What to expect",
                    "attributes_used": ["user.income", "accounts.balance", ...]
                }}
            ],
            "attributes_used": ["user.income", "accounts.balance", ...]
        }}
        """
        
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "You are a comprehensive financial planner AI. Create detailed, actionable financial plans with transparency on which user attributes were considered."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        ai_result = json.loads(response.choices[0].message.content)
        
        plans = [
            FinancialPlan(**plan) for plan in ai_result.get("plans", [])
        ]
        
        return FinancialPlanningResponse(
            summary=ai_result.get("summary", ""),
            plans=plans,
            attributes_used=filter_allowed_attributes(user_id, ai_result.get("attributes_used", attributes_used), db)
        )
    
    except Exception as e:
        logger.error(f"Financial planning error: {e}")
        return FinancialPlanningResponse(
            summary="Error generating plans",
            plans=[],
            attributes_used=[]
        )

@router.get("/comprehensive")
async def get_comprehensive_insights(
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Get comprehensive AI insights including financial planning, spending analysis, and health score"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    # Get profile data
    user_profile = db.users.find_one({"_id": user_id})
    accounts = list(db.accounts.find({"userId": user_id}))
    savings_accounts = list(db.savings_accounts.find({"userId": user_id}))
    savings_goals = list(db.savings_goals.find({"userId": user_id}))
    
    six_months_ago = datetime.now() - timedelta(days=180)
    transactions = list(db.transactions.find(
        {
            "userId": user_id,
            "createdAt": {"$gte": six_months_ago},
            "status": "completed"
        },
        {"amount": 1, "type": 1, "category": 1}
    ).limit(100))
    
    # Calculate health score
    income = user_profile.get("income", 0)
    credit_score = user_profile.get("creditScore", 0)
    total_balance = sum(acc.get("balance", 0) for acc in accounts)
    total_savings = sum(acc.get("balance", 0) for acc in savings_accounts)
    monthly_spending = sum(t.get("amount", 0) for t in transactions if t.get("type") == "debit") / 6 if transactions else 0
    monthly_income = income / 12 if income > 0 else 1
    
    savings_rate = ((monthly_income - monthly_spending) / monthly_income * 100) if monthly_income > 0 else 0
    emergency_fund_months = (total_savings / monthly_spending) if monthly_spending > 0 else 0
    
    # Calculate health score (0-100)
    health_score = 0
    if savings_rate >= 20:
        health_score += 25
    elif savings_rate >= 10:
        health_score += 15
    elif savings_rate >= 5:
        health_score += 10
    
    if credit_score >= 750:
        health_score += 25
    elif credit_score >= 700:
        health_score += 20
    elif credit_score >= 650:
        health_score += 15
    
    if emergency_fund_months >= 6:
        health_score += 25
    elif emergency_fund_months >= 3:
        health_score += 20
    elif emergency_fund_months >= 1:
        health_score += 10
    
    if monthly_spending <= monthly_income * 0.8:
        health_score += 25
    elif monthly_spending <= monthly_income * 0.9:
        health_score += 20
    elif monthly_spending <= monthly_income:
        health_score += 15
    
    # Get insights
    spending_analysis = await analyze_spending_patterns(user_id, db)
    financial_planning = await generate_financial_plans(user_id, db)
    
    # Combine attributes from all sources
    all_attributes = []
    
    # Add spending analysis attributes
    if spending_analysis.attributes_used:
        all_attributes.extend(spending_analysis.attributes_used)
    
    # Add financial planning attributes
    if financial_planning.attributes_used:
        all_attributes.extend(financial_planning.attributes_used)
    
    # Add profile attributes
    if credit_score:
        all_attributes.append("user.creditScore")
    if income:
        all_attributes.append("user.income")
    if accounts:
        all_attributes.extend(["accounts.balance", "accounts.accountType"])
    if savings_accounts:
        all_attributes.extend(["savings_accounts.balance", "savings_accounts.apy"])
    if savings_goals:
        all_attributes.extend(["savings_goals.targetAmount", "savings_goals.status", "savings_goals.currentAmount"])
    if transactions:
        all_attributes.extend(["transactions.amount", "transactions.category"])
    
    # Remove duplicates and filter attributes based on user permissions
    unique_attributes = list(set(all_attributes))
    allowed_attributes = filter_allowed_attributes(user_id, unique_attributes, db)
    
    # Profile summary
    profile_summary = {
        "income": income,
        "creditScore": credit_score,
        "totalBalance": round(total_balance, 2),
        "totalSavings": round(total_savings, 2),
        "savingsRate": round(savings_rate, 2),
        "emergencyFundMonths": round(emergency_fund_months, 1),
        "monthlySpending": round(monthly_spending, 2),
        "monthlyIncome": round(monthly_income, 2),
        "activeGoals": len([g for g in savings_goals if g.get("status") != "Completed"]),
        "accountCount": len(accounts)
    }
    
    health_score_data = {
        "overall": health_score,
        "savingsRate": round(savings_rate, 1),
        "creditScore": credit_score,
        "emergencyFund": round(emergency_fund_months, 1),
        "spendingControl": round((1 - monthly_spending / monthly_income) * 100, 1) if monthly_income > 0 else 0
    }
    
    return ComprehensiveInsightsResponse(
        profileSummary=profile_summary,
        financialPlanning=financial_planning,
        spendingAnalysis=spending_analysis,
        healthScore=health_score_data,
        attributes_used=allowed_attributes
    )

