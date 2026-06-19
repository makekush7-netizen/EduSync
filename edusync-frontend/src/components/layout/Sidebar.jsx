import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  PlusCircle,
  ClipboardList,
  UserCheck,
  Compass,
  MessageSquare,
  School,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { useState } from 'react';

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/school', icon: School, label: 'School Setup' },
  { to: '/admin/teachers', icon: Users, label: 'Teachers' },
  { to: '/admin/students', icon: GraduationCap, label: 'Students' },
  { to: '/admin/courses', icon: BookOpen, label: 'All Courses' },
];

const teacherLinks = [
  { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/teacher/courses/create', icon: PlusCircle, label: 'Create Course' },
  { to: '/teacher/enrollments', icon: UserCheck, label: 'Enrollments' },
];

const studentLinks = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'My Courses' },
  { to: '/student/browse', icon: Compass, label: 'Browse Courses' },
];

export default function Sidebar() {
  const { user, logout, isAdmin, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const links = isAdmin ? adminLinks : isTeacher ? teacherLinks : studentLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = isAdmin ? 'Administrator' : isTeacher ? 'Teacher' : 'Student';
  const roleColor = isAdmin ? 'bg-amber-100 text-amber-700' : isTeacher ? 'bg-brand-100 text-brand-700' : 'bg-blue-100 text-blue-700';

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-card border border-gray-100"
      >
        <Menu size={20} />
      </button>

      {/* Overlay for mobile */}
      {!collapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-100 z-40 flex flex-col transition-all duration-300 ${
          collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-72'
        }`}
      >
        {/* Brand */}
        <div className={`p-6 border-b border-gray-100 ${collapsed ? 'lg:px-4 lg:py-6' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center flex-shrink-0">
              <GraduationCap size={22} className="text-white" />
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <h1 className="text-lg font-bold text-gray-900">EduSync</h1>
                <p className="text-xs text-warm-500">Learning Platform</p>
              </div>
            )}
          </div>
        </div>

        {/* User info */}
        {!collapsed && (
          <div className="p-4 mx-4 mt-4 bg-warm-50 rounded-xl animate-fade-in">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.full_name}</p>
            <p className="text-xs text-warm-500 truncate mt-0.5">{user?.email}</p>
            <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full ${roleColor}`}>
              {roleLabel}
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-2">
          {!collapsed && (
            <p className="px-4 text-[11px] font-semibold text-warm-400 uppercase tracking-wider mb-3">
              Navigation
            </p>
          )}
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              }
              title={link.label}
            >
              <link.icon size={20} />
              {!collapsed && <span>{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-gray-100 space-y-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-link w-full hidden lg:flex"
          >
            <ChevronLeft
              size={20}
              className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            />
            {!collapsed && <span>Collapse</span>}
          </button>
          <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
            <LogOut size={20} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
