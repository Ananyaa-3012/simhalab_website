import json
from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    secret_key: str = "change-me-in-production"
    database_url: str = "sqlite:///./simha.db"
    recaptcha_site_key: str = ""
    recaptcha_secret_key: str = ""
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/auth/callback"
    allowed_admin_emails: str = ""
    jwt_access_expiry_minutes: int = 15
    jwt_refresh_expiry_days: int = 7
    cors_origins: str = "http://localhost:5173,https://ananyaa-3012.github.io"
    upload_dir: str = "uploads"
    max_upload_size_mb: int = 10
    dev_admin_password: str = "admin123"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

    @property
    def allowed_emails_list(self) -> list[str]:
        return [e.strip() for e in self.allowed_admin_emails.split(",") if e.strip()]

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


def get_site_config() -> dict:
    config_path = Path(__file__).parent.parent.parent / "config.json"
    if config_path.exists():
        with open(config_path) as f:
            return json.load(f)
    return {}
