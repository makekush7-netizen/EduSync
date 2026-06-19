# EduSync — eLearning Management System
### Product Requirements Document (PRD) v1.0
**Institution:** Acropolis Institute of Technology & Research, Indore
**University:** RGPV Bhopal | **Branch:** B.Tech AIML — 4th Semester | **Subject:** Software Engineering (AL-403)

---

## AGENT INSTRUCTIONS

This PRD is the single source of truth for building EduSync. Build in two phases:

**Phase 1 — Frontend** (React + Vite)
- Read Sections 3, 7, 9, 10 carefully before writing any component
- Use `VITE_API_URL` env variable for all API calls
- Deploy to Vercel

**Phase 2 — Backend** (FastAPI + Python)
- Read Sections 4, 6, 7, 8 carefully before writing any code
- Follow the OOP class structure in Section 8 exactly — use inheritance, not flat functions
- Deploy to Render

**Environment variables needed:**
- Backend: `DATABASE_URL`, `CLOUDINARY_URL`, `GEMINI_API_KEY`, `SECRET_KEY`, `ALGORITHM=HS256`, `ACCESS_TOKEN_EXPIRE_MINUTES=1440`
- Frontend: `VITE_API_URL`

---

## 1. Project Overview

### 1.1 What is an eLMS?

An eLearning Management System (LMS) is a software platform that manages the complete lifecycle of digital education — user management, course content delivery, assessment collection, and communication — from a single web app.

EduSync is a lightweight institutional LMS for one school, multiple teachers, and multiple students.

### 1.2 Project Summary

EduSync provides role-based access for three user types — Admin, Teacher, Student — with structured content delivery, homework management, file-based submissions, and an AI-powered doubt-solving chatbot via Google Gemini.

### 1.3 Project Goals

- Admin sets up and manages the school digitally
- Teachers create courses, upload lessons, assign homework
- Students view enrolled courses, access lessons, submit homework
- Gemini-powered chatbot per course for student doubt solving
- Secure JWT role-based authentication
- Persistent file storage via Cloudinary (PDFs, images)
- OOP-first Python backend using SQLAlchemy + FastAPI

### 1.4 Scope

**In scope:** 3-role auth | School & course management | Lesson upload & view | Homework assign & submit | File upload via Cloudinary | Gemini chatbot | REST API | React frontend | Supabase PostgreSQL

**Out of scope:** Video streaming | Live classes | Grade analytics | Parent portal | Multi-school | Mobile app | Payments

---

## 2. Tech Stack

| Layer | Technology | Reason | Hosting |
|---|---|---|---|
| Frontend | React + Vite | Fast SPA, component-based | Vercel (Free) |
| Backend | FastAPI (Python) | Async, OOP-friendly, auto Swagger docs | Render (Free) |
| Database | Supabase (PostgreSQL) | Free, persistent, visual dashboard | Supabase Cloud |
| File Storage | Cloudinary | 25GB free, PDF + image, CDN | Cloudinary Cloud |
| Auth | JWT (OAuth2 Bearer) | Stateless, role-based | Within FastAPI |
| AI Chatbot | Google Gemini API (`gemini-1.5-flash`) | Free tier, easy Python SDK | Google Cloud |
| ORM | SQLAlchemy + Alembic | OOP class-to-table mapping + migrations | — |

> **Why Supabase over SQLite:** SQLite on Render resets on every deploy (ephemeral filesystem). Supabase is persistent hosted PostgreSQL with 500MB free.
>
> **Why Cloudinary over local storage:** Render's filesystem is also ephemeral. Cloudinary gives a permanent URL per file, CDN delivery, and a free Python SDK.

---

## 3. User Roles & Permissions

| Feature | Admin | Teacher | Student |
|---|---|---|---|
| Register / Login | ✅ | ✅ | ✅ |
| Create School | ✅ | ❌ | ❌ |
| Add Teachers to School | ✅ | ❌ | ❌ |
| Approve / Reject Enrollments | ✅ | ✅ | ❌ |
| Create Courses | ❌ | ✅ | ❌ |
| Upload Lessons | ✅ | ✅ | ❌ |
| View Lessons | ✅ | ✅ | ✅ (enrolled only) |
| Assign Homework | ✅ | ✅ | ❌ |
| View Homework Submissions | ✅ | ✅ (own course) | ❌ |
| Submit Homework (text/PDF/image) | ❌ | ❌ | ✅ |
| Request Enrollment in Course | ❌ | ❌ | ✅ |
| Access Gemini Chatbot | ❌ | ❌ | ✅ |
| Set Chatbot System Prompt | ❌ | ✅ | ❌ |
| View All Users | ✅ | ❌ | ❌ |

