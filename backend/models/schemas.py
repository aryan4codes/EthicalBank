"""
MongoDB Database Models
Aligned with frontend TypeScript schemas
"""
from pymongo import IndexModel
from datetime import datetime
from typing import Optional, Dict, List, Any
from bson import ObjectId

class DatabaseModels:
    """MongoDB models aligned with frontend schemas"""
    
    @staticmethod
    def get_user_schema():
        """User collection schema matching frontend IUser"""
        return {
            "clerkId": {"type": str, "unique": True, "sparse": True},
            "email": {"type": str, "required": True, "unique": True},
            "password": {"type": str},  # Optional if using Clerk
            "firstName": {"type": str, "required": True},
            "lastName": {"type": str, "required": True},
            "phoneNumber": {"type": str},
            "dateOfBirth": {"type": datetime},
            "income": {"type": float},  # Annual income
            "employmentStatus": {"type": str},  # employed, self_employed, unemployed, retired
            "creditScore": {"type": int},  # 300-850
            "address": {
                "street": str,
                "city": str,
                "state": str,
                "zipCode": str,
                "country": str
            },
            "preferences": {
                "theme": str,  # light, dark, system
                "language": str,
                "notifications": {
                    "email": bool,
                    "sms": bool,
                    "push": bool
                }
            },
            "kycStatus": {"type": str, "default": "pending"},  # pending, verified, rejected
            "isActive": {"type": bool, "default": True},
            "profileCompleted": {"type": bool, "default": False},  # NEW: Track profile completion
            "lastLoginAt": {"type": datetime},
            "createdAt": {"type": datetime, "default": datetime.now},
            "updatedAt": {"type": datetime, "default": datetime.now}
        }
    
    @staticmethod
    def get_account_schema():
        """Account collection schema matching frontend IAccount"""
        return {
            "userId": {"type": ObjectId, "required": True, "ref": "users"},
            "accountNumber": {"type": str, "required": True, "unique": True},
            "accountType": {"type": str, "required": True},  # checking, savings, credit, loan, investment
            "balance": {"type": float, "required": True, "default": 0},
            "currency": {"type": str, "default": "INR"},
            "status": {"type": str, "default": "active"},  # active, inactive, frozen, closed
            "metadata": {
                "creditLimit": float,
                "interestRate": float,
                "minimumBalance": float,
                "overdraftLimit": float
            },
            "createdAt": {"type": datetime, "default": datetime.now},
            "updatedAt": {"type": datetime, "default": datetime.now}
        }
    
    @staticmethod
    def get_transaction_schema():
        """Transaction collection schema matching frontend ITransaction"""
        return {
            "accountId": {"type": ObjectId, "required": True, "ref": "accounts"},
            "userId": {"type": ObjectId, "required": True, "ref": "users"},
            "type": {"type": str, "required": True},  # debit, credit
            "amount": {"type": float, "required": True},
            "currency": {"type": str, "default": "INR"},
            "description": {"type": str, "required": True},
            "category": {"type": str, "required": True},
            "merchantName": {"type": str},
            "merchantCategory": {"type": str},
            "location": {
                "country": str,
                "city": str,
                "coordinates": [float, float]
            },
            "status": {"type": str, "default": "completed"},  # pending, completed, failed, cancelled
            "metadata": {
                "reference": str,
                "externalId": str,
                "fees": float,
                "exchangeRate": float
            },
            "aiAnalysis": {
                "fraudScore": {"type": float, "default": 0},
                "riskLevel": {"type": str, "default": "low"},  # low, medium, high
                "categoryConfidence": {"type": float, "default": 0.5},
                "anomalyScore": {"type": float, "default": 0},
                "explanation": str
            },
            "createdAt": {"type": datetime, "default": datetime.now},
            "updatedAt": {"type": datetime, "default": datetime.now}
        }
    
    @staticmethod
    def get_ai_decision_schema():
        """AI Decision collection schema matching frontend IAIDecision"""
        return {
            "userId": {"type": ObjectId, "required": True, "ref": "users"},
            "relatedEntityId": {"type": ObjectId},
            "entityType": {"type": str, "required": True},  # transaction, account, loan, credit_application
            "decisionType": {"type": str, "required": True},  # approval, denial, flag, recommendation
            "status": {"type": str, "required": True},  # approved, denied, flagged, under_review
            "aiModel": {
                "name": str,
                "version": str,
                "confidence": float,
                "biasCheck": bool
            },
            "explanation": {
                "summary": str,
                "details": str,
                "factors": [
                    {
                        "name": str,
                        "value": Any,
                        "weight": float,
                        "impact": str  # positive, negative, neutral
                    }
                ],
                "recommendations": [str]
            },
            "humanReview": {
                "reviewedBy": str,
                "reviewedAt": datetime,
                "decision": str,  # confirmed, overridden
                "notes": str
            },
            "createdAt": {"type": datetime, "default": datetime.now},
            "updatedAt": {"type": datetime, "default": datetime.now}
        }
    
    @staticmethod
    def get_consent_record_schema():
        """Consent Record collection schema matching frontend IConsentRecord"""
        return {
            "userId": {"type": ObjectId, "required": True, "ref": "users"},
            "consentType": {"type": str, "required": True},
            "status": {"type": str, "required": True},  # granted, revoked, expired
            "purpose": {"type": str, "required": True},
            "dataTypes": {"type": list, "required": True},
            "expiresAt": {"type": datetime},
            "metadata": {
                "ipAddress": str,
                "userAgent": str,
                "source": str  # web, mobile, api
            },
            "version": {"type": str, "required": True},
            "createdAt": {"type": datetime, "default": datetime.now},
            "updatedAt": {"type": datetime, "default": datetime.now}
        }
    
    @staticmethod
    def get_ai_query_log_schema():
        """AI Query Log collection for audit trail"""
        return {
            "userId": {"type": ObjectId, "required": True, "ref": "users"},
            "queryType": {"type": str, "required": True},  # loan_eligibility, profile_explanation, etc.
            "queryText": {"type": str, "required": True},
            "loanAmount": {"type": float},  # If applicable
            
            # Data Access Tracking
            "mongoQueries": [
                {
                    "command": str,
                    "collection": str,
                    "filter": dict,
                    "projection": dict,
                    "pipeline": list,
                    "timestamp": datetime
                }
            ],
            "attributesAccessed": {"type": list},  # Schema paths like ["user.income", "accounts.balance"]
            "userDataSnapshot": {"type": dict},  # Snapshot of data used
            
            # AI Response Tracking
            "aiModel": {"type": str},
            "aiModelVersion": {"type": str},
            "aiResponse": {"type": dict},
            "aiReportedAttributes": {"type": list},
            
            # Validation
            "validatedAttributes": {"type": list},
            "validationStatus": {"type": str},  # matched, partial, mismatch
            
            # Metadata
            "timestamp": {"type": datetime, "default": datetime.now},
            "processingTimeMs": {"type": float},
            "userConsentId": {"type": ObjectId},
            "ipAddress": {"type": str},
            "userAgent": {"type": str}
        }
    
    @staticmethod
    def get_ai_insights_cache_schema():
        """AI Insights Cache collection for storing pre-computed insights"""
        return {
            "_id": {"type": str, "required": True},  # userId or composite key
            "data": {
                "profileSummary": {
                    "income": float,
                    "creditScore": int,
                    "totalBalance": float,
                    "totalSavings": float,
                    "savingsRate": float,
                    "emergencyFundMonths": float,
                    "monthlySpending": float,
                    "monthlyIncome": float,
                    "activeGoals": int,
                    "accountCount": int
                },
                "financialPlanning": {
                    "summary": str,
                    "plans": list,
                    "attributes_used": list
                },
                "spendingAnalysis": {
                    "totalSpending": float,
                    "monthlyAverage": float,
                    "categories": list,
                    "wasteAnalysis": list,
                    "attributes_used": list
                },
                "healthScore": {
                    "overall": int,
                    "savingsRate": float,
                    "creditScore": int,
                    "emergencyFund": float,
                    "spendingControl": float
                },
                "attributes_used": list
            },
            "created_at": {"type": datetime, "default": datetime.now}
        }
    
    @staticmethod
    def get_data_access_permissions_schema():
        """Data Access Permissions collection for granular user data access control"""
        return {
            "userId": {"type": ObjectId, "required": True, "ref": "users"},
            "permissions": {
                # User permissions
                "user.income": bool,
                "user.creditScore": bool,
                "user.dateOfBirth": bool,
                "user.employmentStatus": bool,
                "user.address": bool,
                "user.email": bool,
                "user.firstName": bool,
                "user.lastName": bool,
                "user.phoneNumber": bool,
                # Account permissions
                "accounts.balance": bool,
                "accounts.accountType": bool,
                "accounts.accountNumber": bool,
                "accounts.status": bool,
                # Transaction permissions
                "transactions.amount": bool,
                "transactions.category": bool,
                "transactions.description": bool,
                "transactions.type": bool,
                "transactions.createdAt": bool,
                "transactions.merchantName": bool,
                # Savings permissions
                "savings_accounts.balance": bool,
                "savings_accounts.accountType": bool,
                "savings_accounts.apy": bool,
                "savings_accounts.interestRate": bool,
                "savings_goals.targetAmount": bool,
                "savings_goals.currentAmount": bool,
                "savings_goals.monthlyContribution": bool,
                "savings_goals.status": bool
            },
            "createdAt": {"type": datetime, "default": datetime.now},
            "updatedAt": {"type": datetime, "default": datetime.now}
        }
    
    @staticmethod
    def get_ai_perceptions_schema():
        """AI Perceptions collection for storing AI's understanding of user attributes"""
        return {
            "userId": {"type": ObjectId, "required": True, "ref": "users"},
            "attributes": [
                {
                    "category": str,  # financial, behavioral, demographic
                    "label": str,  # e.g., "high_income", "frequent_saver"
                    "confidence": float,  # 0-1
                    "evidence": [str],  # List of supporting data points
                    "lastUpdated": datetime,
                    "status": str  # active, outdated, disputed
                }
            ],
            "lastAnalysis": {"type": datetime, "default": datetime.now},
            "summary": {"type": str}  # Human-readable summary of perceptions
        }
    
    @staticmethod
    def get_savings_goals_schema():
        """Savings Goals collection schema"""
        return {
            "userId": {"type": ObjectId, "required": True, "ref": "users"},
            "accountId": {"type": ObjectId, "required": True, "ref": "savings_accounts"},
            "name": {"type": str, "required": True},  # Goal name (e.g., "Emergency Fund")
            "targetAmount": {"type": float, "required": True},
            "currentAmount": {"type": float, "default": 0},
            "deadline": {"type": datetime},
            "monthlyContribution": {"type": float},
            "priority": {"type": str},  # high, medium, low
            "category": {"type": str},  # emergency, vacation, retirement, etc.
            "status": {"type": str, "default": "active"},  # active, completed, cancelled
            "createdAt": {"type": datetime, "default": datetime.now},
            "updatedAt": {"type": datetime, "default": datetime.now}
        }
    
    @staticmethod
    def get_savings_accounts_schema():
        """Savings Accounts collection schema"""
        return {
            "userId": {"type": ObjectId, "required": True, "ref": "users"},
            "name": {"type": str, "required": True},
            "accountNumber": {"type": str, "required": True, "unique": True},
            "balance": {"type": float, "default": 0},
            "interestRate": {"type": float},  # Annual interest rate
            "apy": {"type": float},  # Annual percentage yield
            "accountType": {"type": str},  # high_yield, regular, money_market
            "institution": {"type": str},
            "minimumBalance": {"type": float},
            "status": {"type": str, "default": "active"},  # active, inactive, closed
            "createdAt": {"type": datetime, "default": datetime.now},
            "updatedAt": {"type": datetime, "default": datetime.now}
        }

