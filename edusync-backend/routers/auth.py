from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from services.auth_service import AuthService
from middleware.role_guard import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=schemas.Token)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password
    hashed_password = AuthService.get_password_hash(user_data.password)

    # Create user based on role
    if user_data.role == models.UserRole.admin:
        db_user = models.Admin(email=user_data.email, password_hash=hashed_password, full_name=user_data.full_name)
    elif user_data.role == models.UserRole.teacher:
        db_user = models.Teacher(email=user_data.email, password_hash=hashed_password, full_name=user_data.full_name)
    else:
        db_user = models.Student(email=user_data.email, password_hash=hashed_password, full_name=user_data.full_name)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    access_token = AuthService.create_access_token(db_user)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=schemas.Token)
def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if not user or not AuthService.verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = AuthService.create_access_token(user)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user
