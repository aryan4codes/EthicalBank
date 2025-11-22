"""
Script to validate MongoDB schema against the defined models
"""
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL")
client = MongoClient(MONGODB_URL)
db = client["ethicalbank"]

def analyze_collection(collection_name):
    """Analyze a collection's schema from actual documents"""
    print(f"\n{'='*80}")
    print(f"Collection: {collection_name}")
    print(f"{'='*80}")
    
    collection = db[collection_name]
    
    # Get document count
    count = collection.count_documents({})
    print(f"Total Documents: {count}")
    
    if count == 0:
        print("⚠️  No documents found in collection")
        return
    
    # Get a sample document
    sample = collection.find_one()
    
    if sample:
        print(f"\nSample Document Structure:")
        print("-" * 80)
        print_schema(sample, indent=0)
        
        # Get all unique fields across all documents
        print(f"\n\nAll Unique Fields Across Collection:")
        print("-" * 80)
        all_fields = get_all_fields(collection)
        for field in sorted(all_fields):
            print(f"  • {field}")
    
    # Get indexes
    indexes = list(collection.list_indexes())
    if len(indexes) > 1:  # More than just _id index
        print(f"\n\nIndexes:")
        print("-" * 80)
        for idx in indexes:
            print(f"  • {idx['name']}: {idx['key']}")
            if 'unique' in idx and idx['unique']:
                print(f"    (unique)")

def print_schema(obj, indent=0):
    """Recursively print the schema structure"""
    prefix = "  " * indent
    
    if isinstance(obj, dict):
        for key, value in obj.items():
            if isinstance(value, dict):
                print(f"{prefix}{key}: {{")
                print_schema(value, indent + 1)
                print(f"{prefix}}}")
            elif isinstance(value, list):
                if value and len(value) > 0:
                    print(f"{prefix}{key}: [")
                    print_schema(value[0], indent + 1)
                    print(f"{prefix}]")
                else:
                    print(f"{prefix}{key}: []")
            else:
                value_type = type(value).__name__
                if isinstance(value, ObjectId):
                    value_type = "ObjectId"
                elif isinstance(value, datetime):
                    value_type = "datetime"
                print(f"{prefix}{key}: {value_type}")
    else:
        value_type = type(obj).__name__
        if isinstance(obj, ObjectId):
            value_type = "ObjectId"
        elif isinstance(obj, datetime):
            value_type = "datetime"
        print(f"{prefix}{value_type}")

def get_all_fields(collection, prefix=""):
    """Get all unique fields from all documents in a collection"""
    pipeline = [
        {"$project": {"arrayofkeyvalue": {"$objectToArray": "$$ROOT"}}},
        {"$unwind": "$arrayofkeyvalue"},
        {"$group": {"_id": None, "allkeys": {"$addToSet": "$arrayofkeyvalue.k"}}}
    ]
    
    result = list(collection.aggregate(pipeline))
    if result:
        return result[0]["allkeys"]
    return []

def compare_with_defined_schema():
    """Compare actual database with schemas.py definitions"""
    print("\n" + "="*80)
    print("SCHEMA VALIDATION SUMMARY")
    print("="*80)
    
    # Expected collections from schemas.py
    expected_collections = {
        "users": ["clerkId", "email", "firstName", "lastName", "profileCompleted", "kycStatus"],
        "accounts": ["userId", "accountNumber", "accountType", "balance", "status"],
        "transactions": ["accountId", "userId", "type", "amount", "category", "aiAnalysis"],
        "ai_decisions": ["userId", "relatedEntityId", "entityType", "decisionType", "explanation"],
        "consent_records": ["userId", "consentType", "status", "purpose", "dataTypes"],
        "ai_query_logs": ["userId", "queryType", "queryText", "mongoQueries", "attributesAccessed"],
        "savings_accounts": ["userId", "accountNumber", "balance"],
        "savings_goals": ["userId", "accountId", "name", "targetAmount"],
        "ai_insights_cache": ["_id", "data", "created_at"],
        "data_access_permissions": ["userId", "permissions", "createdAt", "updatedAt"],
        "ai_perceptions": ["userId", "attributes", "lastAnalysis", "summary"]
    }
    
    # Get actual collections
    actual_collections = db.list_collection_names()
    
    print("\n📊 Collection Status:")
    print("-" * 80)
    
    for expected, key_fields in expected_collections.items():
        if expected in actual_collections:
            count = db[expected].count_documents({})
            print(f"✅ {expected:25s} - {count:6d} documents")
            
            # Check if key fields exist in sample document
            if count > 0:
                sample = db[expected].find_one()
                missing_fields = [f for f in key_fields if f not in sample]
                if missing_fields:
                    print(f"   ⚠️  Missing fields: {', '.join(missing_fields)}")
        else:
            print(f"❌ {expected:25s} - NOT FOUND")
    
    # Check for unexpected collections
    unexpected = set(actual_collections) - set(expected_collections.keys()) - {"system.indexes"}
    if unexpected:
        print(f"\n⚠️  Unexpected collections found:")
        for coll in unexpected:
            count = db[coll].count_documents({})
            print(f"   • {coll}: {count} documents")

if __name__ == "__main__":
    print("MongoDB Schema Validation Tool")
    print("Database: ethicalbank")
    print("="*80)
    
    # Get all collections
    collections = db.list_collection_names()
    print(f"\nFound {len(collections)} collections:")
    for coll in collections:
        count = db[coll].count_documents({})
        print(f"  • {coll}: {count} documents")
    
    # Analyze each collection in detail
    for collection_name in collections:
        if not collection_name.startswith("system."):
            analyze_collection(collection_name)
    
    # Compare with defined schema
    compare_with_defined_schema()
    
    print("\n" + "="*80)
    print("Validation Complete!")
    print("="*80)
