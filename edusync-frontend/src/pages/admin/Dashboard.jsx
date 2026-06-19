import { useQuery } from '@tanstack/react-query';
import PageShell from '../../components/layout/PageShell';
import { schoolAPI, courseAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  School, BookOpen, Users, GraduationCap, ArrowRight,
  TrendingUp, Loader2, Plus
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: school, isLoading: schoolLoading } = useQuery({
    queryKey: ['school'],
    queryFn: () => schoolAPI.getMy().then((r) => r.data),
    retry: false,
  });

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => courseAPI.getAll().then((r) => r.data),
    enabled: !!school,
  });

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => schoolAPI.getStudents().then((r) => r.data),
    enabled: !!school,
  });

  const stats = [
    {
      label: 'Total Courses',
      value: courses?.length || 0,
      icon: BookOpen,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
      link: '/admin/courses',
    },
    {
      label: 'Students',
      value: students?.length || 0,
      icon: GraduationCap,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      link: '/admin/students',
    },
    {
      label: 'Teachers',
      value: school?.teacher_count || 0,
      icon: Users,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      link: '/admin/teachers',
    },
  ];

  return (
    <PageShell>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-warm-500 mb-1">Welcome back,</p>
          <h1 className="text-3xl font-bold text-gray-900">{user?.full_name} 👋</h1>
          <p className="text-warm-500 mt-1">Here&apos;s your school overview</p>
        </div>

        {/* School Setup CTA or School Info */}
        {schoolLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-brand-500" size={28} />
          </div>
        ) : !school ? (
          <div className="solid-card p-8 text-center mb-8 border-dashed border-2 border-brand-200 bg-brand-50/30">
            <School size={48} className="mx-auto text-brand-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Set Up Your School</h2>
            <p className="text-warm-500 mb-6 max-w-md mx-auto">
              Create your school to start inviting teachers and managing courses
            </p>
            <Link to="/admin/school" className="btn-primary">
              <Plus size={18} />
              Create School
            </Link>
          </div>
        ) : (
          <div className="bg-gradient-hero rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <School size={24} />
                <span className="text-brand-200 text-sm font-medium">Your School</span>
              </div>
              <h2 className="text-2xl font-bold">{school.name}</h2>
              <p className="text-brand-200 mt-1 max-w-lg">{school.description}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        {school && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {stats.map((stat) => (
              <Link key={stat.label} to={stat.link} className="stat-card group hover:shadow-card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-warm-500 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <stat.icon size={24} className={stat.color} />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 text-sm text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  View all <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Recent Courses */}
        {courses?.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Courses</h2>
              <Link to="/admin/courses" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.slice(0, 6).map((course) => (
                <Link key={course.id} to={`/admin/courses/${course.id}`} className="glass-card p-5 group">
                  <div className="flex items-start justify-between mb-3">
                    <span className="badge-info">{course.subject_tag || 'General'}</span>
                    <TrendingUp size={16} className="text-warm-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-brand-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-warm-500 line-clamp-2">{course.description}</p>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-warm-500">
                    <span>{course.lesson_count || 0} lessons</span>
                    <span>{course.enrollment_count || 0} students</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
