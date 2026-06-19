import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import PageShell from '../../components/layout/PageShell';
import { enrollmentAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Loader2, ArrowRight, Compass, FileText, MessageSquare } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['my-enrolled-courses'],
    queryFn: () => enrollmentAPI.myCourses().then((r) => r.data),
  });

  return (
    <PageShell>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-warm-500 mb-1">Welcome back,</p>
          <h1 className="text-3xl font-bold text-gray-900">{user?.full_name} 👋</h1>
          <p className="text-warm-500 mt-1">Here are your enrolled courses</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-brand-500" size={28} />
          </div>
        ) : courses?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`/student/courses/${course.id}`}
                className="glass-card p-6 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="badge-info">{course.subject_tag || 'General'}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors mb-2">
                  {course.title}
                </h3>
                <p className="text-sm text-warm-500 line-clamp-2 mb-4">{course.description}</p>
                <div className="pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-warm-500">
                  <span className="flex items-center gap-1">
                    <FileText size={12} /> {course.lesson_count || 0} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare size={12} /> AI Chat
                  </span>
                  <ArrowRight size={14} className="ml-auto text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="solid-card p-12 text-center border-dashed border-2 border-blue-200 bg-blue-50/30">
            <BookOpen size={48} className="mx-auto text-blue-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Courses Yet</h2>
            <p className="text-warm-500 mb-6 max-w-md mx-auto">
              Browse available courses and request enrollment to get started
            </p>
            <Link to="/student/browse" className="btn-primary">
              <Compass size={18} />
              Browse Courses
            </Link>
          </div>
        )}
      </div>
    </PageShell>
  );
}