---

## 4. Functional Requirements

### 4.1 Authentication & Authorization

- All users register with: `full_name`, `email`, `password`, `role` (admin/teacher/student)
- Passwords hashed with **bcrypt** before storage — never store plaintext
- Login returns a **JWT token** with payload: `{ user_id, email, role, exp }`
- Every protected route validates `Authorization: Bearer <token>` header
- Role middleware blocks unauthorized actions (student cannot create course, etc.)
- Token expiry: **24 hours**. Re-login required after expiry.

### 4.2 School Management (Admin)

- Admin creates one School with: `name`, `description`, `logo_url` (optional)
- Admin invites Teachers by email — Teacher account gets linked to that School
- Admin can view all Students and all pending enrollment requests across the school

### 4.3 Course & Lesson Management (Teacher / Admin)

- Teacher creates Courses with: `title`, `description`, `subject_tag`, linked to their School
- Teacher uploads Lessons inside a Course — each lesson has: `title`, `description`, and content which is ONE of:
  - PDF file → uploaded to Cloudinary → stored as `content_url`
  - External video link → stored as `content_url`
  - Rich text → stored as `content_text`
- Teacher sets a **Gemini chatbot system prompt** per Course. If left blank, system auto-generates from course title + all lesson titles.
- Teacher one-click dashboard shows all their Courses with lesson counts in one view
- Admin can also upload Lessons and assign Homework to any Course in the school

### 4.4 Enrollment Flow (Student)

- Student browses all Courses available in their School
- Student sends an Enrollment Request for a Course → status: `pending`
- Teacher or Admin reviews and approves or rejects the request
- Approved Student gains access to all Lessons and the chatbot for that Course

### 4.5 Homework Management

- Teacher/Admin creates Homework for a Course with: `title`, `description`, `due_date`, `allowed_types` (array: `text`, `pdf`, `image`)
- Enrolled Students see Homework in their Course view
- Student submits ONE of: typed text, uploaded PDF (→ Cloudinary), uploaded image (→ Cloudinary)
- Teacher/Admin views all submissions for a Homework assignment
- One submission per student per homework (no re-submission)

### 4.6 Gemini Chatbot (Student)

- Each enrolled Course has a chatbot accessible to the Student
- Uses Gemini API (`gemini-1.5-flash`) with the Course's `chatbot_system_prompt`
- Conversation history passed with every request for context
- Chatbot does NOT have access to homework answers or submission data
- System auto-prompt template (when teacher skips): `"You are a helpful educational assistant for the course '{course_title}'. Topics covered: {lesson_titles_comma_separated}. Help students understand concepts but do not give direct homework answers."`

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Security | bcrypt password hashing | JWT 24h expiry | Role check on every protected route |
| Performance | API response < 500ms for DB queries | Cloudinary CDN for file delivery |
| Scalability | Designed for 1 school, ~10 teachers, ~200 students |
| Availability | Render free tier — cold start ~30s after idle (warn user on frontend) |
| Data Integrity | PostgreSQL FK constraints | Cascade deletes where School owns Courses |
| Error Handling | All errors return `{ "detail": "...", "status_code": N }` |
| API Docs | FastAPI Swagger UI auto-available at `/docs` |
| CORS | Allow frontend origin in FastAPI CORS middleware |

---

## 6. Database Schema (PostgreSQL / Supabase)

### 6.1 Entity Relationships

```
schools          ──< courses        ──< lessons
    |                   |
    |                   ├──< homeworks    ──< submissions
    |                   └──< enrollments
    |                   └──< chat_sessions
users (role=admin)   ──1 schools
users (role=teacher) ──< courses
users (role=student) ──< enrollments, submissions, chat_sessions
```

### 6.2 Table Definitions

