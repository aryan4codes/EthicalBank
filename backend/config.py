import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings"""
    mongodb_url: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017/")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    clerk_secret_key: Optional[str] = os.getenv("CLERK_SECRET_KEY")
    database_name: str = "ethicalbank"
    openai_model: str = "gpt-4-turbo-preview"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()


