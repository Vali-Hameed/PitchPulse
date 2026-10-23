"""Environment configuration for PitchPulse Studio.

Azure OpenAI is enabled automatically when both the API key and endpoint are
present. Otherwise every agent uses the deterministic local engine, which
mirrors the same pipeline contract (Narrator -> Verifier -> Persona).
"""

from __future__ import annotations

from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    azure_openai_api_key: str = ""
    azure_openai_endpoint: str = ""
    azure_openai_deployment: str = "gpt-4o"
    azure_openai_api_version: str = "2024-08-01-preview"

    llm_timeout_sec: float = 2.5
    organic_cooldown_sec: float = 8.0
    scenario_post_cooldown_sec: float = 12.0

    cors_origins: str = "*"
    deployment_region: str = "WestUS"
    # Azure Container Apps injects CONTAINER_APP_NAME into every replica.
    container_app_name: str = ""
    port: int = 8000

    @property
    def azure_enabled(self) -> bool:
        return bool(self.azure_openai_api_key.strip() and self.azure_openai_endpoint.strip())

    @property
    def running_on_aca(self) -> bool:
        return bool(self.container_app_name.strip())

    @property
    def hosting_label(self) -> str:
        return f"ACA-{self.deployment_region}" if self.running_on_aca else "Local Docker"

    @property
    def model_mode(self) -> str:
        return "Azure OpenAI GPT-4o" if self.azure_enabled else "Deterministic Engine"

    @property
    def cors_origin_list(self) -> List[str]:
        raw = [o.strip() for o in self.cors_origins.split(",") if o.strip()]
        return raw or ["*"]


settings = Settings()