```sql
-- ENUM TYPES
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');
CREATE TYPE content_type AS ENUM ('pdf', 'video_link', 'text');
CREATE TYPE submission_type AS ENUM ('text', 'pdf', 'image');
CREATE TYPE enrollment_status AS ENUM ('pending', 'approved', 'rejected');

-- USERS
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    role            user_role NOT NULL,
    school_id       UUID REFERENCES schools(id) ON DELETE SET NULL,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- SCHOOLS
CREATE TABLE schools (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    logo_url        VARCHAR(500),
    admin_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- COURSES
CREATE TABLE courses (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title                   VARCHAR(255) NOT NULL,
    description             TEXT,
    subject_tag             VARCHAR(100),
    school_id               UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id              UUID NOT NULL REFERENCES users(id),
    chatbot_system_prompt   TEXT,
    created_at              TIMESTAMP DEFAULT NOW()
);

-- LESSONS
CREATE TABLE lessons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    content_type    content_type NOT NULL,
    content_url     VARCHAR(500),
    content_text    TEXT,
    order_index     INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ENROLLMENTS
CREATE TABLE enrollments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status          enrollment_status DEFAULT 'pending',
    requested_at    TIMESTAMP DEFAULT NOW(),
    reviewed_at     TIMESTAMP,
    UNIQUE(student_id, course_id)
);

-- HOMEWORKS
CREATE TABLE homeworks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    assigned_by     UUID NOT NULL REFERENCES users(id),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    due_date        DATE,
    allowed_types   TEXT[] DEFAULT ARRAY['text','pdf','image'],
    created_at      TIMESTAMP DEFAULT NOW()
);

-- SUBMISSIONS
CREATE TABLE submissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    homework_id     UUID NOT NULL REFERENCES homeworks(id) ON DELETE CASCADE,
    student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_type    submission_type NOT NULL,
    content_text    TEXT,
    content_url     VARCHAR(500),
    submitted_at    TIMESTAMP DEFAULT NOW(),
    UNIQUE(homework_id, student_id)
);

-- CHAT SESSIONS
CREATE TABLE chat_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    messages        JSONB DEFAULT '[]'::jsonb,
    updated_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);
```

> **Note for agent:** Use SQLAlchemy ORM models — do NOT write raw SQL. The schema above is for reference and for Supabase setup. Alembic will generate the actual tables from your Python models.

---

## 7. API Endpoint Reference

**Base URL:** `https://edusync-api.onrender.com/api/v1`
**Auth header:** `Authorization: Bearer <token>` on all protected routes
**Content-Type:** `application/json` unless uploading files (then `multipart/form-data`)

### 7.1 Auth

| Method | Endpoint | Access | Body / Response |
|---|---|---|---|
| POST | `/auth/register` | Public | `{full_name, email, password, role}` → `{access_token, token_type}` |
| POST | `/auth/login` | Public | `{email, password}` → `{access_token, token_type}` |
| GET | `/auth/me` | All roles | → current user object |

### 7.2 School

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/schools` | Admin | Create school `{name, description, logo_url?}` |
| GET | `/schools/me` | Admin | Get admin's school |
| POST | `/schools/teachers/invite` | Admin | `{email}` → link teacher to school |
| GET | `/schools/students` | Admin | List all students in school |

### 7.3 Courses

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/courses` | Teacher | `{title, description, subject_tag}` |
| GET | `/courses` | Admin/Teacher | All courses in school |
| GET | `/courses/my` | Teacher | Courses created by this teacher |
| GET | `/courses/{id}` | All | Single course detail |
| PATCH | `/courses/{id}/prompt` | Teacher | `{chatbot_system_prompt}` |

### 7.4 Lessons

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/courses/{id}/lessons` | Teacher/Admin | `multipart/form-data`: `{title, description, content_type, file? OR content_url? OR content_text?}` |
| GET | `/courses/{id}/lessons` | Teacher/Admin/Enrolled Student | List lessons in course |
| GET | `/lessons/{id}` | Teacher/Admin/Enrolled Student | Single lesson |

### 7.5 Enrollments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/courses/{id}/enroll` | Student | Request enrollment |
| GET | `/courses/{id}/enrollments` | Teacher/Admin | View all requests |
| PATCH | `/enrollments/{id}/approve` | Teacher/Admin | Approve request |
| PATCH | `/enrollments/{id}/reject` | Teacher/Admin | Reject request |
| GET | `/students/my-courses` | Student | List approved enrolled courses |

