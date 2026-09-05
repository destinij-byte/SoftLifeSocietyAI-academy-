from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Academy-specific settings. In the real SLS app these should come from
    the app's existing settings module — this stub exists so the module runs
    standalone during development."""

    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db_name: str = "soft_life_society"

    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"

    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_success_url: str = "https://app.softlifesociety.ai/academy/checkout/success"
    stripe_cancel_url: str = "https://app.softlifesociety.ai/academy/checkout/cancel"

    workbook_signing_secret: str = "change-me-too"
    workbook_url_ttl_seconds: int = 3600

    inactivity_nudge_days: int = 5

    model_config = SettingsConfigDict(env_prefix="ACADEMY_", env_file=".env", extra="ignore")


settings = Settings()
