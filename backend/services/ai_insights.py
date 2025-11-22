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
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai-insights", tags=["ai-insights"])

# Initialize OpenAI client with optimized settings
try:
    client = OpenAI(
        api_key=settings.openai_api_key,
        max_retries=0,  # Disable automatic retries for faster failures
        timeout=60.0  # Default timeout
    )
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

def create_basic_spending_analysis(transactions, monthly_spending) -> SpendingAnalysisResponse:
    """Create basic spending analysis without AI"""
    # Calculate category spending
    category_spending = {}
    for t in transactions:
        cat = t.get("category", "other")
        category_spending[cat] = category_spending.get(cat, 0) + t.get("amount", 0)
    
    total_spending = sum(category_spending.values())
    categories = []
    
    for cat, amount in category_spending.items():
        percentage = (amount / total_spending * 100) if total_spending > 0 else 0
        categories.append(SpendingCategory(
            category=cat,
            amount=amount,
            percentage=percentage,
            trend="stable",
            averageSpending=amount / 6,  # 6 months
            recommendation=None
        ))
    
    return SpendingAnalysisResponse(
        totalSpending=total_spending,
        monthlyAverage=monthly_spending,
        categories=categories,
        wasteAnalysis=[],
        attributes_used=["transactions.amount", "transactions.category"]
    )

def create_basic_financial_planning(income, total_savings, monthly_spending) -> FinancialPlanningResponse:
    """Create basic financial planning without AI"""
    plans = []
    
    # Emergency fund plan
    if total_savings < monthly_spending * 3:
        plans.append(FinancialPlan(
            title="Build Emergency Fund",
            description="Create a safety net for unexpected expenses",
            timeframe="short-term",
            priority="high",
            steps=[
                "Set up automatic savings transfer",
                "Aim to save 3-6 months of expenses",
                "Keep funds in high-yield savings account"
            ],
            expectedOutcome="Financial security and peace of mind",
            attributes_used=["user.income", "transactions.amount"]
        ))
    
    # Savings optimization
    if income > 0 and monthly_spending < income / 12 * 0.8:
        plans.append(FinancialPlan(
            title="Optimize Savings Rate",
            description="Increase your savings and investment contributions",
            timeframe="medium-term",
            priority="medium",
            steps=[
                "Review current spending habits",
                "Increase retirement contributions",
                "Consider investment opportunities"
            ],
            expectedOutcome="Improved long-term financial growth",
            attributes_used=["user.income", "savings_accounts.balance"]
        ))
    
    return FinancialPlanningResponse(
        summary="Basic financial recommendations based on your current situation",
        plans=plans,
        attributes_used=["user.income", "transactions.amount", "savings_accounts.balance"]
    )