### 7.6 Homework

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/courses/{id}/homework` | Teacher/Admin | `{title, description, due_date, allowed_types[]}` |
| GET | `/courses/{id}/homework` | All (filtered by role) | List homework |
| POST | `/homework/{id}/submit` | Student | `multipart/form-data`: `{content_type, content_text? OR file?}` |
| GET | `/homework/{id}/submissions` | Teacher/Admin | All submissions |

### 7.7 Chatbot

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/courses/{id}/chat` | Enrolled Student | `{message: string, history: [{role, content}]}` → `{reply: string}` |

---

## 8. OOP Backend Design (Python / FastAPI)

> **Agent instruction:** Structure the entire backend using OOP. Every database table maps to a Python class. Use SQLAlchemy declarative base. Use inheritance for User roles. Do NOT write flat procedural route functions that do everything — delegate logic to class methods.

### 8.1 OOP Concepts Used

| Concept | Implementation |
|---|---|
| **Class & Object** | `User`, `Course`, `Lesson`, `Homework`, `Submission` etc. are Python classes. Each DB row is an instance. |
| **Inheritance** | `Student`, `Teacher`, `Admin` extend base `User` class — shared auth logic, role-specific methods |
| **Encapsulation** | Password hashing encapsulated in `User.set_password()` — raw password never exposed |
| **Polymorphism** | `Submission.get_content()` returns text or URL depending on `content_type` — same method, different behavior |
| **Association** | `Course` has list of `Lesson` objects. `Teacher` has list of `Course` objects. |
| **Composition** | `School` owns `Course` objects — cascade delete. `Course` owns `Lesson` objects. |

### 8.2 Project File Structure

```
edusync-backend/
├── main.py                  # FastAPI app entry, CORS, router registration
├── database.py              # SQLAlchemy engine + session + Base
├── config.py                # Settings from env vars (pydantic BaseSettings)
├── requirements.txt
├── alembic/                 # Migration files
│   └── versions/
├── models/                  # SQLAlchemy ORM classes (the OOP heart)
│   ├── __init__.py
│   ├── user.py              # User base class + Admin/Teacher/Student
│   ├── school.py
│   ├── course.py
│   ├── lesson.py
│   ├── enrollment.py
│   ├── homework.py
│   ├── submission.py
│   └── chat_session.py
├── schemas/                 # Pydantic request/response models
│   ├── auth.py
│   ├── course.py
│   └── ...
├── routers/                 # FastAPI route handlers
│   ├── auth.py
│   ├── schools.py
│   ├── courses.py
│   ├── lessons.py
│   ├── enrollments.py
│   ├── homework.py
│   └── chat.py
├── services/                # Business logic layer
│   ├── auth_service.py      # JWT creation/verification
│   ├── cloudinary_service.py
│   └── gemini_service.py
└── middleware/
    └── role_guard.py        # Role-based access decorator
```

### 8.3 Class Pseudocode

