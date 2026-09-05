from fastapi import APIRouter

from app.academy.routes_admin import router as admin_router
from app.academy.routes_checkout import router as checkout_router
from app.academy.routes_learner import router as learner_router
from app.academy.routes_public import router as public_router

router = APIRouter(prefix="/academy")
router.include_router(public_router)
router.include_router(checkout_router)
router.include_router(learner_router)
router.include_router(admin_router)
