import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/layout/PageShell';
import { courseAPI, enrollmentAPI } from '../../lib/api';
import { Compass, Loader2, Search, Send, CheckCircle, Clock, BookOpen, Key } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BrowseCourses() {
  const [search, setSearch] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => courseAPI.getAll().then((r) => r.data),
  });

  const enrollMutation = useMutation({
    mutationFn: (courseId) => enrollmentAPI.request(courseId),
    onSuccess: () => {
      toast.success('Enrollment request sent!');
      queryClient.invalidateQueries({ queryKey: ['all-courses'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || 'Failed to request enrollment');
    },
  });

  const joinMutation = useMutation({
    mutationFn: (code) => enrollmentAPI.joinWithCode({ invite_code: code }),
    onSuccess: (res) => {
      toast.success('Successfully joined the course!');
      queryClient.invalidateQueries({ queryKey: ['all-courses'] });
      navigate(`/student/courses/${res.data.course_id}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || 'Invalid invite code');
    },
  });

  const handleJoin = (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    joinMutation.mutate(inviteCode.trim());
  };

  const filtered = courses?.filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.subject_tag?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageShell>
      <div className="page-enter">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Compass size={32} className="text-brand-500" />
              Browse Courses
            </h1>
            <p className="text-warm-500 mt-1">Discover and enroll in available courses</p>
          </div>
        </div>

        {/* Join with Code */}
        <div className="solid-card p-6 mb-8 flex flex-col md:flex-row items-center gap-6 bg-brand-50/50 border-brand-100">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Key size={20} className="text-brand-600" />
              Have an Invite Code?
            </h2>
            <p className="text-sm text-warm-600 mt-1">Enter the 6-digit code from your teacher to join instantly.</p>
          </div>
          <form onSubmit={handleJoin} className="flex w-full md:w-auto gap-3">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g. X7Y8Z9"
              className="input-base w-full md:w-48 font-mono uppercase text-center tracking-widest"
              maxLength={6}
            />
            <button
              type="submit"
              disabled={joinMutation.isPending || inviteCode.length < 6}
              className="btn-primary flex-shrink-0"
            >
              {joinMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Join'}
            </button>
          </form>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">All Courses</h2>
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
            {filtered.map((course) => {
              const isEnrolled = course.enrollment_status === 'approved';
              const isPending = course.enrollment_status === 'pending';
              return (
                <div key={course.id} className="glass-card p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="badge-info">{course.subject_tag || 'General'}</span>
                    {isEnrolled && <span className="badge-success">Enrolled</span>}
                    {isPending && <span className="badge-warning">Pending</span>}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-warm-500 line-clamp-3 mb-4">{course.description}</p>
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-xs text-warm-500 mb-3">
                      <span>{course.lesson_count || 0} lessons</span>
                      <span>by {course.teacher_name || 'Instructor'}</span>
                    </div>
                    {isEnrolled ? (
                      <div className="flex items-center gap-1.5 text-sm text-brand-600">
                        <CheckCircle size={16} />
                        <span className="font-medium">You&apos;re enrolled</span>
                      </div>
                    ) : isPending ? (
                      <div className="flex items-center gap-1.5 text-sm text-amber-600">
                        <Clock size={16} />
                        <span className="font-medium">Awaiting approval</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => enrollMutation.mutate(course.id)}
                        disabled={enrollMutation.isPending}
                        className="btn-primary w-full"
                      >
                        {enrollMutation.isPending ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            <Send size={16} />
                            Request Enrollment
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <BookOpen size={48} className="text-warm-300 mb-4" />
            <p className="text-warm-500">No courses available</p>
            <p className="text-warm-400 text-sm mt-1">Check back later for new courses</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
