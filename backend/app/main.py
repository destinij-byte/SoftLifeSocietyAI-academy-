"""Standalone dev entrypoint for the Academy module.

In the real SLS backend, skip this file entirely — just add
`app.include_router(academy_router)` to the existing FastAPI app, and mount
the existing auth/db dependencies in place of `app.security` / `app.db`.
"""

from fastapi import FastAPI

from app.academy.router import router as academy_router

app = FastAPI(title="Soft Life Society — Academy (standalone dev server)")
app.include_router(academy_router)


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
