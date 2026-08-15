from fastapi import APIRouter

from fitness.api.routers.exercises_catalog import router as catalog_router
from fitness.api.routers.exercises_inbox import router as inbox_router
from fitness.api.routers.exercises_muscles import router as muscles_router
from fitness.api.routers.exercises_teaching import router as teaching_router

router = APIRouter()
router.include_router(catalog_router)
router.include_router(teaching_router)
router.include_router(muscles_router)
router.include_router(inbox_router)
