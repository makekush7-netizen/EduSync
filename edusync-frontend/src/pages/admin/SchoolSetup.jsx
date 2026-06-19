import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageShell from '../../components/layout/PageShell';
import { schoolAPI } from '../../lib/api';
import { School, Loader2, CheckCircle2, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SchoolSetup() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: '', description: '', logo_url: '' });

  const { data: school, isLoading } = useQuery({
    queryKey: ['school'],
    queryFn: () => schoolAPI.getMy().then((r) => r.data),
    retry: false,
    onSuccess: (data) => {
      if (data) {
        setFormData({ name: data.name, description: data.description || '', logo_url: data.logo_url || '' });
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => schoolAPI.create(data),
    onSuccess: () => {
      toast.success('School created successfully!');
      queryClient.invalidateQueries({ queryKey: ['school'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || 'Failed to create school');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-500" size={28} />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="page-enter max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">School Setup</h1>
          <p className="text-warm-500 mt-1">
            {school ? 'Your school details' : 'Create your school to get started'}
          </p>
        </div>

        {school ? (
          <div className="solid-card p-8">
            <div className="flex items-center gap-4 mb-6">
              {school.logo_url ? (
                <img src={school.logo_url} alt={school.name} className="w-16 h-16 rounded-2xl object-cover" />
              ) : (
                <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center">
                  <School size={28} className="text-white" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">{school.name}</h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <CheckCircle2 size={14} className="text-brand-500" />
                  <span className="text-sm text-brand-600 font-medium">Active</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="badge-info text-xs">Invite Code: {school.invite_code}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-warm-500 mb-6">{school.description}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="solid-card p-8 space-y-6">
            <div>
              <label htmlFor="school-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                School Name *
              </label>
              <input
                id="school-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Acropolis Institute of Technology"
                className="input-base"
                required
              />
            </div>

            <div>
              <label htmlFor="school-desc" className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                id="school-desc"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="A brief description of your institution..."
                className="input-base resize-none"
              />
            </div>

            <div>
              <label htmlFor="school-logo" className="block text-sm font-medium text-gray-700 mb-1.5">
                Logo URL <span className="text-warm-400">(optional)</span>
              </label>
              <div className="relative">
                <ImageIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400" />
                <input
                  id="school-logo"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData((p) => ({ ...p, logo_url: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                  className="input-base pl-11"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-primary w-full py-3"
            >
              {createMutation.isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <School size={18} />
                  Create School
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </PageShell>
  );
}