def analyze_spending_patterns(user_id: ObjectId, db) -> SpendingAnalysisResponse:
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
        # Get transactions - reduced limit for faster processing
        six_months_ago = datetime.now() - timedelta(days=180)
        transactions = list(db.transactions.find(
            {
                "userId": user_id,
                "createdAt": {"$gte": six_months_ago},
                "type": "debit",
                "status": "completed"
            },
            {"amount": 1, "category": 1}
        ).limit(50))  # Reduced from 200 to 50
        
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
        
        # Pre-calculate category data to reduce AI processing
        categories_data = []
        for cat, amount in category_spending.items():
            categories_data.append({
                "category": cat,
                "amount": round(amount, 2),
                "percentage": round((amount / total_spending * 100), 2) if total_spending > 0 else 0
            })
        
        # Simplified prompt - only ask AI to add trends and recommendations
        prompt = f"""Monthly Income: ₹{monthly_income:,.0f}
Monthly Spending: ₹{monthly_average:,.0f}

Categories: {json.dumps(categories_data)}

For each category, add:
- trend: "increasing"/"stable"/"decreasing"
- averageSpending: monthly average (amount/6)
- recommendation: brief 1-sentence advice or null

Identify 2-3 wasteful spending patterns (if any).

Return JSON:
{{
    "categories": [{{"category": "food", "amount": 5000, "percentage": 25, "trend": "stable", "averageSpending": 833, "recommendation": "Consider meal planning"}}],
    "wasteAnalysis": [{{"category": "dining", "wastedAmount": 1000, "reason": "Frequent eating out", "monthlyImpact": 167, "recommendation": "Cook more at home"}}],
    "attributes_used": ["transactions.amount", "transactions.category", "user.income"]
}}"""
        
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "You are a financial advisor AI. Analyze spending patterns and identify wasteful spending with specific recommendations."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            timeout=45.0,  # 45 second timeout
            max_completion_tokens=1500  # Reduced from 4000 to 1500 for faster generation
        )
        
        # Debug logging
        logger.info(f"OpenAI Spending Analysis Response: {response}")
        logger.info(f"Choices: {response.choices}")
        if response.choices:
            logger.info(f"First choice: {response.choices[0]}")
            logger.info(f"Message: {response.choices[0].message}")
            logger.info(f"Content: {response.choices[0].message.content}")
        
        content = response.choices[0].message.content
        if not content:
            logger.error(f"Empty content from OpenAI. Full response: {response.model_dump()}")
            raise ValueError("OpenAI returned empty content")
        
        try:
            ai_result = json.loads(content)
        except json.JSONDecodeError as e:
            logger.error(f"JSON Parse Error: {e}. Content: {content}")
            # Try to recover if it's a markdown block
            if "```json" in content:
                try:
                    json_str = content.split("```json")[1].split("```")[0].strip()
                    ai_result = json.loads(json_str)
                except:
                    raise ValueError(f"Invalid JSON response from AI: {content[:200]}...")
            else:
                raise ValueError(f"Invalid JSON response from AI: {content[:200]}...")
        
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
        logger.error(f"Spending analysis error: {e}", exc_info=True)
        return SpendingAnalysisResponse(
            totalSpending=0,
            monthlyAverage=0,
            categories=[],
            wasteAnalysis=[],
            attributes_used=[]
        )

def generate_financial_plans(user_id: ObjectId, db) -> FinancialPlanningResponse:
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
            {"amount": 1}
        ).limit(50))  # Reduced limit and removed category field
        
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
        
        # Simplified prompt - only essential data
        prompt = f"""Income: ₹{income:,.0f}/yr | Credit: {credit_score} | Savings: ₹{total_savings:,.0f} | Monthly Spend: ₹{monthly_spending:,.0f} | Goals: {active_goals}

Create 3-4 financial plans (short-term, medium-term, long-term).

Each plan needs: title, description, timeframe, priority, 3-4 steps, expectedOutcome.

Return JSON:
{{
    "summary": "Brief 1-sentence summary",
    "plans": [{{"title": "Build Emergency Fund", "description": "Save 3-6 months expenses", "timeframe": "short-term", "priority": "high", "steps": ["Save ₹X/month", "Open high-yield account"], "expectedOutcome": "Financial security", "attributes_used": ["user.income"]}}],
    "attributes_used": ["user.income", "savings_accounts.balance"]
}}"""
        
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "You are a financial planner AI. Create actionable plans."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            timeout=45.0,  # 45 second timeout
            max_completion_tokens=1500  # Reduced from 4000 to 1500 for faster generation
        )
        
        # Debug logging
        logger.info(f"OpenAI Financial Planning Response: {response}")
        logger.info(f"Choices: {response.choices}")
        if response.choices:
            logger.info(f"First choice: {response.choices[0]}")
            logger.info(f"Message: {response.choices[0].message}")
            logger.info(f"Content: {response.choices[0].message.content}")
        
        content = response.choices[0].message.content
        if not content:
            logger.error(f"Empty content from OpenAI. Full response: {response.model_dump()}")
            raise ValueError("OpenAI returned empty content")
        
        try:
            ai_result = json.loads(content)
        except json.JSONDecodeError as e:
            logger.error(f"JSON Parse Error: {e}. Content: {content}")
            # Try to recover if it's a markdown block
            if "```json" in content:
                try:
                    json_str = content.split("```json")[1].split("```")[0].strip()
                    ai_result = json.loads(json_str)
                except:
                    raise ValueError(f"Invalid JSON response from AI: {content[:200]}...")
            else:
                raise ValueError(f"Invalid JSON response from AI: {content[:200]}...")
        
        plans = [
            FinancialPlan(**plan) for plan in ai_result.get("plans", [])
        ]
        
        return FinancialPlanningResponse(
            summary=ai_result.get("summary", ""),
            plans=plans,
            attributes_used=filter_allowed_attributes(user_id, ai_result.get("attributes_used", attributes_used), db)
        )
    
    except Exception as e:
        logger.error(f"Financial planning error: {e}", exc_info=True)
        return FinancialPlanningResponse(
            summary="Error generating plans",
            plans=[],
            attributes_used=[]
        )

