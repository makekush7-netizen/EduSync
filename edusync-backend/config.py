from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./edusync.db"
    SECRET_KEY: str = "supersecretkey_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    
    CLOUDINARY_URL: str = ""
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
