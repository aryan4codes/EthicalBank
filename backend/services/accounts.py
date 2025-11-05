"""
Accounts Service - All account management related routes and functions
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from database import get_database
import logging
import random

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/accounts", tags=["accounts"])

# Request/Response Models
class AccountRequest(BaseModel):
    accountType: str = Field(..., description="Type: checking, savings, credit, loan, investment")
    currency: str = Field(default="INR", description="Currency code")
    name: Optional[str] = Field(None, description="Account name/label")

class AccountResponse(BaseModel):
    id: str
    userId: str
    accountNumber: str
    accountType: str
    balance: float
    currency: str
    status: str
    name: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    createdAt: str
    updatedAt: str

class AccountUpdateRequest(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = Field(None, description="Status: active, inactive, frozen, closed")

def get_user_from_clerk_id(clerk_id: str, db):
    """Get user from MongoDB using Clerk ID"""
    user = db.users.find_one({"clerkId": clerk_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def generate_account_number(db) -> str:
    """Generate a unique 12-digit account number"""
    while True:
        account_number = str(random.randint(100000000000, 999999999999))
        if not db.accounts.find_one({"accountNumber": account_number}):
            return account_number

# Accounts Endpoints
@router.get("", response_model=List[AccountResponse])
async def get_accounts(
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Get all accounts for the user - includes regular accounts and savings accounts"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    # Get regular accounts
    accounts = list(db.accounts.find(
        {"userId": user_id, "status": {"$ne": "closed"}}
    ).sort("createdAt", -1))
    
    # Also get savings accounts and sync them
    savings_accounts = list(db.savings_accounts.find({"userId": user_id}))
    
    # For each savings account, ensure it exists in accounts collection with synced balance
    for savings_acc in savings_accounts:
        account_number = savings_acc.get("accountNumber")
        existing_account = db.accounts.find_one({"accountNumber": account_number, "userId": user_id})
        
        if existing_account:
            # Sync balance if different
            if existing_account.get("balance", 0) != savings_acc.get("balance", 0):
                db.accounts.update_one(
                    {"accountNumber": account_number, "userId": user_id},
                    {"$set": {
                        "balance": savings_acc.get("balance", 0),
                        "updatedAt": datetime.now()
                    }}
                )
        else:
            # Create account entry for savings account
            main_account = {
                "userId": user_id,
                "accountNumber": account_number,
                "accountType": "savings",
                "balance": savings_acc.get("balance", 0),
                "currency": "INR",
                "status": "active",
                "name": savings_acc.get("name"),
                "metadata": {
                    "interestRate": savings_acc.get("interestRate"),
                    "apy": savings_acc.get("apy"),
                    "minimumBalance": savings_acc.get("minimumBalance"),
                    "savingsAccountType": savings_acc.get("accountType"),
                    "institution": savings_acc.get("institution", "EthicalBank")
                },
                "createdAt": savings_acc.get("createdAt", datetime.now()),
                "updatedAt": savings_acc.get("updatedAt", datetime.now())
            }
            db.accounts.insert_one(main_account)
    
    # Refresh accounts list after syncing
    accounts = list(db.accounts.find(
        {"userId": user_id, "status": {"$ne": "closed"}}
    ).sort("createdAt", -1))
    
    result = []
    for acc in accounts:
        result.append(AccountResponse(
            id=str(acc["_id"]),
            userId=str(acc["userId"]),
            accountNumber=acc.get("accountNumber", ""),
            accountType=acc.get("accountType", ""),
            balance=acc.get("balance", 0),
            currency=acc.get("currency", "INR"),
            status=acc.get("status", "active"),
            name=acc.get("name"),
            metadata=acc.get("metadata"),
            createdAt=acc.get("createdAt", datetime.now()).isoformat(),
            updatedAt=acc.get("updatedAt", datetime.now()).isoformat()
        ))
    
    return result

@router.post("", response_model=AccountResponse)
async def create_account(
    account_data: AccountRequest,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Create a new account"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    # Check account limits (max 10 accounts per user)
    existing_count = db.accounts.count_documents({"userId": user_id, "status": {"$ne": "closed"}})
    if existing_count >= 10:
        raise HTTPException(status_code=400, detail="Maximum number of accounts reached (10)")
    
    # Validate account type
    valid_types = ["checking", "savings", "credit", "loan", "investment"]
    if account_data.accountType not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid account type. Must be one of: {', '.join(valid_types)}"
        )
    
    account_number = generate_account_number(db)
    
    new_account = {
        "userId": user_id,
        "accountNumber": account_number,
        "accountType": account_data.accountType,
        "currency": account_data.currency,
        "balance": 0,
        "status": "active",
        "name": account_data.name or f"{account_data.accountType.capitalize()} Account",
        "metadata": {},
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    }
    
    result = db.accounts.insert_one(new_account)
    new_account["_id"] = result.inserted_id
    
    return AccountResponse(
        id=str(new_account["_id"]),
        userId=str(new_account["userId"]),
        accountNumber=new_account["accountNumber"],
        accountType=new_account["accountType"],
        balance=new_account["balance"],
        currency=new_account["currency"],
        status=new_account["status"],
        name=new_account["name"],
        metadata=new_account["metadata"],
        createdAt=new_account["createdAt"].isoformat(),
        updatedAt=new_account["updatedAt"].isoformat()
    )

@router.get("/summary")
async def get_accounts_summary(
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Get accounts summary statistics"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    accounts = list(db.accounts.find(
        {"userId": user_id, "status": {"$ne": "closed"}}
    ))
    
    total_assets = sum(acc.get("balance", 0) for acc in accounts if acc.get("balance", 0) > 0)
    total_liabilities = sum(abs(acc.get("balance", 0)) for acc in accounts if acc.get("balance", 0) < 0)
    net_worth = total_assets - total_liabilities
    
    asset_accounts = [acc for acc in accounts if acc.get("balance", 0) > 0]
    liability_accounts = [acc for acc in accounts if acc.get("balance", 0) < 0]
    
    return {
        "totalAccounts": len(accounts),
        "totalAssets": round(total_assets, 2),
        "totalLiabilities": round(total_liabilities, 2),
        "netWorth": round(net_worth, 2),
        "assetAccountCount": len(asset_accounts),
        "liabilityAccountCount": len(liability_accounts)
    }

@router.get("/{account_id}", response_model=AccountResponse)
async def get_account(
    account_id: str,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Get a specific account"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    account = db.accounts.find_one({
        "_id": ObjectId(account_id),
        "userId": user_id
    })
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    return AccountResponse(
        id=str(account["_id"]),
        userId=str(account["userId"]),
        accountNumber=account.get("accountNumber", ""),
        accountType=account.get("accountType", ""),
        balance=account.get("balance", 0),
        currency=account.get("currency", "INR"),
        status=account.get("status", "active"),
        name=account.get("name"),
        metadata=account.get("metadata"),
        createdAt=account.get("createdAt", datetime.now()).isoformat(),
        updatedAt=account.get("updatedAt", datetime.now()).isoformat()
    )

@router.put("/{account_id}", response_model=AccountResponse)
async def update_account(
    account_id: str,
    account_data: AccountUpdateRequest,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Update an account"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    account = db.accounts.find_one({
        "_id": ObjectId(account_id),
        "userId": user_id
    })
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    update_data = {"updatedAt": datetime.now()}
    
    if account_data.name is not None:
        update_data["name"] = account_data.name.strip()
    
    if account_data.status is not None:
        valid_statuses = ["active", "inactive", "frozen", "closed"]
        if account_data.status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        update_data["status"] = account_data.status
    
    db.accounts.update_one(
        {"_id": ObjectId(account_id)},
        {"$set": update_data}
    )
    
    updated_account = db.accounts.find_one({"_id": ObjectId(account_id)})
    
    return AccountResponse(
        id=str(updated_account["_id"]),
        userId=str(updated_account["userId"]),
        accountNumber=updated_account.get("accountNumber", ""),
        accountType=updated_account.get("accountType", ""),
        balance=updated_account.get("balance", 0),
        currency=updated_account.get("currency", "INR"),
        status=updated_account.get("status", "active"),
        name=updated_account.get("name"),
        metadata=updated_account.get("metadata"),
        createdAt=updated_account.get("createdAt", datetime.now()).isoformat(),
        updatedAt=updated_account.get("updatedAt", datetime.now()).isoformat()
    )

@router.delete("/{account_id}")
async def delete_account(
    account_id: str,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Close/Delete an account"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    account = db.accounts.find_one({
        "_id": ObjectId(account_id),
        "userId": user_id
    })
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Check if account has balance
    if account.get("balance", 0) != 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot close account with non-zero balance. Please transfer funds first."
        )
    
    # Mark as closed instead of deleting
    db.accounts.update_one(
        {"_id": ObjectId(account_id)},
        {"$set": {"status": "closed", "updatedAt": datetime.now()}}
    )
    
    return {"success": True, "message": "Account closed successfully"}

