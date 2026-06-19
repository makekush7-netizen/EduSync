import uuid
import random
import string
from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base

def generate_invite_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    subject_tag = Column(String, nullable=True)
    invite_code = Column(String, unique=True, index=True, default=generate_invite_code)
    school_id = Column(String, ForeignKey("schools.id", ondelete="CASCADE"), nullable=False)
    teacher_id = Column(String, ForeignKey("users.id"), nullable=False)
    chatbot_system_prompt = Column(Text, nullable=True)

    school = relationship("School", back_populates="courses")
    teacher = relationship("Teacher", back_populates="courses")
    lessons = relationship("Lesson", back_populates="course", order_by="Lesson.order_index", cascade="all, delete-orphan")
    homeworks = relationship("Homework", back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="course", cascade="all, delete-orphan")

    def generate_system_prompt(self):
        if self.chatbot_system_prompt:
            return self.chatbot_system_prompt
            
        lesson_titles = ", ".join([l.title for l in self.lessons]) if self.lessons else "No topics yet"
        return (f"You are a helpful educational assistant for the course '{self.title}'. "
                f"Topics covered: {lesson_titles}. "
                f"Help students understand concepts but do not give direct homework answers.")
