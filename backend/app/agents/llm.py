"""Azure OpenAI Service client wrapper with strict latency timeout and fallback."""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any, Dict, Optional
from openai import AsyncAzureOpenAI
from app.config import settings

logger = logging.getLogger("pitchpulse.llm")


class AzureLLMClient:
    """Wrapper around AsyncAzureOpenAI with graceful fallback."""

    def __init__(self) -> None:
        self._client: Optional[AsyncAzureOpenAI] = None
        if settings.azure_enabled:
            try:
                self._client = AsyncAzureOpenAI(
                    api_key=settings.azure_openai_api_key,
                    azure_endpoint=settings.azure_openai_endpoint,
                    api_version=settings.azure_openai_api_version,
                )
                logger.info("Azure OpenAI client initialized successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize Azure OpenAI client: {e}")
                self._client = None

    @property
    def is_available(self) -> bool:
        return self._client is not None

    async def complete_json(
        self,
        system_prompt: str,
        user_prompt: str,
        timeout_sec: Optional[float] = None,
    ) -> Optional[Dict[str, Any]]:
        """Execute chat completion expecting JSON output. Returns None on failure or timeout."""
        if not self.is_available or self._client is None:
            return None

        timeout = timeout_sec or settings.llm_timeout_sec
        try:
            coro = self._client.chat.completions.create(
                model=settings.azure_openai_deployment,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
                max_tokens=600,
            )
            response = await asyncio.wait_for(coro, timeout=timeout)
            content = response.choices[0].message.content
            if content:
                return json.loads(content)
        except asyncio.TimeoutError:
            logger.warning(f"Azure OpenAI call timed out after {timeout}s; falling back to deterministic engine.")
        except Exception as e:
            logger.warning(f"Azure OpenAI completion failed: {e}; falling back to deterministic engine.")

        return None


# Global singleton client
llm_client = AzureLLMClient()
