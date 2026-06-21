from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = ""
    SUPABASE_DATABASE_URL: str = ""
    SECRET_KEY: str = "supersecretkey_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    
    CLOUDINARY_URL: str = ""
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"

    def get_database_url(self) -> str:
        candidates = [self.SUPABASE_DATABASE_URL, self.DATABASE_URL]
        bad_tokens = ("<host>", "<password>", "<secret>", "<api_key>", "<api_secret>", "<cloud_name>", "[YOUR-PASSWORD]")

        for url in candidates:
            if url and not any(token in url for token in bad_tokens):
                return url

        return "sqlite:///./edusync.db"

settings = Settings()
