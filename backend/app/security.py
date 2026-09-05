"""Auth stand-in for the existing Soft Life Society backend.

Academy has no login system of its own — it reuses SLS accounts. This module
exists only so the Academy router is runnable standalone during development.
When wiring Academy into the real backend, delete this file and import the
app's real `get_current_user` / `require_admin` dependencies instead; every
route in `app/academy/` depends on the two functions below by name only.
"""

from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.config import settings
from app.db import get_database

bearer_scheme = HTTPBearer(auto_error=False)


class CurrentUser:
    def __init__(self, id: str, email: str, is_admin: bool = False):
        self.id = id
        self.email = email
        self.is_admin = is_admin


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> CurrentUser:
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    try:
        payload = jwt.decode(
            credentials.credentials, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
    except JWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token payload")

    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")

    return CurrentUser(
        id=str(user["_id"]),
        email=user.get("email", ""),
        is_admin=bool(user.get("is_admin", False)),
    )


async def require_admin(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if not user.is_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin access required")
    return user