```python
# models/user.py
class User(Base):
    __tablename__ = "users"
    id = Column(UUID, primary_key=True, default=uuid4)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    school_id = Column(UUID, ForeignKey("schools.id"), nullable=True)

    def set_password(self, raw: str):
        self.password_hash = bcrypt.hash(raw)

    def verify_password(self, raw: str) -> bool:
        return bcrypt.verify(raw, self.password_hash)

    def to_dict(self) -> dict:
        return {"id": str(self.id), "email": self.email, "role": self.role}


# Admin, Teacher, Student are handled via role field + polymorphic identity
# Use single-table inheritance in SQLAlchemy:

class Teacher(User):
    __mapper_args__ = {"polymorphic_identity": "teacher"}
    courses = relationship("Course", back_populates="teacher")

    def create_course(self, db, title, description, subject_tag) -> "Course":
        course = Course(title=title, description=description,
                        subject_tag=subject_tag, teacher_id=self.id,
                        school_id=self.school_id)
        db.add(course); db.commit()
        return course

    def assign_homework(self, db, course_id, title, description, due_date, allowed_types):
        hw = Homework(course_id=course_id, assigned_by=self.id,
                      title=title, description=description,
                      due_date=due_date, allowed_types=allowed_types)
        db.add(hw); db.commit()
        return hw


class Student(User):
    __mapper_args__ = {"polymorphic_identity": "student"}
    enrollments = relationship("Enrollment", back_populates="student")
    submissions = relationship("Submission", back_populates="student")

    def request_enrollment(self, db, course_id):
        enrollment = Enrollment(student_id=self.id, course_id=course_id, status="pending")
        db.add(enrollment); db.commit()
        return enrollment

    def submit_homework(self, db, homework_id, content_type, content_text=None, content_url=None):
        sub = Submission(homework_id=homework_id, student_id=self.id,
                         content_type=content_type, content_text=content_text,
                         content_url=content_url)
        db.add(sub); db.commit()
        return sub


class Admin(User):
    __mapper_args__ = {"polymorphic_identity": "admin"}
    school = relationship("School", back_populates="admin", uselist=False)

    def create_school(self, db, name, description, logo_url=None):
        school = School(name=name, description=description,
                        logo_url=logo_url, admin_id=self.id)
        db.add(school); db.commit()
        self.school_id = school.id; db.commit()
        return school


# models/course.py
class Course(Base):
    __tablename__ = "courses"
    id = Column(UUID, primary_key=True, default=uuid4)
    title = Column(String, nullable=False)
    description = Column(Text)
    subject_tag = Column(String)
    school_id = Column(UUID, ForeignKey("schools.id"), nullable=False)
    teacher_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    chatbot_system_prompt = Column(Text, nullable=True)

    lessons = relationship("Lesson", back_populates="course", order_by="Lesson.order_index")
    homeworks = relationship("Homework", back_populates="course")
    enrollments = relationship("Enrollment", back_populates="course")

    def add_lesson(self, db, title, description, content_type, content_url=None, content_text=None):
        order = len(self.lessons)
        lesson = Lesson(course_id=self.id, title=title, description=description,
                        content_type=content_type, content_url=content_url,
                        content_text=content_text, order_index=order)
        db.add(lesson); db.commit()
        return lesson

    def generate_system_prompt(self) -> str:
        lesson_titles = ", ".join([l.title for l in self.lessons])
        return (f"You are a helpful educational assistant for the course '{self.title}'. "
                f"Topics covered: {lesson_titles}. "
                f"Help students understand concepts but do not give direct homework answers.")


# models/submission.py
class Submission(Base):
    __tablename__ = "submissions"
    id = Column(UUID, primary_key=True, default=uuid4)
    homework_id = Column(UUID, ForeignKey("homeworks.id"), nullable=False)
    student_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    content_type = Column(Enum(SubmissionType), nullable=False)
    content_text = Column(Text, nullable=True)
    content_url = Column(String, nullable=True)

    def get_content(self):
        # Polymorphism: same method, different return based on type
        if self.content_type == "text":
            return {"type": "text", "data": self.content_text}
        else:
            return {"type": self.content_type, "url": self.content_url}
```

### 8.4 JWT Auth Service

```python
# services/auth_service.py
class AuthService:
    SECRET_KEY = settings.SECRET_KEY
    ALGORITHM = "HS256"

    @staticmethod
    def create_token(user: User) -> str:
        payload = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
            "exp": datetime.utcnow() + timedelta(hours=24)
        }
        return jwt.encode(payload, AuthService.SECRET_KEY, algorithm=AuthService.ALGORITHM)

    @staticmethod
    def decode_token(token: str) -> dict:
        return jwt.decode(token, AuthService.SECRET_KEY, algorithms=[AuthService.ALGORITHM])
```

### 8.5 Role Guard Middleware

```python
# middleware/role_guard.py
from functools import wraps
from fastapi import HTTPException, Depends

def require_role(*roles):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user=Depends(get_current_user), **kwargs):
            if current_user.role not in roles:
                raise HTTPException(status_code=403, detail="Insufficient permissions")
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator

# Usage in routers:
@router.post("/courses")
@require_role("teacher")
async def create_course(data: CourseCreate, current_user=Depends(get_current_user), db=Depends(get_db)):
    teacher = db.query(Teacher).filter(Teacher.id == current_user.id).first()
    return teacher.create_course(db, data.title, data.description, data.subject_tag)
```

