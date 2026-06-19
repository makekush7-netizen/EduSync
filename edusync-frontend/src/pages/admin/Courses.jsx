import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import PageShell from '../../components/layout/PageShell';
import { courseAPI } from '../../lib/api';
import { BookOpen, Loader2, ArrowRight, Search } from 'lucide-react';
import { useState } from 'react';

export default function AdminCourses() {
  const [search, setSearch] = useState('');

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => courseAPI.getAll().then((r) => r.data),
  });

  const filtered = courses?.filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.subject_tag?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageShell>
      <div className="page-enter">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Courses</h1>
            <p className="text-warm-500 mt-1">Browse all courses in your school</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="input-base pl-11"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-brand-500" size={28} />
          </div>
        ) : filtered?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((course) => (
              <Link
                key={course.id}
                to={`/admin/courses/${course.id}`}
                className="glass-card p-6 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="badge-info">{course.subject_tag || 'General'}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors mb-2">
                  {course.title}
                </h3>
                <p className="text-sm text-warm-500 line-clamp-2 mb-4">{course.description}</p>
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-warm-500">
                  <div className="flex items-center gap-4">
                    <span>{course.lesson_count || 0} lessons</span>
                    <span>{course.enrollment_count || 0} students</span>
                  </div>
                  <ArrowRight size={14} className="text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <BookOpen size={48} className="text-warm-300 mb-4" />
            <p className="text-warm-500">No courses found</p>
            <p className="text-warm-400 text-sm mt-1">Teachers can create courses from their dashboard</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
