from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from middleware.role_guard import require_role, get_current_user
from datetime import datetime

router = APIRouter(prefix="", tags=["Enrollments"])

@router.post("/courses/{course_id}/enroll")
def request_enrollment(
    course_id: str,
    current_user: models.Student = Depends(require_role(models.UserRole.student)), 
    db: Session = Depends(get_db)
):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    existing = db.query(models.Enrollment).filter(
        models.Enrollment.student_id == current_user.id,
        models.Enrollment.course_id == course_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Enrollment request already exists")

    enrollment = models.Enrollment(
        student_id=current_user.id,
        course_id=course_id,
        status=models.EnrollmentStatus.pending
    )
    db.add(enrollment)
    db.commit()
    return {"message": "Enrollment requested"}

@router.post("/courses/join")
def join_course_with_code(
    join_data: schemas.CourseJoin,
    current_user: models.Student = Depends(require_role(models.UserRole.student)), 
    db: Session = Depends(get_db)
):
    course = db.query(models.Course).filter(models.Course.invite_code == join_data.invite_code).first()
    if not course:
        raise HTTPException(status_code=404, detail="Invalid course invite code")

    existing = db.query(models.Enrollment).filter(
        models.Enrollment.student_id == current_user.id,
        models.Enrollment.course_id == course.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already requested or enrolled in this course")

    enrollment = models.Enrollment(
        student_id=current_user.id,
        course_id=course.id,
        status=models.EnrollmentStatus.approved, # Instantly approved when using code
        reviewed_at=datetime.utcnow()
    )
    db.add(enrollment)
    db.commit()
    return {"message": "Successfully joined the course", "course_id": course.id}

@router.get("/courses/{course_id}/enrollments", response_model=list[schemas.EnrollmentResponse])
def get_course_enrollments(
    course_id: str,
    current_user: models.User = Depends(require_role(models.UserRole.teacher, models.UserRole.admin)), 
    db: Session = Depends(get_db)
):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if current_user.role == models.UserRole.teacher and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    enrollments = db.query(models.Enrollment).filter(models.Enrollment.course_id == course_id).all()
    for e in enrollments:
        student = db.query(models.Student).filter(models.Student.id == e.student_id).first()
        e.student_name = student.full_name
        e.student_email = student.email
        
    return enrollments

@router.patch("/enrollments/{enrollment_id}/approve")
def approve_enrollment(
    enrollment_id: str,
    current_user: models.User = Depends(require_role(models.UserRole.teacher, models.UserRole.admin)), 
    db: Session = Depends(get_db)
):
    enrollment = db.query(models.Enrollment).filter(models.Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    if current_user.role == models.UserRole.teacher:
        course = db.query(models.Course).filter(models.Course.id == enrollment.course_id).first()
        if course.teacher_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")

    enrollment.status = models.EnrollmentStatus.approved
    enrollment.reviewed_at = datetime.utcnow()
    db.commit()
    return {"message": "Enrollment approved"}

@router.patch("/enrollments/{enrollment_id}/reject")
def reject_enrollment(
    enrollment_id: str,
    current_user: models.User = Depends(require_role(models.UserRole.teacher, models.UserRole.admin)), 
    db: Session = Depends(get_db)
):
    enrollment = db.query(models.Enrollment).filter(models.Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    if current_user.role == models.UserRole.teacher:
        course = db.query(models.Course).filter(models.Course.id == enrollment.course_id).first()
        if course.teacher_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")

    enrollment.status = models.EnrollmentStatus.rejected
    enrollment.reviewed_at = datetime.utcnow()
    db.commit()
    return {"message": "Enrollment rejected"}

@router.get("/students/my-courses")
def get_my_enrolled_courses(
    current_user: models.Student = Depends(require_role(models.UserRole.student)), 
    db: Session = Depends(get_db)
):
    enrollments = db.query(models.Enrollment).filter(
        models.Enrollment.student_id == current_user.id,
        models.Enrollment.status == models.EnrollmentStatus.approved
    ).all()
    
    courses = []
    for e in enrollments:
        c = db.query(models.Course).filter(models.Course.id == e.course_id).first()
        if c:
            c.lesson_count = db.query(models.Lesson).filter(models.Lesson.course_id == c.id).count()
            courses.append(c)
            
    return courses
