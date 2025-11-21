"""
AI Perception Service - Transparency into how AI views the user
Includes data correction and dispute handling
"""
from fastapi import APIRouter, HTTPException, Depends, Header, Body
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from bson import ObjectId
from database import get_database
from config import settings
from openai import OpenAI
import json
import logging

logger = logging.getLogger(__name__)

def calculate_age(date_of_birth):
    """Calculate age from date of birth"""
    if isinstance(date_of_birth, str):
        date_of_birth = datetime.strptime(date_of_birth, "%Y-%m-%d").date()
    elif isinstance(date_of_birth, datetime):
        date_of_birth = date_of_birth.date()
    
    today = date.today()
    return today.year - date_of_birth.year - ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))

router = APIRouter(prefix="/api/ai-perception", tags=["ai-perception"])

# Initialize OpenAI client
try:
    client = OpenAI(api_key=settings.openai_api_key)
except Exception as e:
    logger.warning(f"OpenAI client initialization failed: {e}")
    client = None

# Models
class PerceptionAttribute(BaseModel):
    category: str  # e.g., "Risk Profile", "Spending Habits", "Financial Health"
    label: str     # e.g., "Conservative Spender", "High Risk"
    confidence: float
    evidence: List[str]  # Why AI thinks this (e.g., "Low debt-to-income ratio")
    lastUpdated: datetime
    status: str = "active"  # active, disputed, corrected

class PerceptionResponse(BaseModel):
    summary: str
    attributes: List[PerceptionAttribute]
    lastAnalysis: datetime

class DisputeRequest(BaseModel):
    category: str
    label: str
    reason: str
    correction: Optional[str] = None

