from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from middleware.role_guard import require_role
from services.gemini_service import GeminiService

router = APIRouter(prefix="/courses", tags=["Chat"])
gemini = GeminiService()

@router.post("/{course_id}/chat", response_model=schemas.ChatResponse)
def chat_with_bot(
    course_id: str,
    chat_data: schemas.ChatRequest,
    current_user: models.Student = Depends(require_role(models.UserRole.student)), 
    db: Session = Depends(get_db)
):
    # Check enrollment
    enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.student_id == current_user.id,
        models.Enrollment.course_id == course_id,
        models.Enrollment.status == models.EnrollmentStatus.approved
    ).first()
    if not enrollment:
        raise HTTPException(status_code=403, detail="Not enrolled in this course")

    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    system_prompt = course.generate_system_prompt()

    # Get history and message
    history = [h.dict() for h in chat_data.history]
    
    # Process chat via Gemini
    reply = gemini.chat(system_prompt, history, chat_data.message)

    # Save session
    session = db.query(models.ChatSession).filter(
        models.ChatSession.student_id == current_user.id,
        models.ChatSession.course_id == course_id
    ).first()

    if not session:
        session = models.ChatSession(student_id=current_user.id, course_id=course_id, messages=[])
        db.add(session)
        db.commit()
        db.refresh(session)

    # Update messages
    messages = session.messages.copy()
    messages.append({"role": "user", "content": chat_data.message})
    messages.append({"role": "model", "content": reply})
    session.messages = messages
    db.commit()

    return {"reply": reply}
