"""
Database Optimization Script
Creates indexes for frequently queried fields to improve query performance
Run this script once to set up indexes: python optimize_database.py
"""
from database import get_database, get_client
from pymongo.errors import DuplicateKeyError, OperationFailure
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_index_safe(collection, index_spec, **kwargs):
    """Safely create an index, handling errors gracefully"""
    try:
        # Check if index already exists
        existing_indexes = collection.index_information()
        index_name = collection.create_index(index_spec, **kwargs)
        
        # Check if it's a new index or existing
        if index_name in existing_indexes:
            logger.info(f"  ✓ Index already exists: {index_name}")
        else:
            logger.info(f"  ✓ Created index: {index_name}")
        return True
    except DuplicateKeyError as e:
        logger.warning(f"  ⚠ Could not create unique index (duplicate data): {index_spec}")
        logger.warning(f"    Error: {str(e)[:100]}...")
        # Try creating non-unique version
        try:
            kwargs.pop('unique', None)
            index_name = collection.create_index(index_spec, background=True, **kwargs)
            logger.info(f"  ✓ Created non-unique index instead: {index_name}")
            return True
        except Exception as e2:
            logger.error(f"  ✗ Failed to create non-unique index: {e2}")
            return False
    except OperationFailure as e:
        if "already exists" in str(e).lower():
            logger.info(f"  ✓ Index already exists: {index_spec}")
            return True
        else:
            logger.error(f"  ✗ Failed to create index: {e}")
            return False
    except Exception as e:
        logger.error(f"  ✗ Unexpected error creating index: {e}")
        return False

def create_indexes():
    """Create indexes on frequently queried fields"""
    db = get_database()
    
    # Verify database name
    db_name = db.name
    logger.info(f"Connected to database: {db_name}")
    logger.info("Creating database indexes...")
    logger.info("=" * 60)
    
    # Users collection indexes
    logger.info("Creating indexes on users collection...")
    create_index_safe(db.users, "clerkId", unique=True, background=True)
    create_index_safe(db.users, "email", unique=False, background=True)  # Non-unique due to duplicates
    create_index_safe(db.users, "userId", background=True)
    
    # Accounts collection indexes
    logger.info("Creating indexes on accounts collection...")
    create_index_safe(db.accounts, "userId", background=True)
    create_index_safe(db.accounts, [("userId", 1), ("status", 1)], background=True)
    create_index_safe(db.accounts, [("userId", 1), ("accountNumber", 1)], background=True)
    create_index_safe(db.accounts, "accountNumber", background=True)
    create_index_safe(db.accounts, "createdAt", background=True)
    
    # Transactions collection indexes
    logger.info("Creating indexes on transactions collection...")
    create_index_safe(db.transactions, "userId", background=True)
    create_index_safe(db.transactions, [("userId", 1), ("date", -1)], background=True)
    create_index_safe(db.transactions, [("userId", 1), ("type", 1)], background=True)
    create_index_safe(db.transactions, [("userId", 1), ("category", 1)], background=True)
    create_index_safe(db.transactions, [("userId", 1), ("accountId", 1)], background=True)
    create_index_safe(db.transactions, "createdAt", background=True)
    create_index_safe(db.transactions, "date", background=True)
    
    # Savings accounts indexes
    logger.info("Creating indexes on savings_accounts collection...")
    create_index_safe(db.savings_accounts, "userId", background=True)
    create_index_safe(db.savings_accounts, [("userId", 1), ("status", 1)], background=True)
    create_index_safe(db.savings_accounts, "accountNumber", background=True)
    
    # Savings goals indexes
    logger.info("Creating indexes on savings_goals collection...")
    create_index_safe(db.savings_goals, "userId", background=True)
    create_index_safe(db.savings_goals, [("userId", 1), ("status", 1)], background=True)
    create_index_safe(db.savings_goals, "deadline", background=True)
    
    # AI decisions indexes
    logger.info("Creating indexes on ai_decisions collection...")
    create_index_safe(db.ai_decisions, "userId", background=True)
    create_index_safe(db.ai_decisions, [("userId", 1), ("timestamp", -1)], background=True)
    create_index_safe(db.ai_decisions, "transactionId", background=True)
    
    # AI query logs indexes
    logger.info("Creating indexes on ai_query_logs collection...")
    create_index_safe(db.ai_query_logs, "userId", background=True)
    create_index_safe(db.ai_query_logs, [("userId", 1), ("timestamp", -1)], background=True)
    create_index_safe(db.ai_query_logs, "queryType", background=True)
    
    # Consent records indexes
    logger.info("Creating indexes on consent_records collection...")
    create_index_safe(db.consent_records, "userId", background=True)
    create_index_safe(db.consent_records, [("userId", 1), ("timestamp", -1)], background=True)
    create_index_safe(db.consent_records, "status", background=True)
    
    # AI perceptions indexes
    logger.info("Creating indexes on ai_perceptions collection...")
    create_index_safe(db.ai_perceptions, "userId", background=True)
    create_index_safe(db.ai_perceptions, [("userId", 1), ("lastAnalysis", -1)], background=True)
    
    logger.info("=" * 60)
    logger.info("✅ Index creation completed!")

if __name__ == "__main__":
    create_indexes()

