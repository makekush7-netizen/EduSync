from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from middleware.role_guard import require_role, get_current_user

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.post("", response_model=schemas.CourseResponse)
def create_course(
    course_data: schemas.CourseCreate, 
    current_user: models.Teacher = Depends(require_role(models.UserRole.teacher)), 
    db: Session = Depends(get_db)
):
    if not current_user.school_id:
        raise HTTPException(status_code=400, detail="You must be assigned to a school to create courses")
        
    course = models.Course(
        title=course_data.title,
        description=course_data.description,
        subject_tag=course_data.subject_tag,
        teacher_id=current_user.id,
        school_id=current_user.school_id
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course

@router.get("", response_model=list[schemas.CourseResponse])
def get_all_courses(
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Only Admin, Teacher, and Student belonging to the school or wanting to browse
    school_id = current_user.school_id
    
    courses = db.query(models.Course).all() if not school_id else db.query(models.Course).filter(models.Course.school_id == school_id).all()
    
    result = []
    for c in courses:
        teacher = db.query(models.Teacher).filter(models.Teacher.id == c.teacher_id).first()
        c.teacher_name = teacher.full_name if teacher else "Unknown"
        c.lesson_count = db.query(models.Lesson).filter(models.Lesson.course_id == c.id).count()
        c.enrollment_count = db.query(models.Enrollment).filter(
            models.Enrollment.course_id == c.id, 
            models.Enrollment.status == models.EnrollmentStatus.approved
        ).count()
        
        # Check if current user is enrolled
        if current_user.role == models.UserRole.student:
            enrollment = db.query(models.Enrollment).filter(
                models.Enrollment.course_id == c.id,
                models.Enrollment.student_id == current_user.id
            ).first()
            if enrollment:
                c.enrollment_status = enrollment.status
        
        result.append(c)
        
    return result

@router.get("/my", response_model=list[schemas.CourseResponse])
def get_my_courses(
    current_user: models.Teacher = Depends(require_role(models.UserRole.teacher)), 
    db: Session = Depends(get_db)
):
    courses = db.query(models.Course).filter(models.Course.teacher_id == current_user.id).all()
    for c in courses:
        c.lesson_count = db.query(models.Lesson).filter(models.Lesson.course_id == c.id).count()
        c.enrollment_count = db.query(models.Enrollment).filter(
            models.Enrollment.course_id == c.id, 
            models.Enrollment.status == models.EnrollmentStatus.approved
        ).count()
        c.homework_count = db.query(models.Homework).filter(models.Homework.course_id == c.id).count()
    return courses

@router.get("/{course_id}", response_model=schemas.CourseResponse)
def get_course(
    course_id: str,
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    teacher = db.query(models.Teacher).filter(models.Teacher.id == course.teacher_id).first()
    course.teacher_name = teacher.full_name if teacher else "Unknown"
    
    return course

@router.patch("/{course_id}/prompt")
def update_course_prompt(
    course_id: str,
    prompt_data: schemas.CoursePromptUpdate,
    current_user: models.Teacher = Depends(require_role(models.UserRole.teacher)), 
    db: Session = Depends(get_db)
):
    course = db.query(models.Course).filter(models.Course.id == course_id, models.Course.teacher_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found or unauthorized")
        
    course.chatbot_system_prompt = prompt_data.chatbot_system_prompt
    db.commit()
    return {"message": "System prompt updated"}
