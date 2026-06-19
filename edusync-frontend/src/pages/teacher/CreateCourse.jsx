import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageShell from '../../components/layout/PageShell';
import { courseAPI } from '../../lib/api';
import { BookOpen, Loader2, ArrowLeft, Tag, FileText, AlignLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateCourse() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_tag: '',
  });

  const createMutation = useMutation({
    mutationFn: (data) => courseAPI.create(data),
    onSuccess: (res) => {
      toast.success('Course created successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-courses'] });
      navigate(`/teacher/courses/${res.data.id}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || 'Failed to create course');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <PageShell>
      <div className="page-enter max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost mb-6 -ml-2"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Course</h1>
          <p className="text-warm-500 mt-1">Add a new course to your teaching portfolio</p>
        </div>

        <form onSubmit={handleSubmit} className="solid-card p-8 space-y-6">
          <div>
            <label htmlFor="course-title" className="block text-sm font-medium text-gray-700 mb-1.5">
              Course Title *
            </label>
            <div className="relative">
              <BookOpen size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400" />
              <input
                id="course-title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g., Data Structures & Algorithms"
                className="input-base pl-11"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="course-desc" className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <div className="relative">
              <AlignLeft size={18} className="absolute left-4 top-3.5 text-warm-400" />
              <textarea
                id="course-desc"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="What will students learn in this course?"
                className="input-base pl-11 resize-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="course-tag" className="block text-sm font-medium text-gray-700 mb-1.5">
              Subject Tag
            </label>
            <div className="relative">
              <Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400" />
              <input
                id="course-tag"
                type="text"
                value={formData.subject_tag}
                onChange={(e) => setFormData((p) => ({ ...p, subject_tag: e.target.value }))}
                placeholder="e.g., Computer Science, Mathematics"
                className="input-base pl-11"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-primary w-full py-3"
            >
              {createMutation.isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <BookOpen size={18} />
                  Create Course
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