### 8.6 Cloudinary Service

```python
# services/cloudinary_service.py
import cloudinary, cloudinary.uploader

class CloudinaryService:
    @staticmethod
    def upload_file(file_bytes: bytes, filename: str, folder: str = "edusync") -> str:
        result = cloudinary.uploader.upload(
            file_bytes,
            folder=folder,
            resource_type="auto",  # handles both images and PDFs
            public_id=filename
        )
        return result["secure_url"]  # permanent HTTPS URL
```

### 8.7 Gemini Chatbot Service

```python
# services/gemini_service.py
import google.generativeai as genai

class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel("gemini-1.5-flash")

    def chat(self, system_prompt: str, history: list, user_message: str) -> str:
        chat = self.model.start_chat(history=[
            {"role": "user", "parts": [system_prompt]},
            {"role": "model", "parts": ["Understood. I am ready to help students."]},
            *[{"role": h["role"], "parts": [h["content"]]} for h in history]
        ])
        response = chat.send_message(user_message)
        return response.text
```

---

## 9. Data Flow Diagrams

### 9.1 Authentication Flow
```
User → POST /auth/login {email, password}
     → FastAPI validates email exists in DB
     → bcrypt.verify(password, stored_hash)
     → JWT created: {user_id, role, exp=+24h}
     → Token returned to client
     → Client stores in localStorage
     → All subsequent requests: Authorization: Bearer <token>
     → FastAPI middleware decodes token → injects current_user into route
```

### 9.2 Homework Submission Flow
```
Student selects file/text → POST /homework/{id}/submit (multipart/form-data)
     → FastAPI receives file bytes
     → CloudinaryService.upload_file(bytes, filename)
     → Cloudinary returns secure_url
     → Submission created in DB with content_url = secure_url
     → 201 response
     → Teacher: GET /homework/{id}/submissions → list with download links
```

### 9.3 Gemini Chatbot Flow
```
Student types question → POST /courses/{id}/chat {message, history[]}
     → FastAPI fetches course.chatbot_system_prompt from DB
     → If null: course.generate_system_prompt()
     → GeminiService.chat(system_prompt, history, message)
     → Gemini API returns response text
     → Response saved to chat_sessions.messages (JSONB append)
     → {reply: "..."} returned to frontend
     → Frontend appends to chat UI
```

### 9.4 Enrollment Approval Flow
```
Student → POST /courses/{id}/enroll
     → Enrollment row created (status=pending)
     → Teacher dashboard shows badge with pending count
     → Teacher → PATCH /enrollments/{id}/approve
     → Enrollment.status = 'approved', reviewed_at = NOW()
     → Student gains access to lessons + chatbot
     → Appears in student's GET /students/my-courses
```

---

## 10. App Flow (Screen by Screen)

### 10.1 Admin Flow
1. Register as Admin (`role=admin`)
2. Dashboard → Create School (name, description, logo URL)
3. School Dashboard → Invite Teachers by email
4. Students tab → View and approve/reject enrollment requests
5. Courses tab → Browse all courses, view lessons, assign homework

### 10.2 Teacher Flow
1. Login → Teacher Dashboard (all courses + lesson count per course)
2. Create Course → fill title, description, subject tag
3. Open Course → Upload Lessons (choose: PDF upload / video link / text editor)
4. Set Chatbot Prompt (or leave blank for auto-generate)
5. Assign Homework → title, description, due date, allowed submission types
6. View Homework → click to see all student submissions with download links
7. Enrollment tab → Approve or Reject pending student requests

### 10.3 Student Flow
1. Register as Student (`role=student`)
2. Browse Courses available in the school
3. Click Enroll → wait for approval notification
4. My Courses → see all approved courses
5. Open Course → scroll through Lessons → click to read/download
6. Homework tab → click Submit → type text OR upload PDF/image
7. Chatbot icon → type doubt → get Gemini AI response

---

## 11. UML Diagrams — Guide for Teammates

> **Download StarUML free:** https://staruml.io

---

### 11.1 Use Case Diagram — Step by Step

**What it is:** Shows WHO uses the system (actors) and WHAT they can do (use cases). Not HOW.

**Step 1 — Create diagram**
- File → New → Blank Project
- Left panel (Model Explorer): right-click project → Add Diagram → Use Case Diagram
- Name: `EduSync Use Case Diagram`

