from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth
from routes import dashboard

app = FastAPI()

app.include_router(dashboard.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])

@app.get("/")
def root():
    return {"message": "Job Fit AI Backend Running"}
