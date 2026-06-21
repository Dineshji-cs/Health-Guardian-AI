import os
from pydantic_settings import BaseSettings, SettingsConfigDict

# Determine the path of the root .env file relative to this file
current_dir = os.path.dirname(os.path.abspath(__file__))
env_file_path = os.path.join(current_dir, "../../.env")

class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    PORT: int = 8000
    HOST: str = "127.0.0.1"

    model_config = SettingsConfigDict(
        env_file=env_file_path,
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
