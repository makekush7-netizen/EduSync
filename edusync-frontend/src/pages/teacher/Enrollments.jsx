import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageShell from '../../components/layout/PageShell';
import { courseAPI, enrollmentAPI } from '../../lib/api';
import { Loader2, CheckCircle, XCircle, Clock, UserCheck, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherEnrollments() {
  const queryClient = useQueryClient();

  const { data: courses } = useQuery({
    queryKey: ['my-courses'],
    queryFn: () => courseAPI.getMy().then((r) => r.data),
  });

  // Fetch enrollments for all courses
  const { data: allEnrollments, isLoading } = useQuery({
    queryKey: ['teacher-enrollments'],
    queryFn: async () => {
      if (!courses?.length) return [];
      const results = await Promise.all(
        courses.map((c) =>
          enrollmentAPI.getByCourse(c.id).then((r) =>
            r.data.map((e) => ({ ...e, course_title: c.title }))
          ).catch(() => [])
        )
      );
      return results.flat();
    },
    enabled: !!courses,
  });

  const approveMutation = useMutation({
    mutationFn: (id) => enrollmentAPI.approve(id),
    onSuccess: () => {
      toast.success('Enrollment approved!');
      queryClient.invalidateQueries({ queryKey: ['teacher-enrollments'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => enrollmentAPI.reject(id),
    onSuccess: () => {
      toast.success('Enrollment rejected');
      queryClient.invalidateQueries({ queryKey: ['teacher-enrollments'] });
    },
  });

  const pending = allEnrollments?.filter((e) => e.status === 'pending') || [];
  const processed = allEnrollments?.filter((e) => e.status !== 'pending') || [];

  return (
    <PageShell>
      <div className="page-enter max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Enrollment Requests</h1>
          <p className="text-warm-500 mt-1">Manage student enrollment requests for your courses</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-brand-500" size={28} />
          </div>
        ) : (
          <>
            {/* Pending */}
            <div className="solid-card overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-100 bg-amber-50/50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock size={20} className="text-amber-500" />
                  Pending
                  {pending.length > 0 && <span className="badge-warning">{pending.length}</span>}
                </h2>
              </div>

              {pending.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {pending.map((enrollment) => (
                    <div key={enrollment.id} className="p-5 flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-amber-700 font-semibold text-sm">
                          {enrollment.student_name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{enrollment.student_name}</p>
                        <p className="text-sm text-warm-500">{enrollment.student_email}</p>
                        <p className="text-xs text-warm-400 mt-0.5 flex items-center gap-1">
                          <BookOpen size={11} />
                          {enrollment.course_title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => approveMutation.mutate(enrollment.id)}
                          disabled={approveMutation.isPending}
                          className="btn bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 px-3 py-2"
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button
                          onClick={() => rejectMutation.mutate(enrollment.id)}
                          disabled={rejectMutation.isPending}
                          className="btn bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-2"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state py-8">
                  <UserCheck size={32} className="text-warm-300 mb-2" />
                  <p className="text-warm-500 text-sm">No pending requests</p>
                </div>
              )}
            </div>

            {/* Processed */}
            {processed.length > 0 && (
              <div className="solid-card overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Processed</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {processed.map((enrollment) => (
                    <div key={enrollment.id} className="p-5 flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-semibold text-sm">
                          {enrollment.student_name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{enrollment.student_name}</p>
                        <p className="text-xs text-warm-400">{enrollment.course_title}</p>
                      </div>
                      <span className={enrollment.status === 'approved' ? 'badge-success' : 'badge-danger'}>
                        {enrollment.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}