**Step 2 — Draw System Boundary**
- Toolbox → drag `System` rectangle onto canvas
- Label: `EduSync eLMS`
- Make it large (fill most of the canvas)

**Step 3 — Add Actors (OUTSIDE the system box)**
- Toolbox → drag 4 `Actor` shapes, place them outside left/right edges
- Label them: `Admin`, `Teacher`, `Student`, `Gemini AI`

**Step 4 — Add Use Cases (INSIDE the system box)**
- Toolbox → drag `Use Case` ovals inside the system rectangle
- Add all of these:

| Use Case | Connected Actor(s) |
|---|---|
| Register / Login | Admin, Teacher, Student |
| Create School | Admin |
| Invite Teacher | Admin |
| Approve / Reject Enrollment | Admin, Teacher |
| Create Course | Teacher |
| Upload Lesson | Teacher, Admin |
| View Lessons | Teacher, Admin, Student |
| Assign Homework | Teacher, Admin |
| View Submissions | Teacher, Admin |
| Request Enrollment | Student |
| Submit Homework | Student |
| Use Chatbot | Student |
| Set Chatbot Prompt | Teacher |
| Generate AI Response | Gemini AI |

**Step 5 — Draw Lines**
- `Association` (solid line): connect each Actor to every Use Case they participate in
- `Include` (dashed arrow, label `<<include>>`): draw from `Use Chatbot` → `Generate AI Response`

**Step 6 — Export**
- File → Export Diagram as Image → PNG → save as `usecase_diagram.png`

---

### 11.2 Class Diagram — Step by Step

**What it is:** Blueprint of the code — all classes, attributes, methods, and relationships.

**Step 1 — Create diagram**
- Right-click same project → Add Diagram → Class Diagram
- Name: `EduSync Class Diagram`

**Step 2 — Add Class boxes**
- Toolbox → drag `Class` shapes. Each box has 3 sections: Name | Attributes | Methods

| Class | Attributes | Methods |
|---|---|---|
| `User` | - id: UUID<br>- email: String<br>- password_hash: String<br>- full_name: String<br>- role: Enum<br>- school_id: UUID | + set_password(raw: String)<br>+ verify_password(raw): bool<br>+ to_dict(): dict |
| `Admin` *(extends User)* | - school: School | + create_school(name): School<br>+ invite_teacher(email)<br>+ approve_student(enrollment_id) |
| `Teacher` *(extends User)* | - courses: List[Course] | + create_course(title): Course<br>+ assign_homework(course, title)<br>+ get_all_courses(): List |
| `Student` *(extends User)* | - enrollments: List<br>- submissions: List | + request_enrollment(course_id)<br>+ submit_homework(hw_id, content)<br>+ get_enrolled_courses(): List |
| `School` | - id: UUID<br>- name: String<br>- description: String<br>- logo_url: String<br>- admin_id: UUID | + get_teachers(): List<br>+ get_students(): List<br>+ get_courses(): List |
| `Course` | - id: UUID<br>- title: String<br>- teacher_id: UUID<br>- school_id: UUID<br>- chatbot_prompt: String | + add_lesson(lesson)<br>+ get_lessons(): List<br>+ generate_prompt(): String<br>+ get_enrolled_students(): List |
| `Lesson` | - id: UUID<br>- course_id: UUID<br>- title: String<br>- content_type: Enum<br>- content_url: String<br>- order_index: int | + get_content(): String |
| `Homework` | - id: UUID<br>- course_id: UUID<br>- assigned_by: UUID<br>- title: String<br>- due_date: Date<br>- allowed_types: List | + get_submissions(): List |
| `Submission` | - id: UUID<br>- homework_id: UUID<br>- student_id: UUID<br>- content_type: Enum<br>- content_text: String<br>- content_url: String | + get_content(): String<br>+ upload_file(file): String |
| `ChatSession` | - id: UUID<br>- student_id: UUID<br>- course_id: UUID<br>- messages: JSON | + add_message(role, text)<br>+ get_history(): List |

**Step 3 — Draw Relationships**