@router.get("/comprehensive")
def get_comprehensive_insights(
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Get comprehensive AI insights including financial planning, spending analysis, and health score"""
    try:
        logger.info(f"Starting comprehensive insights request for user: {x_clerk_user_id}")
        user = get_user_from_clerk_id(x_clerk_user_id, db)
        user_id = user["_id"]
        logger.info(f"Found user with ID: {user_id}")
        
        # Check for cached insights (cache for 10 minutes)
        cache_key = f"ai_insights_{user_id}"
        cached_insights = db.ai_insights_cache.find_one({"_id": cache_key})
        
        if cached_insights:
            cache_age = (datetime.now() - cached_insights.get("created_at", datetime.now())).total_seconds()
            if cache_age < 600:  # 10 minutes
                logger.info(f"Returning cached insights (age: {cache_age:.1f}s)")
                cached_data = cached_insights["data"]
                return ComprehensiveInsightsResponse(**cached_data)
        
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
        
        # Get insights with parallelization
        logger.info(f"Starting parallel AI calls for spending analysis and financial planning")
        start_time = datetime.now()
        
        def get_spending_analysis_safe():
            try:
                return analyze_spending_patterns(user_id, db)
            except Exception as e:
                logger.error(f"Failed to get spending analysis: {e}", exc_info=True)
                return create_basic_spending_analysis(transactions, monthly_spending)
        
        def get_financial_planning_safe():
            try:
                return generate_financial_plans(user_id, db)
            except Exception as e:
                logger.error(f"Failed to get financial planning: {e}", exc_info=True)
                return create_basic_financial_planning(income, total_savings, monthly_spending)
        
        # Run both calls in parallel
        with ThreadPoolExecutor(max_workers=2) as executor:
            future_spending = executor.submit(get_spending_analysis_safe)
            future_planning = executor.submit(get_financial_planning_safe)
            
            try:
                spending_analysis = future_spending.result(timeout=40)
            except Exception as e:
                logger.warning(f"Spending analysis timed out or failed: {e}")
                spending_analysis = create_basic_spending_analysis(transactions, monthly_spending)
                
            try:
                financial_planning = future_planning.result(timeout=40)
            except Exception as e:
                logger.warning(f"Financial planning timed out or failed: {e}")
                financial_planning = create_basic_financial_planning(income, total_savings, monthly_spending)
        
        elapsed_time = (datetime.now() - start_time).total_seconds()
        logger.info(f"Completed parallel AI calls in {elapsed_time:.2f} seconds")
        
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
        
        response = ComprehensiveInsightsResponse(
            profileSummary=profile_summary,
            financialPlanning=financial_planning,
            spendingAnalysis=spending_analysis,
            healthScore=health_score_data,
            attributes_used=allowed_attributes
        )
        
        # Cache the response for 10 minutes
        try:
            cache_data = {
                "_id": cache_key,
                "data": response.dict(),
                "created_at": datetime.now()
            }
            db.ai_insights_cache.replace_one({"_id": cache_key}, cache_data, upsert=True)
            logger.info(f"Cached insights for user {user_id}")
        except Exception as e:
            logger.warning(f"Failed to cache insights: {e}")
        
        logger.info(f"Successfully created comprehensive insights response for user {user_id}")
        logger.debug(f"Response summary: profileSummary keys={list(profile_summary.keys())}, "
                    f"financialPlanning plans={len(financial_planning.plans)}, "
                    f"spendingAnalysis categories={len(spending_analysis.categories)}, "
                    f"attributes_used count={len(allowed_attributes)}")
        return response
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Error in get_comprehensive_insights endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get comprehensive insights: {str(e)}")

