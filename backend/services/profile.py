"""
Profile Service - All profile-related routes and functions
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime
from bson import ObjectId
from database import get_database
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/profile", tags=["profile"])

# Request/Response Models
class ProfileUpdateRequest(BaseModel):
    income: Optional[float] = Field(None, gt=0, description="Annual income")
    dateOfBirth: Optional[str] = Field(None, description="Date of birth (YYYY-MM-DD)")
    phoneNumber: Optional[str] = Field(None, description="Phone number")
    address: Optional[Dict[str, str]] = Field(None, description="Address details")
    employmentStatus: Optional[str] = Field(None, description="Employment status")
    creditScore: Optional[int] = Field(None, ge=300, le=850, description="Credit score")

class ProfileResponse(BaseModel):
    userId: str
    email: str
    firstName: str
    lastName: str
    phoneNumber: Optional[str] = None
    dateOfBirth: Optional[str] = None
    income: Optional[float] = None
    employmentStatus: Optional[str] = None
    creditScore: Optional[int] = None
    address: Optional[Dict[str, str]] = None
    profileCompleted: bool
    kycStatus: str
    createdAt: str
    updatedAt: str

class ProfileCompletionStatus(BaseModel):
    profileCompleted: bool
    missingFields: list[str]
    completionPercentage: float

def get_user_from_clerk_id(clerk_id: str, db):
    """Get user from MongoDB using Clerk ID, create if doesn't exist"""
    user = db.users.find_one({"clerkId": clerk_id})
    if not user:
        # Try to find by email from Clerk (if available)
        # For now, create a basic user record
        logger.info(f"User not found for clerkId: {clerk_id}, creating new user")
        new_user = {
            "clerkId": clerk_id,
            "email": f"user_{clerk_id[:8]}@example.com",  # Placeholder email
            "firstName": "User",
            "lastName": "",
            "kycStatus": "pending",
            "isActive": True,
            "profileCompleted": False,
            "createdAt": datetime.now(),
            "updatedAt": datetime.now(),
            "preferences": {
                "theme": "system",
                "language": "en",
                "notifications": {
                    "email": True,
                    "sms": False,
                    "push": True
                }
            }
        }
        result = db.users.insert_one(new_user)
        user = db.users.find_one({"_id": result.inserted_id})
        logger.info(f"Created new user: {result.inserted_id}")
    return user

def parse_date_of_birth(dob_str: Optional[str]):
    """Parse date of birth string to datetime"""
    if not dob_str:
        return None
    try:
        return datetime.strptime(dob_str, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

def calculate_age(date_of_birth: datetime) -> int:
    """Calculate age from date of birth"""
    if not date_of_birth:
        return None
    today = datetime.now()
    age = today.year - date_of_birth.year - ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))
    return age

def check_profile_completion(user: dict) -> tuple[bool, list[str]]:
    """Check if profile is complete and return missing fields"""
    required_fields = {
        "income": "Annual income",
        "dateOfBirth": "Date of birth",
        "phoneNumber": "Phone number",
        "employmentStatus": "Employment status",
        "creditScore": "Credit score"
    }
    
    missing_fields = []
    for field, label in required_fields.items():
        if not user.get(field):
            missing_fields.append(label)
    
    profile_completed = len(missing_fields) == 0
    return profile_completed, missing_fields

def calculate_completion_percentage(user: dict) -> float:
    """Calculate profile completion percentage"""
    required_fields = ["income", "dateOfBirth", "phoneNumber", "employmentStatus", "creditScore"]
    optional_fields = ["address"]
    
    completed_required = sum(1 for field in required_fields if user.get(field))
    completed_optional = sum(1 for field in optional_fields if user.get(field))
    
    total_fields = len(required_fields) + len(optional_fields)
    completed_fields = completed_required + completed_optional
    
    return (completed_fields / total_fields) * 100

@router.get("/check-completion", response_model=ProfileCompletionStatus)
async def check_profile_completion_status(
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Check if user profile is complete"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    
    profile_completed, missing_fields = check_profile_completion(user)
    completion_percentage = calculate_completion_percentage(user)
    
    return ProfileCompletionStatus(
        profileCompleted=profile_completed,
        missingFields=missing_fields,
        completionPercentage=completion_percentage
    )

@router.get("/me", response_model=ProfileResponse)
async def get_profile(
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Get user profile"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    
    return ProfileResponse(
        userId=str(user["_id"]),
        email=user.get("email", ""),
        firstName=user.get("firstName", ""),
        lastName=user.get("lastName", ""),
        phoneNumber=user.get("phoneNumber"),
        dateOfBirth=user.get("dateOfBirth").isoformat() if user.get("dateOfBirth") else None,
        income=user.get("income"),
        employmentStatus=user.get("employmentStatus"),
        creditScore=user.get("creditScore"),
        address=user.get("address"),
        profileCompleted=user.get("profileCompleted", False),
        kycStatus=user.get("kycStatus", "pending"),
        createdAt=user.get("createdAt", datetime.now()).isoformat(),
        updatedAt=user.get("updatedAt", datetime.now()).isoformat()
    )

@router.put("/update", response_model=ProfileResponse)
async def update_profile(
    profile_data: ProfileUpdateRequest,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Update user profile"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    
    update_data = {"updatedAt": datetime.now()}
    
    if profile_data.income is not None:
        update_data["income"] = profile_data.income
    if profile_data.dateOfBirth:
        update_data["dateOfBirth"] = parse_date_of_birth(profile_data.dateOfBirth)
    if profile_data.phoneNumber is not None:
        update_data["phoneNumber"] = profile_data.phoneNumber
    if profile_data.employmentStatus is not None:
        update_data["employmentStatus"] = profile_data.employmentStatus
    if profile_data.creditScore is not None:
        update_data["creditScore"] = profile_data.creditScore
    if profile_data.address is not None:
        update_data["address"] = profile_data.address
    
    # Update profile completion status
    temp_user = {**user, **update_data}
    profile_completed, _ = check_profile_completion(temp_user)
    update_data["profileCompleted"] = profile_completed
    
    result = db.users.update_one(
        {"clerkId": x_clerk_user_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update profile")
    
    updated_user = get_user_from_clerk_id(x_clerk_user_id, db)
    
    return ProfileResponse(
        userId=str(updated_user["_id"]),
        email=updated_user.get("email", ""),
        firstName=updated_user.get("firstName", ""),
        lastName=updated_user.get("lastName", ""),
        phoneNumber=updated_user.get("phoneNumber"),
        dateOfBirth=updated_user.get("dateOfBirth").isoformat() if updated_user.get("dateOfBirth") else None,
        income=updated_user.get("income"),
        employmentStatus=updated_user.get("employmentStatus"),
        creditScore=updated_user.get("creditScore"),
        address=updated_user.get("address"),
        profileCompleted=updated_user.get("profileCompleted", False),
        kycStatus=updated_user.get("kycStatus", "pending"),
        createdAt=updated_user.get("createdAt", datetime.now()).isoformat(),
        updatedAt=updated_user.get("updatedAt", datetime.now()).isoformat()
    )

@router.post("/complete")
async def mark_profile_complete(
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Mark profile as complete"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    
    profile_completed, missing_fields = check_profile_completion(user)
    
    if not profile_completed:
        raise HTTPException(
            status_code=400,
            detail=f"Profile incomplete. Missing: {', '.join(missing_fields)}"
        )
    
    db.users.update_one(
        {"clerkId": x_clerk_user_id},
        {"$set": {"profileCompleted": True, "updatedAt": datetime.now()}}
    )
    
    return {"message": "Profile marked as complete", "profileCompleted": True}


