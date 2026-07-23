import uvicorn
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="Spring Boot Style FastAPI Application",
    description="An enterprise-ready backend mapping Spring Boot patterns to Python",
    version="1.0.0",
    docs_url="/swagger-ui",  # Customizing OpenAPI UI endpoints to feel like Springdoc
    redoc_url="/redoc"
)


@app.get("/actuator/health", tags=["Actuator"])
def health_check():
    return {"status": "UP"}