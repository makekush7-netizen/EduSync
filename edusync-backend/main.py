from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import auth, schools, courses, lessons, homework, enrollments, chat, upload

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="EduSync API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development. Update in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root path
@app.get("/")
def read_root():
    return {"message": "Welcome to EduSync API"}

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(schools.router, prefix="/api/v1")
app.include_router(courses.router, prefix="/api/v1")
app.include_router(lessons.router, prefix="/api/v1")
app.include_router(homework.router, prefix="/api/v1")
app.include_router(enrollments.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(upload.router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
