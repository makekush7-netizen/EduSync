import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageShell from '../../components/layout/PageShell';
import { schoolAPI } from '../../lib/api';
import { Users, Mail, Loader2, UserPlus, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageTeachers() {
  const [email, setEmail] = useState('');
  const queryClient = useQueryClient();

  const { data: school } = useQuery({
    queryKey: ['school'],
    queryFn: () => schoolAPI.getMy().then((r) => r.data),
    retry: false,
  });

  const inviteMutation = useMutation({
    mutationFn: (data) => schoolAPI.inviteTeacher(data),
    onSuccess: () => {
      toast.success('Teacher invited successfully!');
      setEmail('');
      queryClient.invalidateQueries({ queryKey: ['school'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || 'Failed to invite teacher');
    },
  });

  const handleInvite = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    inviteMutation.mutate({ email: email.trim() });
  };

  return (
    <PageShell>
      <div className="page-enter max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Teachers</h1>
          <p className="text-warm-500 mt-1">Invite teachers to join your school</p>
        </div>

        {/* Invite Form */}
        <div className="solid-card p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserPlus size={20} className="text-brand-500" />
            Invite Teacher
          </h2>
          <form onSubmit={handleInvite} className="flex gap-3">
            <div className="relative flex-1">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@institution.edu"
                className="input-base pl-11"
                required
              />
            </div>
            <button
              type="submit"
              disabled={inviteMutation.isPending}
              className="btn-primary"
            >
              {inviteMutation.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Send size={16} />
                  Invite
                </>
              )}
            </button>
          </form>
          <p className="text-xs text-warm-400 mt-2">
            The teacher must already have a registered account with this email
          </p>
        </div>

        {/* Teachers List */}
        <div className="solid-card overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users size={20} className="text-brand-500" />
              School Teachers
            </h2>
          </div>

          {school?.teachers?.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {school.teachers.map((teacher) => (
                <div key={teacher.id} className="p-5 flex items-center gap-4 hover:bg-warm-50 transition-colors">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                    <span className="text-brand-700 font-semibold text-sm">
                      {teacher.full_name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{teacher.full_name}</p>
                    <p className="text-sm text-warm-500 truncate">{teacher.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-brand-500" />
                    <span className="text-xs text-brand-600 font-medium">Active</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state py-12">
              <Users size={40} className="text-warm-300 mb-3" />
              <p className="text-warm-500 text-sm">No teachers added yet</p>
              <p className="text-warm-400 text-xs mt-1">Invite teachers using the form above</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
