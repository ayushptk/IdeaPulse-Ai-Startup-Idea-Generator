
import urllib.parse
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field, field_validator
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.security import require_api_key
from app.database.db import get_db
from app.models.user import User

# Module-level limiter — shares the same key function as the app-level limiter in main.py
limiter = Limiter(key_func=get_remote_address)

pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

router = APIRouter(prefix="/auth", tags=["Authentication"])


class AuthPayload(BaseModel):
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None
    provider: str
    provider_id: str


class RegisterPayload(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        """Enforce minimum password complexity."""
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


class UpdateProfilePayload(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    picture: Optional[str] = None
    bio: Optional[str] = None


@router.post("/verify")
async def verify_auth(
    payload: AuthPayload,
    db: AsyncSession = Depends(get_db),
    _key: str = Depends(require_api_key),
):
    """
    Upsert an OAuth user record.
    Protected by X-API-Key — should only be called from the Next.js server.
    """
    stmt = select(User).where(User.email == payload.email)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user:
        user = User(
            email=payload.email,
            name=payload.name,
            picture=payload.picture,
            provider=payload.provider,
            provider_id=payload.provider_id,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return {
        "message": "User verified successfully",
        "user": {"id": user.id, "email": user.email, "name": user.name, "picture": user.picture},
    }


@router.post("/register")
@limiter.limit("5/minute")
async def register_user(request: Request, payload: RegisterPayload, db: AsyncSession = Depends(get_db)):
    """
    Register a new user with email/password.
    Rate-limited to 5 requests per minute per IP.
    """

    email_lower = payload.email.lower()
    stmt = select(User).where(User.email == email_lower)
    result = await db.execute(stmt)
    if result.scalars().first():
        # Vague message to prevent account enumeration
        raise HTTPException(status_code=400, detail="Registration failed. Please try a different email.")

    hashed_password = pwd_context.hash(payload.password)

    avatar_url = f"https://api.dicebear.com/7.x/micah/svg?seed={urllib.parse.quote(payload.name)}"
    if payload.name:
        first_name = payload.name.split()[0]
        try:
            async with httpx.AsyncClient() as client:
                # URL-encode user input before using in query string (SSRF mitigation)
                params = {"name": first_name}
                response = await client.get("https://api.genderize.io/", params=params, timeout=3.0)
                if response.status_code == 200:
                    data = response.json()
                    gender = data.get("gender")
                    seed = urllib.parse.quote(payload.name)
                    if gender == "male":
                        avatar_url = f"https://api.dicebear.com/7.x/micah/svg?seed={seed}"
                    elif gender == "female":
                        avatar_url = f"https://api.dicebear.com/7.x/lorelei/svg?seed={seed}"
        except Exception:
            pass

    user = User(
        email=email_lower,
        name=payload.name,
        hashed_password=hashed_password,
        provider="local",
        picture=avatar_url,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {
        "message": "User registered successfully",
        "user": {"id": user.id, "email": user.email, "name": user.name, "picture": user.picture},
    }


@router.post("/login")
@limiter.limit("5/minute")
async def login_user(request: Request, payload: LoginPayload, db: AsyncSession = Depends(get_db)):
    """
    Authenticate a local user.
    Rate-limited to 5 attempts per minute per IP to prevent brute-force.
    """

    email_lower = payload.email.lower()
    stmt = select(User).where(User.email == email_lower)
    result = await db.execute(stmt)
    user = result.scalars().first()

    # Use constant-time comparison via passlib to prevent timing attacks
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not pwd_context.verify(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "message": "Login successful",
        "user": {"id": user.id, "email": user.email, "name": user.name, "picture": user.picture},
    }


@router.patch("/update")
async def update_profile(
    payload: UpdateProfilePayload,
    db: AsyncSession = Depends(get_db),
    _key: str = Depends(require_api_key),
):
    """
    Update user profile.
    Protected by X-API-Key — should only be called from the Next.js server-side
    API route which has already verified the user's NextAuth session.
    The email field identifies the user and is trusted only from authenticated server calls.
    """
    if not payload.email:
        raise HTTPException(status_code=400, detail="Email is required to identify user")

    email_lower = payload.email.lower()
    stmt = select(User).where(User.email == email_lower)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.name is not None:
        user.name = payload.name
    if payload.picture is not None:
        user.picture = payload.picture

    await db.commit()
    await db.refresh(user)

    return {
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "picture": user.picture,
        },
    }
