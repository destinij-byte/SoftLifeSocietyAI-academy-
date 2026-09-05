import time
from urllib.parse import parse_qs, urlparse

from app.academy.services.workbook import generate_signed_workbook_url, verify_signed_workbook_url


def test_generated_url_verifies_successfully():
    signed_url, expires_at = generate_signed_workbook_url("course123", "https://cdn.example.com/wb.pdf")

    parsed = urlparse(signed_url)
    query = parse_qs(parsed.query)

    assert verify_signed_workbook_url("course123", int(query["expires"][0]), query["signature"][0])


def test_tampered_signature_fails_verification():
    signed_url, _ = generate_signed_workbook_url("course123", "https://cdn.example.com/wb.pdf")
    parsed = urlparse(signed_url)
    query = parse_qs(parsed.query)

    assert not verify_signed_workbook_url("course123", int(query["expires"][0]), "bad-signature")


def test_expired_url_fails_verification():
    expired_timestamp = int(time.time()) - 10
    assert not verify_signed_workbook_url("course123", expired_timestamp, "irrelevant")
