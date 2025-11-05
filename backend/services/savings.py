"""
Savings Service - All savings accounts and goals related routes and functions
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
import logging
import random

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/savings", tags=["savings"])

# Initialize OpenAI client
try:
    client = OpenAI(api_key=settings.openai_api_key)
except Exception as e:
    logger.warning(f"OpenAI client initialization failed: {e}")
    client = None

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/savings", tags=["savings"])

# Request/Response Models
class SavingsAccountRequest(BaseModel):
    name: str = Field(..., description="Account name")
    accountType: str = Field(..., description="Type: High-Yield, Money Market, Standard Savings")
    interestRate: float = Field(..., ge=0, le=100, description="Interest rate percentage")
    apy: float = Field(..., ge=0, le=100, description="APY percentage")
    minimumBalance: float = Field(default=0, ge=0, description="Minimum balance required")
    institution: Optional[str] = Field(default="EthicalBank", description="Institution name")

class SavingsAccountResponse(BaseModel):
    id: str
    name: str
    accountNumber: str
    balance: float
    interestRate: float
    apy: float
    monthlyGrowth: float
    accountType: str
    institution: str
    minimumBalance: float
    createdAt: str
    updatedAt: str

class SavingsGoalRequest(BaseModel):
    name: str = Field(..., description="Goal name")
    targetAmount: float = Field(..., gt=0, description="Target amount")
    deadline: str = Field(..., description="Deadline date (YYYY-MM-DD)")
    monthlyContribution: float = Field(..., gt=0, description="Monthly contribution amount")
    priority: str = Field(default="Medium", description="Priority: High, Medium, Low")
    category: str = Field(default="Custom", description="Category: Emergency, Travel, Transportation, Home, Custom")
    accountId: Optional[str] = Field(None, description="Linked savings account ID")

class SavingsGoalResponse(BaseModel):
    id: str
    name: str
    targetAmount: float
    currentAmount: float
    deadline: str
    monthlyContribution: float
    priority: str
    status: str
    category: str
    accountId: Optional[str]
    createdAt: str
    updatedAt: str

class AmountRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount to deposit/withdraw/contribute")

def get_user_from_clerk_id(clerk_id: str, db):
    """Get user from MongoDB using Clerk ID"""
    user = db.users.find_one({"clerkId": clerk_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def generate_account_number(db) -> str:
    """Generate a unique account number - checks both savings_accounts and accounts collections"""
    import random
    while True:
        account_number = f"{random.randint(1000, 9999)}{random.randint(1000, 9999)}"
        # Check both collections to ensure uniqueness
        if not db.savings_accounts.find_one({"accountNumber": account_number}) and \
           not db.accounts.find_one({"accountNumber": account_number}):
            return account_number

def calculate_monthly_growth(balance: float, apy: float) -> float:
    """Calculate monthly growth from APY"""
    # Monthly rate = (1 + APY/100)^(1/12) - 1
    monthly_rate = pow(1 + apy / 100, 1/12) - 1
    return balance * monthly_rate

def calculate_goal_status(current: float, target: float, deadline: datetime, monthly_contribution: float) -> str:
    """Calculate goal status based on progress and timeline"""
    progress = (current / target) * 100 if target > 0 else 0
    
    # Calculate months remaining
    months_remaining = max(0, (deadline - datetime.now()).days / 30)
    needed_per_month = (target - current) / months_remaining if months_remaining > 0 else float('inf')
    
    if progress >= 100:
        return "Completed"
    elif needed_per_month <= monthly_contribution * 0.9:
        return "Ahead"
    elif needed_per_month <= monthly_contribution * 1.1:
        return "On Track"
    else:
        return "Behind"

# Savings Accounts Endpoints
@router.get("/accounts", response_model=List[SavingsAccountResponse])
async def get_savings_accounts(
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Get all savings accounts for the user"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    accounts = list(db.savings_accounts.find({"userId": user_id}).sort("createdAt", -1))
    
    result = []
    for acc in accounts:
        monthly_growth = calculate_monthly_growth(acc.get("balance", 0), acc.get("apy", 0))
        result.append(SavingsAccountResponse(
            id=str(acc["_id"]),
            name=acc.get("name", ""),
            accountNumber=acc.get("accountNumber", ""),
            balance=acc.get("balance", 0),
            interestRate=acc.get("interestRate", 0),
            apy=acc.get("apy", 0),
            monthlyGrowth=round(monthly_growth, 2),
            accountType=acc.get("accountType", ""),
            institution=acc.get("institution", "EthicalBank"),
            minimumBalance=acc.get("minimumBalance", 0),
            createdAt=acc.get("createdAt", datetime.now()).isoformat(),
            updatedAt=acc.get("updatedAt", datetime.now()).isoformat()
        ))
    
    return result

@router.post("/accounts", response_model=SavingsAccountResponse)
async def create_savings_account(
    account_data: SavingsAccountRequest,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Create a new savings account - also creates in main accounts collection"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    account_number = generate_account_number(db)
    
    # Create in savings_accounts collection
    new_account = {
        "userId": user_id,
        "name": account_data.name,
        "accountNumber": account_number,
        "balance": 0,
        "interestRate": account_data.interestRate,
        "apy": account_data.apy,
        "accountType": account_data.accountType,
        "institution": account_data.institution,
        "minimumBalance": account_data.minimumBalance,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    }
    
    result = db.savings_accounts.insert_one(new_account)
    new_account["_id"] = result.inserted_id
    
    # Also create in main accounts collection for unified view
    main_account = {
        "userId": user_id,
        "accountNumber": account_number,
        "accountType": "savings",  # Use "savings" as accountType
        "balance": 0,
        "currency": "INR",
        "status": "active",
        "name": account_data.name,
        "metadata": {
            "interestRate": account_data.interestRate,
            "apy": account_data.apy,
            "minimumBalance": account_data.minimumBalance,
            "savingsAccountType": account_data.accountType,  # High-Yield, Money Market, etc.
            "institution": account_data.institution
        },
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    }
    
    # Only create if doesn't exist (by account number)
    existing = db.accounts.find_one({"accountNumber": account_number})
    if not existing:
        db.accounts.insert_one(main_account)
    
    monthly_growth = calculate_monthly_growth(0, account_data.apy)
    
    return SavingsAccountResponse(
        id=str(new_account["_id"]),
        name=new_account["name"],
        accountNumber=new_account["accountNumber"],
        balance=new_account["balance"],
        interestRate=new_account["interestRate"],
        apy=new_account["apy"],
        monthlyGrowth=round(monthly_growth, 2),
        accountType=new_account["accountType"],
        institution=new_account["institution"],
        minimumBalance=new_account["minimumBalance"],
        createdAt=new_account["createdAt"].isoformat(),
        updatedAt=new_account["updatedAt"].isoformat()
    )

@router.put("/accounts/{account_id}", response_model=SavingsAccountResponse)
async def update_savings_account(
    account_id: str,
    account_data: SavingsAccountRequest,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Update a savings account"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    account = db.savings_accounts.find_one({
        "_id": ObjectId(account_id),
        "userId": user_id
    })
    
    if not account:
        raise HTTPException(status_code=404, detail="Savings account not found")
    
    update_data = {
        "name": account_data.name,
        "interestRate": account_data.interestRate,
        "apy": account_data.apy,
        "accountType": account_data.accountType,
        "institution": account_data.institution,
        "minimumBalance": account_data.minimumBalance,
        "updatedAt": datetime.now()
    }
    
    db.savings_accounts.update_one(
        {"_id": ObjectId(account_id)},
        {"$set": update_data}
    )
    
    updated_account = db.savings_accounts.find_one({"_id": ObjectId(account_id)})
    monthly_growth = calculate_monthly_growth(updated_account.get("balance", 0), updated_account.get("apy", 0))
    
    return SavingsAccountResponse(
        id=str(updated_account["_id"]),
        name=updated_account["name"],
        accountNumber=updated_account["accountNumber"],
        balance=updated_account.get("balance", 0),
        interestRate=updated_account.get("interestRate", 0),
        apy=updated_account.get("apy", 0),
        monthlyGrowth=round(monthly_growth, 2),
        accountType=updated_account.get("accountType", ""),
        institution=updated_account.get("institution", "EthicalBank"),
        minimumBalance=updated_account.get("minimumBalance", 0),
        createdAt=updated_account.get("createdAt", datetime.now()).isoformat(),
        updatedAt=updated_account.get("updatedAt", datetime.now()).isoformat()
    )

@router.post("/accounts/{account_id}/deposit")
async def deposit_to_account(
    account_id: str,
    request: AmountRequest,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Deposit money into a savings account - syncs with main accounts collection"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    account = db.savings_accounts.find_one({
        "_id": ObjectId(account_id),
        "userId": user_id
    })
    
    if not account:
        raise HTTPException(status_code=404, detail="Savings account not found")
    
    amount = request.amount
    account_number = account.get("accountNumber")
    new_balance = account.get("balance", 0) + amount
    
    # Update savings_accounts collection
    db.savings_accounts.update_one(
        {"_id": ObjectId(account_id)},
        {"$set": {"balance": new_balance, "updatedAt": datetime.now()}}
    )
    
    # Also update main accounts collection to keep in sync
    main_account = db.accounts.find_one({"accountNumber": account_number, "userId": user_id})
    if main_account:
        db.accounts.update_one(
            {"accountNumber": account_number, "userId": user_id},
            {"$set": {"balance": new_balance, "updatedAt": datetime.now()}}
        )
    
    return {"success": True, "newBalance": new_balance}

@router.post("/accounts/{account_id}/withdraw")
async def withdraw_from_account(
    account_id: str,
    request: AmountRequest,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Withdraw money from a savings account - syncs with main accounts collection"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    account = db.savings_accounts.find_one({
        "_id": ObjectId(account_id),
        "userId": user_id
    })
    
    if not account:
        raise HTTPException(status_code=404, detail="Savings account not found")
    
    amount = request.amount
    account_number = account.get("accountNumber")
    current_balance = account.get("balance", 0)
    minimum_balance = account.get("minimumBalance", 0)
    
    if current_balance - amount < minimum_balance:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient balance. Minimum balance required: {minimum_balance}"
        )
    
    new_balance = current_balance - amount
    
    # Update savings_accounts collection
    db.savings_accounts.update_one(
        {"_id": ObjectId(account_id)},
        {"$set": {"balance": new_balance, "updatedAt": datetime.now()}}
    )
    
    # Also update main accounts collection to keep in sync
    main_account = db.accounts.find_one({"accountNumber": account_number, "userId": user_id})
    if main_account:
        db.accounts.update_one(
            {"accountNumber": account_number, "userId": user_id},
            {"$set": {"balance": new_balance, "updatedAt": datetime.now()}}
        )
    
    return {"success": True, "newBalance": new_balance}

# Savings Goals Endpoints
@router.get("/goals", response_model=List[SavingsGoalResponse])
async def get_savings_goals(
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Get all savings goals for the user"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    goals = list(db.savings_goals.find({"userId": user_id}).sort("createdAt", -1))
    
    result = []
    for goal in goals:
        deadline = goal.get("deadline")
        if isinstance(deadline, str):
            deadline = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
        elif isinstance(deadline, datetime):
            pass
        else:
            deadline = datetime.now()
        
        status = calculate_goal_status(
            goal.get("currentAmount", 0),
            goal.get("targetAmount", 0),
            deadline,
            goal.get("monthlyContribution", 0)
        )
        
        result.append(SavingsGoalResponse(
            id=str(goal["_id"]),
            name=goal.get("name", ""),
            targetAmount=goal.get("targetAmount", 0),
            currentAmount=goal.get("currentAmount", 0),
            deadline=deadline.isoformat() if isinstance(deadline, datetime) else deadline,
            monthlyContribution=goal.get("monthlyContribution", 0),
            priority=goal.get("priority", "Medium"),
            status=status,
            category=goal.get("category", "Custom"),
            accountId=str(goal.get("accountId")) if goal.get("accountId") else None,
            createdAt=goal.get("createdAt", datetime.now()).isoformat(),
            updatedAt=goal.get("updatedAt", datetime.now()).isoformat()
        ))
    
    return result

@router.post("/goals", response_model=SavingsGoalResponse)
async def create_savings_goal(
    goal_data: SavingsGoalRequest,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Create a new savings goal"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    # Parse deadline
    try:
        deadline = datetime.strptime(goal_data.deadline, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Validate account ID if provided
    account_id = None
    if goal_data.accountId:
        account = db.savings_accounts.find_one({
            "_id": ObjectId(goal_data.accountId),
            "userId": user_id
        })
        if not account:
            raise HTTPException(status_code=404, detail="Linked savings account not found")
        account_id = ObjectId(goal_data.accountId)
    
    status = calculate_goal_status(0, goal_data.targetAmount, deadline, goal_data.monthlyContribution)
    
    new_goal = {
        "userId": user_id,
        "name": goal_data.name,
        "targetAmount": goal_data.targetAmount,
        "currentAmount": 0,
        "deadline": deadline,
        "monthlyContribution": goal_data.monthlyContribution,
        "priority": goal_data.priority,
        "category": goal_data.category,
        "accountId": account_id,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    }
    
    result = db.savings_goals.insert_one(new_goal)
    new_goal["_id"] = result.inserted_id
    
    return SavingsGoalResponse(
        id=str(new_goal["_id"]),
        name=new_goal["name"],
        targetAmount=new_goal["targetAmount"],
        currentAmount=new_goal["currentAmount"],
        deadline=new_goal["deadline"].isoformat(),
        monthlyContribution=new_goal["monthlyContribution"],
        priority=new_goal["priority"],
        status=status,
        category=new_goal["category"],
        accountId=str(new_goal["accountId"]) if new_goal.get("accountId") else None,
        createdAt=new_goal["createdAt"].isoformat(),
        updatedAt=new_goal["updatedAt"].isoformat()
    )

@router.put("/goals/{goal_id}", response_model=SavingsGoalResponse)
async def update_savings_goal(
    goal_id: str,
    goal_data: SavingsGoalRequest,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Update a savings goal"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    goal = db.savings_goals.find_one({
        "_id": ObjectId(goal_id),
        "userId": user_id
    })
    
    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")
    
    # Parse deadline
    try:
        deadline = datetime.strptime(goal_data.deadline, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Validate account ID if provided
    account_id = None
    if goal_data.accountId:
        account = db.savings_accounts.find_one({
            "_id": ObjectId(goal_data.accountId),
            "userId": user_id
        })
        if not account:
            raise HTTPException(status_code=404, detail="Linked savings account not found")
        account_id = ObjectId(goal_data.accountId)
    
    current_amount = goal.get("currentAmount", 0)
    status = calculate_goal_status(
        current_amount,
        goal_data.targetAmount,
        deadline,
        goal_data.monthlyContribution
    )
    
    update_data = {
        "name": goal_data.name,
        "targetAmount": goal_data.targetAmount,
        "deadline": deadline,
        "monthlyContribution": goal_data.monthlyContribution,
        "priority": goal_data.priority,
        "category": goal_data.category,
        "accountId": account_id,
        "updatedAt": datetime.now()
    }
    
    db.savings_goals.update_one(
        {"_id": ObjectId(goal_id)},
        {"$set": update_data}
    )
    
    updated_goal = db.savings_goals.find_one({"_id": ObjectId(goal_id)})
    deadline_dt = updated_goal.get("deadline")
    if isinstance(deadline_dt, str):
        deadline_dt = datetime.fromisoformat(deadline_dt.replace('Z', '+00:00'))
    
    final_status = calculate_goal_status(
        updated_goal.get("currentAmount", 0),
        updated_goal.get("targetAmount", 0),
        deadline_dt if isinstance(deadline_dt, datetime) else datetime.now(),
        updated_goal.get("monthlyContribution", 0)
    )
    
    return SavingsGoalResponse(
        id=str(updated_goal["_id"]),
        name=updated_goal["name"],
        targetAmount=updated_goal["targetAmount"],
        currentAmount=updated_goal.get("currentAmount", 0),
        deadline=deadline_dt.isoformat() if isinstance(deadline_dt, datetime) else updated_goal.get("deadline", ""),
        monthlyContribution=updated_goal.get("monthlyContribution", 0),
        priority=updated_goal.get("priority", "Medium"),
        status=final_status,
        category=updated_goal.get("category", "Custom"),
        accountId=str(updated_goal["accountId"]) if updated_goal.get("accountId") else None,
        createdAt=updated_goal.get("createdAt", datetime.now()).isoformat(),
        updatedAt=updated_goal.get("updatedAt", datetime.now()).isoformat()
    )

@router.post("/goals/{goal_id}/contribute")
async def contribute_to_goal(
    goal_id: str,
    request: AmountRequest,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Add contribution to a savings goal"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    goal = db.savings_goals.find_one({
        "_id": ObjectId(goal_id),
        "userId": user_id
    })
    
    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")
    
    amount = request.amount
    current_amount = goal.get("currentAmount", 0)
    new_amount = min(current_amount + amount, goal.get("targetAmount", 0))
    
    db.savings_goals.update_one(
        {"_id": ObjectId(goal_id)},
        {"$set": {"currentAmount": new_amount, "updatedAt": datetime.now()}}
    )
    
    # If linked to account, transfer from account
    if goal.get("accountId"):
        account = db.savings_accounts.find_one({"_id": goal["accountId"]})
        if account:
            account_balance = account.get("balance", 0)
            if account_balance >= amount:
                db.savings_accounts.update_one(
                    {"_id": goal["accountId"]},
                    {"$set": {"balance": account_balance - amount, "updatedAt": datetime.now()}}
                )
    
    return {"success": True, "newAmount": new_amount}

@router.delete("/goals/{goal_id}")
async def delete_savings_goal(
    goal_id: str,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Delete a savings goal"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    result = db.savings_goals.delete_one({
        "_id": ObjectId(goal_id),
        "userId": user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Savings goal not found")
    
    return {"success": True}

@router.delete("/accounts/{account_id}")
async def delete_savings_account(
    account_id: str,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Delete a savings account"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    result = db.savings_accounts.delete_one({
        "_id": ObjectId(account_id),
        "userId": user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Savings account not found")
    
    return {"success": True}

@router.get("/summary")
async def get_savings_summary(
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Get savings summary statistics"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    accounts = list(db.savings_accounts.find({"userId": user_id}))
    goals = list(db.savings_goals.find({"userId": user_id}))
    
    total_savings = sum(acc.get("balance", 0) for acc in accounts)
    total_monthly_growth = sum(
        calculate_monthly_growth(acc.get("balance", 0), acc.get("apy", 0))
        for acc in accounts
    )
    
    apy_list = [acc.get("apy", 0) for acc in accounts if acc.get("apy", 0) > 0]
    average_apy = sum(apy_list) / len(apy_list) if apy_list else 0
    
    return {
        "totalSavings": round(total_savings, 2),
        "totalMonthlyGrowth": round(total_monthly_growth, 2),
        "averageAPY": round(average_apy, 2),
        "activeGoals": len(goals),
        "totalAccounts": len(accounts)
    }

