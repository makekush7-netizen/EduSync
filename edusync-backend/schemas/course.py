from pydantic import BaseModel
from typing import Optional, List

class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    subject_tag: Optional[str] = None

class CoursePromptUpdate(BaseModel):
    chatbot_system_prompt: str

class CourseJoin(BaseModel):
    invite_code: str

class CourseResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    subject_tag: Optional[str] = None
    invite_code: Optional[str] = None
    teacher_id: str
    teacher_name: Optional[str] = None
    school_id: str
    chatbot_system_prompt: Optional[str] = None
    lesson_count: Optional[int] = 0
    enrollment_count: Optional[int] = 0
    homework_count: Optional[int] = 0
    enrollment_status: Optional[str] = None

    class Config:
        from_attributes = True
