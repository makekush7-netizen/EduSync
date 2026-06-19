from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from middleware.role_guard import require_role, get_current_user
from services.cloudinary_service import CloudinaryService
from datetime import datetime

router = APIRouter(prefix="", tags=["Homework"])

@router.post("/courses/{course_id}/homework", response_model=schemas.HomeworkResponse)
def create_homework(
    course_id: str,
    hw_data: schemas.HomeworkCreate,
    current_user: models.User = Depends(require_role(models.UserRole.teacher, models.UserRole.admin)), 
    db: Session = Depends(get_db)
):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    if current_user.role == models.UserRole.teacher and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    hw = models.Homework(
        course_id=course_id,
        assigned_by=current_user.id,
        title=hw_data.title,
        description=hw_data.description,
        due_date=hw_data.due_date,
        allowed_types=hw_data.allowed_types
    )
    db.add(hw)
    db.commit()
    db.refresh(hw)
    return hw

@router.get("/courses/{course_id}/homework", response_model=list[schemas.HomeworkResponse])
def get_homework(
    course_id: str,
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role == models.UserRole.student:
        enrollment = db.query(models.Enrollment).filter(
            models.Enrollment.student_id == current_user.id,
            models.Enrollment.course_id == course_id,
            models.Enrollment.status == models.EnrollmentStatus.approved
        ).first()
        if not enrollment:
            raise HTTPException(status_code=403, detail="Not enrolled")

    homeworks = db.query(models.Homework).filter(models.Homework.course_id == course_id).all()
    
    result = []
    for hw in homeworks:
        hw_dict = {
            "id": hw.id,
            "course_id": hw.course_id,
            "assigned_by": hw.assigned_by,
            "title": hw.title,
            "description": hw.description,
            "due_date": hw.due_date,
            "allowed_types": hw.allowed_types
        }
        
        if current_user.role in [models.UserRole.teacher, models.UserRole.admin]:
            hw_dict["submission_count"] = db.query(models.Submission).filter(models.Submission.homework_id == hw.id).count()
        elif current_user.role == models.UserRole.student:
            submission = db.query(models.Submission).filter(
                models.Submission.homework_id == hw.id,
                models.Submission.student_id == current_user.id
            ).first()
            hw_dict["submitted"] = bool(submission)
            
        result.append(hw_dict)
        
    return result

@router.post("/homework/{homework_id}/submit", response_model=schemas.SubmissionResponse)
async def submit_homework(
    homework_id: str,
    content_type: str = Form(...),
    content_text: str = Form(None),
    file: UploadFile = File(None),
    current_user: models.Student = Depends(require_role(models.UserRole.student)), 
    db: Session = Depends(get_db)
):
    hw = db.query(models.Homework).filter(models.Homework.id == homework_id).first()
    if not hw:
        raise HTTPException(status_code=404, detail="Homework not found")

    # Check enrollment
    enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.student_id == current_user.id,
        models.Enrollment.course_id == hw.course_id,
        models.Enrollment.status == models.EnrollmentStatus.approved
    ).first()
    if not enrollment:
        raise HTTPException(status_code=403, detail="Not enrolled")

    # Check if already submitted
    existing = db.query(models.Submission).filter(
        models.Submission.homework_id == homework_id,
        models.Submission.student_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already submitted")

    if content_type not in hw.allowed_types:
        raise HTTPException(status_code=400, detail=f"Allowed types: {hw.allowed_types}")

    url = None
    if content_type in ["pdf", "image"] and file:
        file_bytes = await file.read()
        filename = f"sub_{homework_id}_{current_user.id}_{file.filename}"
        url = CloudinaryService.upload_file(file_bytes, filename)

    submission = models.Submission(
        homework_id=homework_id,
        student_id=current_user.id,
        content_type=content_type,
        content_text=content_text,
        content_url=url
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    return submission

@router.get("/homework/{homework_id}/submissions", response_model=list[schemas.SubmissionResponse])
def get_submissions(
    homework_id: str,
    current_user: models.User = Depends(require_role(models.UserRole.teacher, models.UserRole.admin)), 
    db: Session = Depends(get_db)
):
    hw = db.query(models.Homework).filter(models.Homework.id == homework_id).first()
    if not hw:
        raise HTTPException(status_code=404, detail="Homework not found")
        
    if current_user.role == models.UserRole.teacher:
        course = db.query(models.Course).filter(models.Course.id == hw.course_id).first()
        if course.teacher_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")

    submissions = db.query(models.Submission).filter(models.Submission.homework_id == homework_id).all()
    
    for sub in submissions:
        student = db.query(models.Student).filter(models.Student.id == sub.student_id).first()
        sub.student_name = student.full_name if student else "Unknown"
        sub.student_email = student.email if student else "Unknown"
        
    return submissions
