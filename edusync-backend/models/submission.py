import uuid
import enum
from sqlalchemy import Column, String, Text, Enum, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class SubmissionType(str, enum.Enum):
    text = "text"
    pdf = "pdf"
    image = "image"

class Submission(Base):
    __tablename__ = "submissions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    homework_id = Column(String, ForeignKey("homeworks.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content_type = Column(Enum(SubmissionType), nullable=False)
    content_text = Column(Text, nullable=True)
    content_url = Column(String, nullable=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    homework = relationship("Homework", back_populates="submissions")
    student = relationship("Student", back_populates="submissions")

    def get_content(self):
        if self.content_type == SubmissionType.text:
            return {"type": "text", "data": self.content_text}
        else:
            return {"type": self.content_type.value, "url": self.content_url}