| Relationship | From | To | Arrow in StarUML | Multiplicity |
|---|---|---|---|---|
| Inheritance | Admin | User | Generalization (hollow triangle) | — |
| Inheritance | Teacher | User | Generalization (hollow triangle) | — |
| Inheritance | Student | User | Generalization (hollow triangle) | — |
| Association | Admin | School | Association (solid line) | 1 → 1 |
| Association | Teacher | Course | Association (solid line) | 1 → * |
| Composition | School | Course | Composition (filled diamond on School) | 1 → * |
| Composition | Course | Lesson | Composition (filled diamond on Course) | 1 → * |
| Association | Course | Homework | Association (solid line) | 1 → * |
| Association | Student | Enrollment | Association (solid line) | 1 → * |
| Association | Student | Submission | Association (solid line) | 1 → * |
| Association | Student | ChatSession | Association (solid line) | 1 → * |
| Association | Course | ChatSession | Association (solid line) | 1 → * |

**Step 4 — Add Multiplicity**
- Click each line → Properties panel → set `End1 Multiplicity` and `End2 Multiplicity`
- Example: School→Course line: School side = `1`, Course side = `*`

**Step 5 — Export**
- File → Export Diagram as Image → PNG → save as `class_diagram.png`

---

## 12. Deployment Guide

### 12.1 Backend → Render
1. Push FastAPI project to GitHub
2. Render.com → New Web Service → Connect repo
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add env vars: `DATABASE_URL`, `CLOUDINARY_URL`, `GEMINI_API_KEY`, `SECRET_KEY`
6. After first deploy, run: `alembic upgrade head` via Render Shell

### 12.2 Frontend → Vercel
1. Push React Vite project to GitHub
2. Vercel.com → New Project → Import repo
3. Vercel auto-detects Vite
4. Add env var: `VITE_API_URL = https://your-app.onrender.com/api/v1`
5. Deploy → live in ~60 seconds

### 12.3 Database → Supabase
1. supabase.com → New Project
2. Settings → Database → copy Connection String (URI mode)
3. Paste as `DATABASE_URL` in Render env vars
4. Use Supabase Table Editor to visually verify tables after Alembic migration

### 12.4 File Storage → Cloudinary
1. cloudinary.com → Sign up free
2. Dashboard → copy `CLOUDINARY_URL` (includes key + secret)
3. Paste in Render env vars
4. All uploaded files appear in Cloudinary Media Library with permanent URLs

---

## 13. Dependencies

### Backend (`requirements.txt`)
```
fastapi
uvicorn[standard]
sqlalchemy
alembic
psycopg2-binary
pydantic-settings
python-jose[cryptography]
passlib[bcrypt]
python-multipart
cloudinary
google-generativeai
python-dotenv
```

### Frontend (`package.json` deps)
```
react, react-dom, react-router-dom
@tanstack/react-query
axios
react-hook-form
tailwindcss
lucide-react
```

---

## 14. Glossary

| Term | Definition |
|---|---|
| LMS | Learning Management System — software for delivering and managing educational content |
| JWT | JSON Web Token — signed token carrying user ID and role for stateless auth |
| OOP | Object-Oriented Programming — code organized around objects (class instances) |
| ORM | Object Relational Mapper — maps Python classes to DB tables (SQLAlchemy) |
| FastAPI | Modern Python framework for REST APIs with auto Swagger docs |
| Supabase | Open-source Firebase alternative — hosted PostgreSQL with dashboard |
| Cloudinary | Cloud media platform — stores images/PDFs and serves via CDN |
| Alembic | Database migration tool for SQLAlchemy — version-controlled schema changes |
| StarUML | UML modeling tool for class and use case diagrams |
| Use Case Diagram | UML diagram showing actors and what they do (who → what, not how) |
| Class Diagram | UML diagram showing classes, attributes, methods, and relationships |
| Gemini | Google's LLM API used for the in-course doubt-solving chatbot |
| bcrypt | Password hashing algorithm — one-way, salted, brute-force resistant |
| Vercel | Frontend hosting platform — free tier, instant React/Vite deploys |
| Render | Cloud hosting for APIs — free tier with cold start after idle |
| Cascade Delete | When parent is deleted, children auto-delete (e.g., School deleted → Courses deleted) |
| Polymorphic Identity | SQLAlchemy pattern for single-table inheritance (Admin/Teacher/Student all in `users` table) |
