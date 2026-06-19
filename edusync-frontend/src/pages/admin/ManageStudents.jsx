import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageShell from '../../components/layout/PageShell';
import { schoolAPI, enrollmentAPI } from '../../lib/api';
import { GraduationCap, Loader2, CheckCircle, XCircle, Clock, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageStudents() {
  const queryClient = useQueryClient();

  const { data: students, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => schoolAPI.getStudents().then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => enrollmentAPI.approve(id),
    onSuccess: () => {
      toast.success('Enrollment approved!');
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => enrollmentAPI.reject(id),
    onSuccess: () => {
      toast.success('Enrollment rejected');
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  // Separate pending enrollments from enrolled students
  const pendingEnrollments = students?.pending_enrollments || [];
  const enrolledStudents = students?.students || students || [];

  return (
    <PageShell>
      <div className="page-enter max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Students</h1>
          <p className="text-warm-500 mt-1">View students and manage enrollment requests</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-brand-500" size={28} />
          </div>
        ) : (
          <>
            {/* Pending Enrollments */}
            {pendingEnrollments.length > 0 && (
              <div className="solid-card overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-100 bg-amber-50/50">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock size={20} className="text-amber-500" />
                    Pending Enrollment Requests
                    <span className="badge-warning ml-2">{pendingEnrollments.length}</span>
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {pendingEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="p-5 flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-amber-700 font-semibold text-sm">
                          {enrollment.student_name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{enrollment.student_name}</p>
                        <p className="text-sm text-warm-500">{enrollment.student_email}</p>
                        <p className="text-xs text-warm-400 mt-0.5">
                          Wants to join: <span className="font-medium text-gray-600">{enrollment.course_title}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => approveMutation.mutate(enrollment.id)}
                          disabled={approveMutation.isPending}
                          className="btn bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 px-3 py-2"
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => rejectMutation.mutate(enrollment.id)}
                          disabled={rejectMutation.isPending}
                          className="btn bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-2"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Students */}
            <div className="solid-card overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <GraduationCap size={20} className="text-brand-500" />
                  All Students
                </h2>
              </div>

              {Array.isArray(enrolledStudents) && enrolledStudents.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {enrolledStudents.map((student) => (
                    <div key={student.id} className="p-5 flex items-center gap-4 hover:bg-warm-50 transition-colors">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 font-semibold text-sm">
                          {student.full_name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{student.full_name}</p>
                        <p className="text-sm text-warm-500">{student.email}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UserCheck size={14} className="text-brand-500" />
                        <span className="text-xs text-brand-600 font-medium">Enrolled</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state py-12">
                  <GraduationCap size={40} className="text-warm-300 mb-3" />
                  <p className="text-warm-500 text-sm">No students in the school yet</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