def create_indexes(db):
    """Create indexes for optimal performance"""
    
    # Users collection indexes
    db.users.create_indexes([
        IndexModel([("clerkId", 1)], unique=True, sparse=True),
        IndexModel([("email", 1)], unique=True),
        IndexModel([("profileCompleted", 1)]),
        IndexModel([("kycStatus", 1)]),
        IndexModel([("isActive", 1)])
    ])
    
    # Accounts collection indexes
    db.accounts.create_indexes([
        IndexModel([("userId", 1)]),
        IndexModel([("accountNumber", 1)], unique=True),
        IndexModel([("userId", 1), ("status", 1)]),
        IndexModel([("userId", 1), ("accountType", 1)])
    ])
    
    # Transactions collection indexes
    db.transactions.create_indexes([
        IndexModel([("userId", 1), ("createdAt", -1)]),
        IndexModel([("accountId", 1), ("createdAt", -1)]),
        IndexModel([("userId", 1), ("category", 1)])
    ])
    
    # AI Decisions collection indexes
    db.ai_decisions.create_indexes([
        IndexModel([("userId", 1), ("createdAt", -1)]),
        IndexModel([("relatedEntityId", 1)]),
        IndexModel([("status", 1)])
    ])
    
    # AI Query Logs collection indexes
    db.ai_query_logs.create_indexes([
        IndexModel([("userId", 1), ("timestamp", -1)]),
        IndexModel([("userId", 1), ("queryType", 1)]),
        IndexModel([("timestamp", -1)])
    ])
    
    # Consent Records collection indexes
    db.consent_records.create_indexes([
        IndexModel([("userId", 1), ("consentType", 1)]),
        IndexModel([("userId", 1), ("status", 1)]),
        IndexModel([("expiresAt", 1)], sparse=True)
    ])
    
    # Savings Accounts collection indexes
    db.savings_accounts.create_indexes([
        IndexModel([("userId", 1)]),
        IndexModel([("userId", 1), ("createdAt", -1)]),
        IndexModel([("accountNumber", 1)], unique=True)
    ])
    
    # Savings Goals collection indexes
    db.savings_goals.create_indexes([
        IndexModel([("userId", 1)]),
        IndexModel([("userId", 1), ("createdAt", -1)]),
        IndexModel([("accountId", 1)]),
        IndexModel([("deadline", 1)])
    ])
    
    # AI Insights Cache collection indexes
    db.ai_insights_cache.create_indexes([
        IndexModel([("_id", 1)], unique=True),
        IndexModel([("created_at", -1)])
    ])
    
    # Data Access Permissions collection indexes
    db.data_access_permissions.create_indexes([
        IndexModel([("userId", 1)], unique=True),
        IndexModel([("updatedAt", -1)])
    ])
    
    # AI Perceptions collection indexes
    db.ai_perceptions.create_indexes([
        IndexModel([("userId", 1)], unique=True),
        IndexModel([("userId", 1), ("lastAnalysis", -1)]),
        IndexModel([("lastAnalysis", -1)])
    ])


