from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from middleware.role_guard import require_role, get_current_user
from services.cloudinary_service import CloudinaryService

router = APIRouter(prefix="", tags=["Lessons"])

@router.post("/courses/{course_id}/lessons", response_model=schemas.LessonResponse)
async def create_lesson(
    course_id: str,
    title: str = Form(...),
    description: str = Form(None),
    content_type: str = Form(...),
    content_text: str = Form(None),
    content_url: str = Form(None),
    file: UploadFile = File(None),
    current_user: models.User = Depends(require_role(models.UserRole.teacher, models.UserRole.admin)), 
    db: Session = Depends(get_db)
):
    # Verify course exists
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    # Check permissions
    if current_user.role == models.UserRole.teacher and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to add lessons to this course")

    url = content_url
    upload_types = {models.ContentType.pdf, models.ContentType.image, models.ContentType.video}
    if content_type in upload_types and file:
        file_bytes = await file.read()
        filename = f"lesson_{course_id}_{file.filename}"
        url = CloudinaryService.upload_file(file_bytes, filename)
    elif content_type in upload_types and not file:
        raise HTTPException(status_code=400, detail="A file is required for this lesson type")

    order = db.query(models.Lesson).filter(models.Lesson.course_id == course_id).count()

    lesson = models.Lesson(
        course_id=course_id,
        title=title,
        description=description,
        content_type=content_type,
        content_url=url,
        content_text=content_text,
        order_index=order
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    
    return lesson

@router.get("/courses/{course_id}/lessons", response_model=list[schemas.LessonResponse])
def get_lessons(
    course_id: str,
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    # Students must be enrolled and approved
    if current_user.role == models.UserRole.student:
        enrollment = db.query(models.Enrollment).filter(
            models.Enrollment.student_id == current_user.id,
            models.Enrollment.course_id == course_id,
            models.Enrollment.status == models.EnrollmentStatus.approved
        ).first()
        if not enrollment:
            raise HTTPException(status_code=403, detail="Not enrolled in this course")

    lessons = db.query(models.Lesson).filter(models.Lesson.course_id == course_id).order_by(models.Lesson.order_index).all()
    return lessons

@router.get("/lessons/{lesson_id}", response_model=schemas.LessonResponse)
def get_single_lesson(
    lesson_id: str,
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    # Students must be enrolled
    if current_user.role == models.UserRole.student:
        enrollment = db.query(models.Enrollment).filter(
            models.Enrollment.student_id == current_user.id,
            models.Enrollment.course_id == lesson.course_id,
            models.Enrollment.status == models.EnrollmentStatus.approved
        ).first()
        if not enrollment:
            raise HTTPException(status_code=403, detail="Not enrolled in this course")

    return lesson