def get_user_from_clerk_id(clerk_id: str, db):
    user = db.users.find_one({"clerkId": clerk_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("", response_model=PerceptionResponse)
async def get_ai_perception(
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Get the AI's perception of the user based on their data"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]

    # Check for existing cached perception
    existing_perception = db.ai_perceptions.find_one(
        {"userId": user_id},
        sort=[("lastAnalysis", -1)]
    )

    if existing_perception:
        last_analysis = existing_perception.get("lastAnalysis")
        if isinstance(last_analysis, datetime) and (datetime.utcnow() - last_analysis).days < 1:
            # Convert attributes to PerceptionAttribute objects
            attributes = []
            for attr in existing_perception.get("attributes", []):
                # Handle datetime conversion
                last_updated = attr.get("lastUpdated")
                if isinstance(last_updated, str):
                    try:
                        last_updated = datetime.fromisoformat(last_updated.replace('Z', '+00:00'))
                    except:
                        last_updated = datetime.utcnow()
                elif not isinstance(last_updated, datetime):
                    last_updated = datetime.utcnow()
                
                attributes.append(PerceptionAttribute(
                    category=attr.get("category", "Unknown"),
                    label=attr.get("label", "Unknown"),
                    confidence=attr.get("confidence", 0.5),
                    evidence=attr.get("evidence", []),
                    lastUpdated=last_updated,
                    status=attr.get("status", "active")
                ))
            
            # Handle lastAnalysis datetime
            if isinstance(last_analysis, str):
                try:
                    last_analysis = datetime.fromisoformat(last_analysis.replace('Z', '+00:00'))
                except:
                    last_analysis = datetime.utcnow()
            
            return PerceptionResponse(
                summary=existing_perception.get("summary", "No summary available."),
                attributes=attributes,
                lastAnalysis=last_analysis or datetime.utcnow()
            )

    # If no cache or old, generate new perception
    # Gather data
    user_data = {
        "income": user.get("income"),
        "creditScore": user.get("creditScore"),
        "employmentStatus": user.get("employmentStatus"),
    }
    
    # Calculate age if dateOfBirth exists
    if user.get("dateOfBirth"):
        try:
            user_data["age"] = calculate_age(user.get("dateOfBirth"))
        except Exception as e:
            logger.warning(f"Could not calculate age: {e}")
    
    # Fetch recent transactions summary (mocked logic for speed if needed, or real DB query)
    recent_txns = list(db.transactions.find({"userId": user_id}).sort("date", -1).limit(20))
    txn_summary = f"{len(recent_txns)} recent transactions analyzed."

    if not client:
        # Fallback if OpenAI not available
        return PerceptionResponse(
            summary="AI perception service currently unavailable.",
            attributes=[],
            lastAnalysis=datetime.utcnow()
        )

    prompt = f"""
    Analyze this user's banking profile to create a "Digital Perception".
    
    User Data: {json.dumps(user_data, default=str)}
    Transaction Summary: {txn_summary}

    Generate 4-6 key perception attributes in these categories: "Risk Profile", "Spending Habits", "Financial Health".
    For each, provide a label (e.g., "Impulsive Spender"), confidence (0-1), and 1-2 evidence points.

    Return valid JSON with this structure:
    {{
        "summary": "2 sentence summary of how the bank sees this user.",
        "attributes": [
            {{
                "category": "Risk Profile",
                "label": "Low Risk",
                "confidence": 0.95,
                "evidence": ["High credit score", "Stable employment"]
            }}
        ]
    }}
    """

    try:
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "You are a transparent AI banking advisor. Output valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            max_completion_tokens=5000,
        )
        
        # Debug logging
        logger.info(f"OpenAI Response: {response}")
        logger.info(f"Choices: {response.choices}")
        if response.choices:
            logger.info(f"First choice: {response.choices[0]}")
            logger.info(f"Message: {response.choices[0].message}")
            logger.info(f"Content: {response.choices[0].message.content}")
        
        content = response.choices[0].message.content
        if not content:
            logger.error(f"Empty content. Full response: {response.model_dump()}")
            raise ValueError("OpenAI returned empty content")
            
        try:
            ai_data = json.loads(content)
        except json.JSONDecodeError as e:
            logger.error(f"JSON Parse Error: {e}. Content: {content}")
            # Try to recover if it's a markdown block
            if "```json" in content:
                try:
                    json_str = content.split("```json")[1].split("```")[0].strip()
                    ai_data = json.loads(json_str)
                except:
                    raise ValueError(f"Invalid JSON response from AI: {content[:100]}...")
            else:
                raise ValueError(f"Invalid JSON response from AI: {content[:100]}...")
        
        # Build attributes with proper types
        attributes = []
        for attr in ai_data.get("attributes", []):
            attributes.append(PerceptionAttribute(
                category=attr.get("category", "Unknown"),
                label=attr.get("label", "Unknown"),
                confidence=attr.get("confidence", 0.5),
                evidence=attr.get("evidence", []),
                lastUpdated=datetime.utcnow(),
                status="active"
            ))

        perception_doc = PerceptionResponse(
            summary=ai_data.get("summary", "Analysis complete."),
            attributes=attributes,
            lastAnalysis=datetime.utcnow()
        )

        # Save to DB (convert to dict for MongoDB)
        db_doc = {
            "userId": user_id,
            "summary": perception_doc.summary,
            "attributes": [attr.dict() for attr in perception_doc.attributes],
            "lastAnalysis": perception_doc.lastAnalysis
        }
        db.ai_perceptions.update_one(
            {"userId": user_id},
            {"$set": db_doc},
            upsert=True
        )
        
        return perception_doc

    except Exception as e:
        logger.error(f"AI Perception generation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate AI perception")


@router.post("/dispute")
async def dispute_perception(
    dispute: DisputeRequest,
    x_clerk_user_id: str = Header(..., alias="x-clerk-user-id"),
    db = Depends(get_database)
):
    """Submit a dispute for an AI perception attribute"""
    user = get_user_from_clerk_id(x_clerk_user_id, db)
    user_id = user["_id"]

    # Log the dispute
    dispute_doc = {
        "userId": user_id,
        "category": dispute.category,
        "label": dispute.label,
        "reason": dispute.reason,
        "proposedCorrection": dispute.correction,
        "status": "pending_review",
        "timestamp": datetime.utcnow()
    }
    
    db.ai_disputes.insert_one(dispute_doc)

    # Update the perception attribute status to 'disputed'
    db.ai_perceptions.update_one(
        {
            "userId": user_id, 
            "attributes": {
                "$elemMatch": {"category": dispute.category, "label": dispute.label}
            }
        },
        {
            "$set": {"attributes.$.status": "disputed"}
        }
    )

    return {"message": "Dispute submitted successfully. The AI model will be retrained/reviewed."}

