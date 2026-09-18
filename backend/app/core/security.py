"""
Security utilities — API key verification for protected endpoints.

All pipeline trigger endpoints and the /auth/update proxy require the
INTERNAL_API_KEY header to prevent unauthenticated public access.
"""

import logging
import secrets

from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def require_api_key(api_key: str | None = Security(_api_key_header)) -> str:
    """
    FastAPI dependency — validates the X-API-Key header against INTERNAL_API_KEY.

    Uses constant-time comparison to prevent timing attacks.
    Raises 403 if the key is missing or incorrect.
    """
    configured_key = settings.INTERNAL_API_KEY

    if not configured_key:
        # If the key is not configured yet, fail closed in production
        if not settings.DEBUG:
            logger.error("INTERNAL_API_KEY is not configured — blocking request")
            raise HTTPException(status_code=503, detail="Service not configured")
        # Allow through in DEBUG mode only
        return ""

    if not api_key or not secrets.compare_digest(api_key, configured_key):
        raise HTTPException(status_code=403, detail="Invalid or missing API key")

    return api_key
