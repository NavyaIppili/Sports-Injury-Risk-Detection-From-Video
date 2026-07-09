from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.routes.health import router as health_router
from app.routes.profile import router as profile_router

app = FastAPI(
    title='Sports Injury Risk Detection API',
    version='0.1.0',
    description='Starter FastAPI application for the sports injury risk detection project.',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(health_router)
app.include_router(auth_router, prefix='/api/v1')
app.include_router(profile_router, prefix='/api/v1')
