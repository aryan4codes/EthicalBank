"""
Data Access Control Service - Manage user permissions for AI data access
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from database import get_database
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/privacy", tags=["privacy"])

# Data attributes mapping - matches actual schema
DATA_ATTRIBUTES = {
    "user": {
        "category": "Personal Information",
        "attributes": [
            {"id": "user.income", "name": "Income", "description": "Annual income for financial analysis"},
            {"id": "user.creditScore", "name": "Credit Score", "description": "Credit score for loan eligibility"},
            {"id": "user.dateOfBirth", "name": "Date of Birth", "description": "Age calculation for eligibility"},
            {"id": "user.employmentStatus", "name": "Employment Status", "description": "Employment status for financial assessment"},
            {"id": "user.address", "name": "Address", "description": "Location data for regional analysis"},
            {"id": "user.email", "name": "Email", "description": "Contact information"},
            {"id": "user.firstName", "name": "First Name", "description": "Personal identification"},
            {"id": "user.lastName", "name": "Last Name", "description": "Personal identification"},
        ]
    },
    "accounts": {
        "category": "Account Information",
        "attributes": [
            {"id": "accounts.balance", "name": "Account Balance", "description": "Current account balances"},
            {"id": "accounts.accountType", "name": "Account Type", "description": "Types of accounts held"},
            {"id": "accounts.accountNumber", "name": "Account Number", "description": "Account identifiers"},
            {"id": "accounts.status", "name": "Account Status", "description": "Account status information"},
        ]
    },
    "transactions": {
        "category": "Transaction Data",
        "attributes": [
            {"id": "transactions.amount", "name": "Transaction Amount", "description": "Transaction amounts for spending analysis"},
            {"id": "transactions.category", "name": "Transaction Category", "description": "Spending categories"},
            {"id": "transactions.description", "name": "Transaction Description", "description": "Transaction details"},
            {"id": "transactions.type", "name": "Transaction Type", "description": "Debit or credit transactions"},
            {"id": "transactions.createdAt", "name": "Transaction Date", "description": "When transactions occurred"},
            {"id": "transactions.merchantName", "name": "Merchant Name", "description": "Where transactions occurred"},
        ]
    },
    "savings_accounts": {
        "category": "Savings Accounts",
        "attributes": [
            {"id": "savings_accounts.balance", "name": "Savings Balance", "description": "Savings account balances"},
            {"id": "savings_accounts.accountType", "name": "Savings Account Type", "description": "Type of savings account"},
            {"id": "savings_accounts.apy", "name": "APY", "description": "Annual percentage yield"},
            {"id": "savings_accounts.interestRate", "name": "Interest Rate", "description": "Interest rate on savings"},
        ]
    },
    "savings_goals": {
        "category": "Savings Goals",
        "attributes": [
            {"id": "savings_goals.targetAmount", "name": "Goal Target", "description": "Target savings amounts"},
            {"id": "savings_goals.currentAmount", "name": "Goal Progress", "description": "Current progress toward goals"},
            {"id": "savings_goals.monthlyContribution", "name": "Monthly Contribution", "description": "Monthly savings contributions"},
            {"id": "savings_goals.status", "name": "Goal Status", "description": "Status of savings goals"},
        ]
    }
}

# Request/Response Models
class DataAttributePermission(BaseModel):
    attributeId: str
    allowed: bool
    purpose: Optional[str] = None

class DataAccessPermissionsRequest(BaseModel):
    permissions: List[DataAttributePermission]

class DataAccessPermissionsResponse(BaseModel):
    userId: str
    permissions: Dict[str, bool]  # attributeId -> allowed
    lastUpdated: str
    totalAllowed: int
    totalAttributes: int

class ConsentRecordRequest(BaseModel):
    consentType: str
    purpose: str
    dataTypes: List[str]
    expiresAt: Optional[str] = None

class ConsentRecordResponse(BaseModel):
    id: str
    userId: str
    consentType: str
    status: str
    purpose: str
    dataTypes: List[str]
    createdAt: str
    updatedAt: str

def get_user_from_clerk_id(clerk_id: str, db):
    """Get user from MongoDB using Clerk ID"""
    user = db.users.find_one({"clerkId": clerk_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/data-attributes")
async def get_data_attributes():
    """Get all available data attributes"""
    return {
        "attributes": DATA_ATTRIBUTES,
        "totalAttributes": sum(len(cat["attributes"]) for cat in DATA_ATTRIBUTES.values())
    }

@router.get("/permissions")
async def get_data_access_permissions(
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Get user's data access permissions"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    # Get or create permissions document
    permissions_doc = db.data_access_permissions.find_one({"userId": user_id})
    
    if not permissions_doc:
        # Create default permissions (all allowed)
        default_permissions = {}
        for category in DATA_ATTRIBUTES.values():
            for attr in category["attributes"]:
                default_permissions[attr["id"]] = True
        
        permissions_doc = {
            "userId": user_id,
            "permissions": default_permissions,
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        }
        db.data_access_permissions.insert_one(permissions_doc)
    
    permissions = permissions_doc.get("permissions", {})
    total_allowed = sum(1 for allowed in permissions.values() if allowed)
    total_attributes = len(permissions)
    
    return DataAccessPermissionsResponse(
        userId=str(user_id),
        permissions=permissions,
        lastUpdated=permissions_doc.get("updatedAt", datetime.now()).isoformat(),
        totalAllowed=total_allowed,
        totalAttributes=total_attributes
    )

@router.put("/permissions")
async def update_data_access_permissions(
    request: DataAccessPermissionsRequest,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Update user's data access permissions"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    # Get existing permissions
    permissions_doc = db.data_access_permissions.find_one({"userId": user_id})
    
    if not permissions_doc:
        # Create new permissions document
        permissions_doc = {
            "userId": user_id,
            "permissions": {},
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        }
    
    # Update permissions
    current_permissions = permissions_doc.get("permissions", {})
    for perm in request.permissions:
        current_permissions[perm.attributeId] = perm.allowed
    
    # Save updated permissions
    db.data_access_permissions.update_one(
        {"userId": user_id},
        {
            "$set": {
                "permissions": current_permissions,
                "updatedAt": datetime.now()
            }
        },
        upsert=True
    )
    
    # Create consent record for audit
    consent_record = {
        "userId": user_id,
        "consentType": "data_access_permissions",
        "status": "granted",
        "purpose": "AI decision making and recommendations",
        "dataTypes": [perm.attributeId for perm in request.permissions if perm.allowed],
        "metadata": {
            "source": "web",
            "ipAddress": "unknown",
            "userAgent": "unknown"
        },
        "version": "1.0",
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    }
    
    db.consent_records.insert_one(consent_record)
    
    total_allowed = sum(1 for allowed in current_permissions.values() if allowed)
    total_attributes = len(current_permissions)
    
    return DataAccessPermissionsResponse(
        userId=str(user_id),
        permissions=current_permissions,
        lastUpdated=datetime.now().isoformat(),
        totalAllowed=total_allowed,
        totalAttributes=total_attributes
    )

@router.get("/consent-history")
async def get_consent_history(
    limit: int = 50,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Get user's consent history"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    consent_records = list(db.consent_records.find(
        {"userId": user_id}
    ).sort("createdAt", -1).limit(limit))
    
    return {
        "records": [
            {
                "id": str(record["_id"]),
                "consentType": record.get("consentType", ""),
                "status": record.get("status", ""),
                "purpose": record.get("purpose", ""),
                "dataTypes": record.get("dataTypes", []),
                "createdAt": record.get("createdAt", datetime.now()).isoformat(),
                "updatedAt": record.get("updatedAt", datetime.now()).isoformat()
            }
            for record in consent_records
        ]
    }

@router.get("/privacy-score")
async def get_privacy_score(
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Calculate privacy score based on permissions"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]
    
    permissions_doc = db.data_access_permissions.find_one({"userId": user_id})
    
    if not permissions_doc:
        return {
            "score": 100,
            "maxScore": 100,
            "message": "Default permissions (all allowed)"
        }
    
    permissions = permissions_doc.get("permissions", {})
    total_attributes = len(permissions)
    
    if total_attributes == 0:
        return {
            "score": 100,
            "maxScore": 100,
            "message": "No permissions configured"
        }
    
    # Privacy score: higher = more restrictive (better privacy)
    # Score based on percentage of attributes that are NOT allowed
    denied_count = sum(1 for allowed in permissions.values() if not allowed)
    privacy_score = int((denied_count / total_attributes) * 100)
    
    return {
        "score": privacy_score,
        "maxScore": 100,
        "allowedAttributes": sum(1 for allowed in permissions.values() if allowed),
        "deniedAttributes": denied_count,
        "totalAttributes": total_attributes,
        "message": f"{denied_count} of {total_attributes} attributes restricted"
    }

def check_attribute_permission(user_id: ObjectId, attribute_id: str, db) -> bool:
    """Check if user has granted permission for a specific attribute"""
    permissions_doc = db.data_access_permissions.find_one({"userId": user_id})
    
    if not permissions_doc:
        # Default: allow all if no permissions set
        return True
    
    permissions = permissions_doc.get("permissions", {})
    return permissions.get(attribute_id, True)  # Default to True if not specified

def filter_allowed_attributes(user_id: ObjectId, attributes: List[str], db) -> List[str]:
    """Filter attributes list to only include allowed ones"""
    allowed = []
    for attr in attributes:
        if check_attribute_permission(user_id, attr, db):
            allowed.append(attr)
    return allowed

