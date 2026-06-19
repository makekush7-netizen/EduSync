import uuid
import enum
from sqlalchemy import Column, String, Text, Integer, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base

class ContentType(str, enum.Enum):
    pdf = "pdf"
    video_link = "video_link"
    text = "text"

class Lesson(Base):
    __tablename__ = "lessons"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    content_type = Column(Enum(ContentType), nullable=False)
    content_url = Column(String, nullable=True)
    content_text = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)

    course = relationship("Course", back_populates="lessons")
