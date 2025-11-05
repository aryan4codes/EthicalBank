import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import database connection (this will initialize the connection and query logger)
from database import get_database, get_client, get_query_logger, db

app = FastAPI(
    title="EthicalBank API",
    description="Backend API for EthicalBank - Ethical AI Banking Platform",
    version="1.0.0"
)

# CORS middleware - Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all headers
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Get query logger instance (already initialized in database.py)
query_logger = get_query_logger()

# Import routers
from services import profile, ai, chatbot, savings, accounts, transactions, ai_insights, privacy

# Include routers
app.include_router(profile.router)
app.include_router(ai.router)
app.include_router(chatbot.router)
app.include_router(savings.router)
app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(ai_insights.router)
app.include_router(privacy.router)

@app.get("/")
async def root():
    return {"message": "EthicalBank API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    try:
        client = get_client()
        client.admin.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
