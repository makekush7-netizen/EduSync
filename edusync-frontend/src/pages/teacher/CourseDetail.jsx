import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageShell from '../../components/layout/PageShell';
import { courseAPI, lessonAPI, homeworkAPI } from '../../lib/api';
import {
  ArrowLeft, FileText, Plus, Upload, Link as LinkIcon, Type,
  Loader2, ClipboardList, Sparkles, Settings, Calendar, Eye,
  Video, FileIcon, AlignLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CourseDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('lessons');
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showHomeworkForm, setShowHomeworkForm] = useState(false);
  const [showPromptForm, setShowPromptForm] = useState(false);

  // Lesson form state
  const [lessonForm, setLessonForm] = useState({
    title: '', description: '', content_type: 'text', content_text: '', content_url: '', file: null,
  });

  // Homework form state
  const [hwForm, setHwForm] = useState({
    title: '', description: '', due_date: '', allowed_types: ['text', 'pdf', 'image'],
  });

  // Prompt form state
  const [prompt, setPrompt] = useState('');

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => courseAPI.getById(id).then((r) => r.data),
    onSuccess: (data) => setPrompt(data.chatbot_system_prompt || ''),
  });

  const { data: lessons } = useQuery({
    queryKey: ['lessons', id],
    queryFn: () => lessonAPI.getByCourse(id).then((r) => r.data),
  });

  const { data: homeworks } = useQuery({
    queryKey: ['homework', id],
    queryFn: () => homeworkAPI.getByCourse(id).then((r) => r.data),
  });

  const lessonMutation = useMutation({
    mutationFn: (formData) => lessonAPI.create(id, formData),
    onSuccess: () => {
      toast.success('Lesson added!');
      queryClient.invalidateQueries({ queryKey: ['lessons', id] });
      setShowLessonForm(false);
      setLessonForm({ title: '', description: '', content_type: 'text', content_text: '', content_url: '', file: null });
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to add lesson'),
  });

  const hwMutation = useMutation({
    mutationFn: (data) => homeworkAPI.create(id, data),
    onSuccess: () => {
      toast.success('Homework assigned!');
      queryClient.invalidateQueries({ queryKey: ['homework', id] });
      setShowHomeworkForm(false);
      setHwForm({ title: '', description: '', due_date: '', allowed_types: ['text', 'pdf', 'image'] });
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to assign homework'),
  });

  const promptMutation = useMutation({
    mutationFn: (data) => courseAPI.updatePrompt(id, data),
    onSuccess: () => {
      toast.success('Chatbot prompt updated!');
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      setShowPromptForm(false);
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to update prompt'),
  });

  const handleLessonSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', lessonForm.title);
    fd.append('description', lessonForm.description);
    fd.append('content_type', lessonForm.content_type);
    if (lessonForm.content_type === 'text') {
      fd.append('content_text', lessonForm.content_text);
    } else if (lessonForm.content_type === 'video_link') {
      fd.append('content_url', lessonForm.content_url);
    } else if (['pdf', 'image', 'video'].includes(lessonForm.content_type) && lessonForm.file) {
      fd.append('file', lessonForm.file);
    }
    lessonMutation.mutate(fd);
  };

  const handleHwSubmit = (e) => {
    e.preventDefault();
    hwMutation.mutate(hwForm);
  };

  const contentTypeIcons = {
    text: <Type size={14} />,
    video_link: <Video size={14} />,
    pdf: <FileIcon size={14} />,
    image: <Image size={14} />,
    video: <Video size={14} />,
  };

  const contentTypeLabels = {
    text: 'Rich Text',
    video_link: 'Video Link',
    pdf: 'PDF Document',
    image: 'Image Upload',
    video: 'Video Upload',
  };

  if (courseLoading) {
    return (
      <PageShell>
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-500" size={28} />
        </div>
      </PageShell>
    );
  }

  const tabs = [
    { key: 'lessons', label: 'Lessons', count: lessons?.length },
    { key: 'homework', label: 'Homework', count: homeworks?.length },
    { key: 'settings', label: 'AI Chatbot', icon: Sparkles },
  ];

  return (
    <PageShell>
      <div className="page-enter">
        <Link to="/teacher/dashboard" className="btn-ghost mb-6 -ml-2">
          <ArrowLeft size={18} />
          Back to Courses
        </Link>

        {/* Course Header */}
        <div className="bg-gradient-hero rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm mb-3">
              {course?.subject_tag || 'General'}
            </span>
            <h1 className="text-3xl font-bold mb-2">{course?.title}</h1>
            <p className="text-brand-200 max-w-2xl">{course?.description}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'border-brand-500 text-brand-700'
                  : 'border-transparent text-warm-500 hover:text-gray-700'
              }`}
            >
              {tab.icon && <tab.icon size={16} />}
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded text-xs ${
                  activeTab === tab.key ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count || 0}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* LESSONS TAB */}
        {activeTab === 'lessons' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Course Lessons</h2>
              <button onClick={() => setShowLessonForm(!showLessonForm)} className="btn-primary">
                <Plus size={16} /> Add Lesson
              </button>
            </div>

            {showLessonForm && (
              <form onSubmit={handleLessonSubmit} className="solid-card p-6 mb-6 space-y-4 animate-scale-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                    <input
                      type="text"
                      value={lessonForm.title}
                      onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))}
                      className="input-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Content Type</label>
                    <select
                      value={lessonForm.content_type}
                      onChange={(e) => setLessonForm((p) => ({ ...p, content_type: e.target.value }))}
                      className="input-base"
                    >
                      <option value="text">Rich Text</option>
                      <option value="video_link">Video Link</option>
                      <option value="pdf">PDF Upload</option>
                      <option value="image">Image Upload</option>
                      <option value="video">Video Upload</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={lessonForm.description}
                    onChange={(e) => setLessonForm((p) => ({ ...p, description: e.target.value }))}
                    className="input-base resize-none"
                    rows={2}
                  />
                </div>

                {lessonForm.content_type === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Content</label>
                    <textarea
                      value={lessonForm.content_text}
                      onChange={(e) => setLessonForm((p) => ({ ...p, content_text: e.target.value }))}
                      className="input-base resize-none"
                      rows={6}
                      placeholder="Write your lesson content here..."
                    />
                  </div>
                )}

                {lessonForm.content_type === 'video_link' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Video URL</label>
                    <input
                      type="url"
                      value={lessonForm.content_url}
                      onChange={(e) => setLessonForm((p) => ({ ...p, content_url: e.target.value }))}
                      className="input-base"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                )}

                {lessonForm.content_type === 'pdf' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">PDF File</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setLessonForm((p) => ({ ...p, file: e.target.files[0] }))}
                      className="input-base file:mr-4 file:py-1 file:px-3 file:border-0 file:rounded-lg file:text-sm file:bg-brand-50 file:text-brand-700"
                    />
                  </div>
                )}

                {lessonForm.content_type === 'image' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Image File</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLessonForm((p) => ({ ...p, file: e.target.files[0] }))}
                      className="input-base file:mr-4 file:py-1 file:px-3 file:border-0 file:rounded-lg file:text-sm file:bg-brand-50 file:text-brand-700"
                    />
                  </div>
                )}

                {lessonForm.content_type === 'video' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Video File</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setLessonForm((p) => ({ ...p, file: e.target.files[0] }))}
                      className="input-base file:mr-4 file:py-1 file:px-3 file:border-0 file:rounded-lg file:text-sm file:bg-brand-50 file:text-brand-700"
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" disabled={lessonMutation.isPending} className="btn-primary">
                    {lessonMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    Add Lesson
                  </button>
                  <button type="button" onClick={() => setShowLessonForm(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {lessons?.length > 0 ? (
              <div className="space-y-3">
                {lessons.map((lesson, index) => (
                  <div key={lesson.id} className="solid-card p-5 flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-700 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                      <p className="text-sm text-warm-500 truncate">{lesson.description}</p>
                    </div>
                    <span className="badge-neutral flex items-center gap-1">
                      {contentTypeIcons[lesson.content_type]}
                      {contentTypeLabels[lesson.content_type]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FileText size={40} className="text-warm-300 mb-3" />
                <p className="text-warm-500">No lessons yet</p>
                <p className="text-warm-400 text-xs mt-1">Click &quot;Add Lesson&quot; to create your first lesson</p>
              </div>
            )}
          </div>
        )}

        {/* HOMEWORK TAB */}
        {activeTab === 'homework' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Homework Assignments</h2>
              <button onClick={() => setShowHomeworkForm(!showHomeworkForm)} className="btn-primary">
                <Plus size={16} /> Assign Homework
              </button>
            </div>

            {showHomeworkForm && (
              <form onSubmit={handleHwSubmit} className="solid-card p-6 mb-6 space-y-4 animate-scale-in">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                  <input
                    type="text"
                    value={hwForm.title}
                    onChange={(e) => setHwForm((p) => ({ ...p, title: e.target.value }))}
                    className="input-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={hwForm.description}
                    onChange={(e) => setHwForm((p) => ({ ...p, description: e.target.value }))}
                    className="input-base resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
                    <input
                      type="date"
                      value={hwForm.due_date}
                      onChange={(e) => setHwForm((p) => ({ ...p, due_date: e.target.value }))}
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Allowed Types</label>
                    <div className="flex items-center gap-3 mt-2">
                      {['text', 'pdf', 'image'].map((t) => (
                        <label key={t} className="flex items-center gap-1.5 text-sm">
                          <input
                            type="checkbox"
                            checked={hwForm.allowed_types.includes(t)}
                            onChange={(e) => {
                              setHwForm((p) => ({
                                ...p,
                                allowed_types: e.target.checked
                                  ? [...p.allowed_types, t]
                                  : p.allowed_types.filter((x) => x !== t),
                              }));
                            }}
                            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                          />
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" disabled={hwMutation.isPending} className="btn-primary">
                    {hwMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <ClipboardList size={16} />}
                    Assign
                  </button>
                  <button type="button" onClick={() => setShowHomeworkForm(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {homeworks?.length > 0 ? (
              <div className="space-y-3">
                {homeworks.map((hw) => (
                  <div key={hw.id} className="solid-card p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{hw.title}</h3>
                        <p className="text-sm text-warm-500 mt-0.5">{hw.description}</p>
                      </div>
                      <Link
                        to={`/teacher/homework/${hw.id}/submissions`}
                        className="btn-secondary text-xs"
                      >
                        <Eye size={14} />
                        View Submissions
                      </Link>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-warm-500">
                      {hw.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> Due: {new Date(hw.due_date).toLocaleDateString()}
                        </span>
                      )}
                      <span>Accepts: {hw.allowed_types?.join(', ')}</span>
                      <span>{hw.submission_count || 0} submissions</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <ClipboardList size={40} className="text-warm-300 mb-3" />
                <p className="text-warm-500">No homework assigned yet</p>
              </div>
            )}
          </div>
        )}

        {/* AI CHATBOT TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <div className="solid-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">AI Chatbot Configuration</h2>
                  <p className="text-xs text-warm-500">Customize the Gemini chatbot for this course</p>
                </div>
              </div>

              {showPromptForm ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">System Prompt</label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="input-base resize-none"
                      rows={6}
                      placeholder="You are a helpful educational assistant for this course..."
                    />
                    <p className="text-xs text-warm-400 mt-1.5">
                      Leave blank to auto-generate from course title and lesson titles
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => promptMutation.mutate({ chatbot_system_prompt: prompt })}
                      disabled={promptMutation.isPending}
                      className="btn-primary"
                    >
                      {promptMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      Save Prompt
                    </button>
                    <button onClick={() => setShowPromptForm(false)} className="btn-secondary">Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  {course?.chatbot_system_prompt ? (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 mb-4">
                      <p className="text-sm text-amber-800 whitespace-pre-wrap">{course.chatbot_system_prompt}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-warm-500 mb-4 p-4 bg-warm-50 rounded-xl">
                      No custom prompt set. The chatbot will auto-generate a prompt from your course title and lesson titles.
                    </p>
                  )}
                  <button onClick={() => setShowPromptForm(true)} className="btn-secondary">
                    <Settings size={16} />
                    {course?.chatbot_system_prompt ? 'Edit Prompt' : 'Set Custom Prompt'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
