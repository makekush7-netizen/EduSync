from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from middleware.role_guard import require_role, get_current_user

router = APIRouter(prefix="/schools", tags=["Schools"])

@router.post("", response_model=schemas.SchoolResponse)
def create_school(
    school_data: schemas.SchoolCreate, 
    current_user: models.Admin = Depends(require_role(models.UserRole.admin)), 
    db: Session = Depends(get_db)
):
    if current_user.school_id:
        raise HTTPException(status_code=400, detail="Admin already has a school")
        
    school = models.School(
        name=school_data.name, 
        description=school_data.description, 
        logo_url=school_data.logo_url,
        admin_id=current_user.id
    )
    db.add(school)
    db.commit()
    db.refresh(school)
    
    current_user.school_id = school.id
    db.commit()
    
    return school

@router.get("/me", response_model=schemas.SchoolResponse)
def get_my_school(
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if not current_user.school_id:
        return None
        
    school = db.query(models.School).filter(models.School.id == current_user.school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
        
    teachers = db.query(models.Teacher).filter(models.Teacher.school_id == school.id).all()

    # Return plain JSON-safe data so response serialization does not depend on ORM objects.
    return {
        "id": school.id,
        "name": school.name,
        "description": school.description,
        "logo_url": school.logo_url,
        "invite_code": school.invite_code,
        "admin_id": school.admin_id,
        "teacher_count": len(teachers),
        "teachers": [
            {
                "id": teacher.id,
                "email": teacher.email,
                "full_name": teacher.full_name,
                "role": teacher.role.value if hasattr(teacher.role, "value") else teacher.role,
                "school_id": teacher.school_id,
            }
            for teacher in teachers
        ],
    }

@router.post("/teachers/invite")
def invite_teacher(
    invite_data: schemas.TeacherInvite, 
    current_user: models.Admin = Depends(require_role(models.UserRole.admin)), 
    db: Session = Depends(get_db)
):
    if not current_user.school_id:
        raise HTTPException(status_code=400, detail="You need to create a school first")
        
    teacher = db.query(models.Teacher).filter(models.Teacher.email == invite_data.email).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher with this email not found. They must register first.")
        
    if teacher.school_id:
        raise HTTPException(status_code=400, detail="Teacher already belongs to a school")
        
    teacher.school_id = current_user.school_id
    db.commit()
    return {"message": "Teacher successfully added to school"}

@router.post("/join")
def join_school(
    join_data: schemas.SchoolJoin, 
    current_user: models.Teacher = Depends(require_role(models.UserRole.teacher)), 
    db: Session = Depends(get_db)
):
    if current_user.school_id:
        raise HTTPException(status_code=400, detail="You are already in a school")

    school = db.query(models.School).filter(models.School.invite_code == join_data.invite_code).first()
    if not school:
        raise HTTPException(status_code=404, detail="Invalid school invite code")

    current_user.school_id = school.id
    db.commit()
    return {"message": "Successfully joined the school"}

@router.get("/students")
def get_students(
    current_user: models.Admin = Depends(require_role(models.UserRole.admin)), 
    db: Session = Depends(get_db)
):
    if not current_user.school_id:
        return {"students": [], "pending_enrollments": []}
        
    # Get all students in the school
    students = db.query(models.Student).filter(models.Student.school_id == current_user.school_id).all()
    
    # Get all pending enrollments for courses in this school
    pending = db.query(models.Enrollment).join(models.Course).filter(
        models.Course.school_id == current_user.school_id,
        models.Enrollment.status == models.EnrollmentStatus.pending
    ).all()
    
    # Format pending enrollments
    pending_list = []
    for p in pending:
        student = db.query(models.Student).filter(models.Student.id == p.student_id).first()
        course = db.query(models.Course).filter(models.Course.id == p.course_id).first()
        pending_list.append({
            "id": p.id,
            "student_id": student.id,
            "student_name": student.full_name,
            "student_email": student.email,
            "course_id": course.id,
            "course_title": course.title,
            "status": p.status
        })
        
    return {
        "students": [{"id": s.id, "full_name": s.full_name, "email": s.email} for s in students],
        "pending_enrollments": pending_list
    }
