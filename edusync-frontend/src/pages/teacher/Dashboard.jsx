import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import PageShell from '../../components/layout/PageShell';
import { courseAPI, schoolAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  BookOpen, Plus, Loader2, FileText, Users, ArrowRight, Sparkles, Building, Key, Copy, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [inviteCode, setInviteCode] = useState('');
  const [copiedCourseId, setCopiedCourseId] = useState(null);

  const { data: school, isLoading: schoolLoading, refetch: refetchSchool } = useQuery({
    queryKey: ['my-school'],
    queryFn: () => schoolAPI.getMy().then((r) => r.data),
    refetchOnMount: 'always',
  });

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['my-courses'],
    queryFn: () => courseAPI.getMy().then((r) => r.data),
    enabled: !!school,
    refetchOnMount: 'always',
  });

  const joinMutation = useMutation({
    mutationFn: (code) => schoolAPI.join({ invite_code: code }),
    onSuccess: () => {
      toast.success('Successfully joined school!');
      queryClient.invalidateQueries({ queryKey: ['my-courses'] });
      refetchSchool();
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || 'Invalid invite code');
    },
  });

  const handleJoinSchool = (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    joinMutation.mutate(inviteCode.trim());
  };

  const handleCopyCourseCode = async (course) => {
    try {
      await navigator.clipboard.writeText(course.invite_code);
      setCopiedCourseId(course.id);
      toast.success(`Copied ${course.invite_code}`);
      window.setTimeout(() => setCopiedCourseId((current) => (current === course.id ? null : current)), 1200);
    } catch {
      toast.error('Copy failed. You can still select the code manually.');
    }
  };

  const isLoading = schoolLoading || (school && coursesLoading);

  return (
    <PageShell>
      <div className="page-enter">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-warm-500 mb-1">Welcome back,</p>
            <h1 className="text-3xl font-bold text-gray-900">{user?.full_name} 👋</h1>
            <p className="text-warm-500 mt-1">Manage your courses and students</p>
          </div>
          <Link to="/teacher/courses/create" className="btn-primary">
            <Plus size={18} />
            New Course
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-brand-500" size={28} />
          </div>
        ) : !school ? (
          <div className="solid-card p-12 text-center max-w-lg mx-auto mt-12 border-dashed border-2 border-amber-200 bg-amber-50/30">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building size={32} className="text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Join a School</h2>
            <p className="text-warm-600 mb-8">
              You haven&apos;t joined a school yet. Enter the invite code provided by your school administrator to get started.
            </p>
            <form onSubmit={handleJoinSchool} className="space-y-4">
              <div className="relative">
                <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400" />
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g. A1B2C3"
                  className="input-base pl-11 text-center font-mono tracking-widest uppercase"
                  maxLength={6}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={joinMutation.isPending || inviteCode.length < 6}
                className="btn-primary w-full py-3"
              >
                {joinMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Join School'}
              </button>
            </form>
          </div>
        ) : courses?.length > 0 ? (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="stat-card">
                <p className="text-sm text-warm-500">Courses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{courses.length}</p>
              </div>
              <div className="stat-card">
                <p className="text-sm text-warm-500">Total Lessons</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {courses.reduce((sum, c) => sum + (c.lesson_count || 0), 0)}
                </p>
              </div>
              <div className="stat-card">
                <p className="text-sm text-warm-500">Total Students</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {courses.reduce((sum, c) => sum + (c.enrollment_count || 0), 0)}
                </p>
              </div>
              <div className="stat-card">
                <p className="text-sm text-warm-500">Homework</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {courses.reduce((sum, c) => sum + (c.homework_count || 0), 0)}
                </p>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Your Courses</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/teacher/courses/${course.id}`}
                  className="glass-card p-6 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="badge-info">{course.subject_tag || 'General'}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCopyCourseCode(course);
                        }}
                        className="badge-neutral font-mono text-xs inline-flex items-center gap-1.5 hover:bg-gray-100 transition-colors cursor-pointer"
                        title="Copy course code"
                      >
                        <span>Code: {course.invite_code}</span>
                        {copiedCourseId === course.id ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                    {course.chatbot_system_prompt && (
                      <Sparkles size={16} className="text-amber-500" title="AI Chatbot configured" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-warm-500 line-clamp-2 mb-4">{course.description}</p>
                  <div className="pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-warm-500">
                    <span className="flex items-center gap-1">
                      <FileText size={12} />
                      {course.lesson_count || 0} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {course.enrollment_count || 0} students
                    </span>
                    <ArrowRight size={14} className="ml-auto text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="solid-card p-12 text-center border-dashed border-2 border-brand-200 bg-brand-50/30">
            <BookOpen size={48} className="mx-auto text-brand-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Create Your First Course</h2>
            <p className="text-warm-500 mb-6 max-w-md mx-auto">
              Start by creating a course — you can add lessons, homework, and configure the AI chatbot
            </p>
            <Link to="/teacher/courses/create" className="btn-primary">
              <Plus size={18} />
              Create Course
            </Link>
          </div>
        )}
      </div>
    </PageShell>
  );
}
