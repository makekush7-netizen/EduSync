import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Landing
import Landing from './pages/Landing';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import SchoolSetup from './pages/admin/SchoolSetup';
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageStudents from './pages/admin/ManageStudents';
import AdminCourses from './pages/admin/Courses';

// Teacher
import TeacherDashboard from './pages/teacher/Dashboard';
import CreateCourse from './pages/teacher/CreateCourse';
import CourseDetail from './pages/teacher/CourseDetail';
import ViewSubmissions from './pages/teacher/ViewSubmissions';
import TeacherEnrollments from './pages/teacher/Enrollments';

// Student
import StudentDashboard from './pages/student/Dashboard';
import BrowseCourses from './pages/student/BrowseCourses';
import CourseView from './pages/student/CourseView';
import Chatbot from './pages/student/Chatbot';

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/school" element={<SchoolSetup />} />
        <Route path="/admin/teachers" element={<ManageTeachers />} />
        <Route path="/admin/students" element={<ManageStudents />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
      </Route>

      {/* Teacher Routes */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/courses/create" element={<CreateCourse />} />
        <Route path="/teacher/courses/:id" element={<CourseDetail />} />
        <Route path="/teacher/homework/:id/submissions" element={<ViewSubmissions />} />
        <Route path="/teacher/enrollments" element={<TeacherEnrollments />} />
      </Route>

      {/* Student Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/browse" element={<BrowseCourses />} />
        <Route path="/student/courses/:id" element={<CourseView />} />
        <Route path="/student/courses/:id/chat" element={<Chatbot />} />
      </Route>

      {/* Shared Admin/Teacher Course Detail View (Admin can view all courses) */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'teacher']} />}>
        <Route path="/admin/courses/:id" element={<CourseDetail />} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
