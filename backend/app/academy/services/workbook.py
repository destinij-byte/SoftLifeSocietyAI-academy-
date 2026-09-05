"""Signed, time-limited workbook download links.

If the app already stores workbooks in S3 (or similar), prefer generating a
native presigned URL there instead — this HMAC scheme is a
provider-agnostic fallback so `workbook_url` can point at any static file
host and still be gated behind purchase.
"""

import hashlib
import hmac
import time
from datetime import datetime, timezone
from urllib.parse import urlencode

from app.config import settings


def _sign(course_id: str, expires_at: int) -> str:
    message = f"{course_id}:{expires_at}".encode()
    return hmac.new(settings.workbook_signing_secret.encode(), message, hashlib.sha256).hexdigest()


def generate_signed_workbook_url(course_id: str, workbook_url: str) -> tuple[str, datetime]:
    expires_at = int(time.time()) + settings.workbook_url_ttl_seconds
    signature = _sign(course_id, expires_at)
    query = urlencode({"expires": expires_at, "signature": signature, "course_id": course_id})
    signed_url = f"{workbook_url}?{query}"
    return signed_url, datetime.fromtimestamp(expires_at, tz=timezone.utc)


def verify_signed_workbook_url(course_id: str, expires_at: int, signature: str) -> bool:
    if time.time() > expires_at:
        return False
    expected = _sign(course_id, expires_at)
    return hmac.compare_digest(expected, signature)
