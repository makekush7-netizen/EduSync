from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.lesson import ContentType

class LessonResponse(BaseModel):
    id: str
    course_id: str
    title: str
    description: Optional[str] = None
    content_type: ContentType
    content_url: Optional[str] = None
    content_text: Optional[str] = None
    order_index: int

    class Config:
        from_attributes = True
