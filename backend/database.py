"""
Database connection and initialization
"""
from pymongo import MongoClient
from pymongo.monitoring import CommandListener
from config import settings
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# MongoDB Query Logger for tracking data access (Hybrid Approach - Solution 5)
class QueryLogger(CommandListener):
    """MongoDB query logging listener for audit trail"""
    
    def __init__(self):
        self.queries = []
        self.reset()
    
    def reset(self):
        """Reset query log for new request"""
        self.queries = []
    
    def started(self, event):
        pass
    
    def succeeded(self, event):
        try:
            if event.command_name in ["find", "findOne", "aggregate"]:
                # Log basic query info without accessing command details
                # This avoids AttributeError issues with PyMongo event structure
                query_info = {
                    "command": event.command_name,
                    "database": getattr(event, 'database_name', 'unknown'),
                    "timestamp": datetime.now().isoformat()
                }
                self.queries.append(query_info)
                logger.debug(f"MongoDB Query: {query_info}")
        except Exception as e:
            # Silently fail - don't break queries
            logger.debug(f"Query logger error: {e}")
    
    def failed(self, event):
        try:
            failure = getattr(event, 'failure', 'Unknown error')
            logger.error(f"MongoDB Query Failed: {failure}")
        except Exception as e:
            logger.debug(f"Query logger error: {e}")

# Create query logger first
query_logger = QueryLogger()

# Create MongoDB client with event listeners and optimized connection pooling
mongo_client = MongoClient(
    settings.mongodb_url,
    event_listeners=[query_logger],
    maxPoolSize=50,  # Maximum number of connections in the pool
    minPoolSize=10,  # Minimum number of connections to maintain
    maxIdleTimeMS=45000,  # Close connections after 45 seconds of inactivity
    serverSelectionTimeoutMS=5000,  # Timeout for server selection
    socketTimeoutMS=30000,  # Timeout for socket operations
    connectTimeoutMS=10000,  # Timeout for initial connection
    retryWrites=True,  # Enable retryable writes
    retryReads=True,  # Enable retryable reads
)

# Get database instance
db = mongo_client[settings.database_name]

def get_database():
    """Get database instance"""
    return db

def get_client():
    """Get MongoDB client instance"""
    return mongo_client

def get_query_logger():
    """Get query logger instance"""
    return query_logger

