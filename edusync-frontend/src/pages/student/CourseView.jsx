import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageShell from '../../components/layout/PageShell';
import { courseAPI, lessonAPI, homeworkAPI } from '../../lib/api';
import {
  ArrowLeft, FileText, Video, Type, File as FileIcon, Download,
  ExternalLink, ClipboardList, Calendar, Loader2, Upload, MessageSquare, Sparkles, Image
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CourseView() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('lessons');
  const [expandedLesson, setExpandedLesson] = useState(null);

  // Submission form state
  const [submitForm, setSubmitForm] = useState({
    homeworkId: null,
    content_type: 'text',
    content_text: '',
    file: null,
  });

  const { data: course, error: courseError } = useQuery({
    queryKey: ['course', id],
    queryFn: () => courseAPI.getById(id).then((r) => r.data),
  });

  const { data: lessons, error: lessonsError } = useQuery({
    queryKey: ['lessons', id],
    queryFn: () => lessonAPI.getByCourse(id).then((r) => r.data),
  });

  const { data: homeworks, error: homeworksError } = useQuery({
    queryKey: ['homework', id],
    queryFn: () => homeworkAPI.getByCourse(id).then((r) => r.data),
  });

  const submitMutation = useMutation({
    mutationFn: ({ homeworkId, formData }) => homeworkAPI.submit(homeworkId, formData),
    onSuccess: () => {
      toast.success('Homework submitted!');
      setSubmitForm({ homeworkId: null, content_type: 'text', content_text: '', file: null });
      queryClient.invalidateQueries({ queryKey: ['homework', id] });
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to submit'),
  });

  const handleSubmit = (hwId) => {
    const fd = new FormData();
    fd.append('content_type', submitForm.content_type);
    if (submitForm.content_type === 'text') {
      fd.append('content_text', submitForm.content_text);
    } else if (submitForm.file) {
      fd.append('file', submitForm.file);
    }
    submitMutation.mutate({ homeworkId: hwId, formData: fd });
  };

  const contentTypeIcons = { text: Type, video_link: Video, pdf: FileIcon, image: Image, video: Video };

  const tabs = [
    { key: 'lessons', label: 'Lessons', count: lessons?.length },
    { key: 'homework', label: 'Homework', count: homeworks?.length },
  ];

  return (
    <PageShell>
      <div className="page-enter">
        <Link to="/student/dashboard" className="btn-ghost mb-6 -ml-2">
          <ArrowLeft size={18} /> Back to My Courses
        </Link>

        {/* Error display */}
        {courseError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 font-medium">Failed to load course</p>
            <p className="text-red-500 text-sm mt-1">{courseError?.response?.data?.detail || 'Please try again later'}</p>
          </div>
        )}
        {lessonsError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 font-medium">Failed to load lessons</p>
            <p className="text-red-500 text-sm mt-1">{lessonsError?.response?.data?.detail || 'Please try again later'}</p>
          </div>
        )}
        {homeworksError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 font-medium">Failed to load homework</p>
            <p className="text-red-500 text-sm mt-1">{homeworksError?.response?.data?.detail || 'Please try again later'}</p>
          </div>
        )}

        {/* Course Header */}
        <div className="bg-gradient-hero rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm mb-3">
              {course?.subject_tag || 'General'}
            </span>
            <h1 className="text-3xl font-bold mb-2">{course?.title}</h1>
            <p className="text-brand-200 max-w-2xl">{course?.description}</p>
            <Link
              to={`/student/courses/${id}/chat`}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 
                         rounded-xl text-sm font-medium backdrop-blur-sm transition-colors"
            >
              <Sparkles size={16} />
              Ask AI Chatbot
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${activeTab === tab.key
                ? 'border-brand-500 text-brand-700'
                : 'border-transparent text-warm-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded text-xs ${activeTab === tab.key ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'
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
            {lessons?.length > 0 ? (
              <div className="space-y-3">
                {lessons.map((lesson, index) => {
                  const Icon = contentTypeIcons[lesson.content_type] || FileText;
                  const isExpanded = expandedLesson === lesson.id;
                  return (
                    <div key={lesson.id} className="solid-card overflow-hidden">
                      <button
                        onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
                        className="w-full p-5 flex items-center gap-4 text-left hover:bg-warm-50 transition-colors"
                      >
                        <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                          <p className="text-sm text-warm-500 truncate">{lesson.description}</p>
                        </div>
                        <span className="badge-neutral flex items-center gap-1 flex-shrink-0">
                          <Icon size={12} />
                          {lesson.content_type === 'video_link'
                            ? 'Video'
                            : lesson.content_type === 'pdf'
                              ? 'PDF'
                              : lesson.content_type === 'image'
                                ? 'Image'
                                : lesson.content_type === 'video'
                                  ? 'Video'
                                  : 'Text'}
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-0 border-t border-gray-100 animate-scale-in">
                          <div className="pt-4">
                            {lesson.content_type === 'text' && (
                              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap bg-warm-50 p-4 rounded-xl">
                                {lesson.content_text}
                              </div>
                            )}
                            {lesson.content_type === 'video_link' && (
                              <a
                                href={lesson.content_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary"
                              >
                                <ExternalLink size={16} /> Watch Video
                              </a>
                            )}
                            {lesson.content_type === 'pdf' && (
                              <a
                                href={lesson.content_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary"
                              >
                                <Download size={16} /> View/Download PDF
                              </a>
                            )}
                            {lesson.content_type === 'image' && lesson.content_url && (
                              <img
                                src={lesson.content_url}
                                alt={lesson.title}
                                className="max-w-full rounded-xl border border-gray-200 shadow-sm"
                              />
                            )}
                            {lesson.content_type === 'video' && lesson.content_url && (
                              <video
                                controls
                                src={lesson.content_url}
                                className="w-full rounded-xl bg-black"
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <FileText size={40} className="text-warm-300 mb-3" />
                <p className="text-warm-500">No lessons available yet</p>
              </div>
            )}
          </div>
        )}

        {/* HOMEWORK TAB */}
        {activeTab === 'homework' && (
          <div>
            {homeworks?.length > 0 ? (
              <div className="space-y-4">
                {homeworks.map((hw) => {
                  const isSubmitting = submitForm.homeworkId === hw.id;
                  return (
                    <div key={hw.id} className="solid-card p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{hw.title}</h3>
                          <p className="text-sm text-warm-500 mt-0.5">{hw.description}</p>
                        </div>
                        {hw.submitted ? (
                          <span className="badge-success">Submitted ✓</span>
                        ) : hw.due_date && new Date(hw.due_date) < new Date() ? (
                          <span className="badge-danger">Overdue</span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-warm-500 mb-3">
                        {hw.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> Due: {new Date(hw.due_date).toLocaleDateString()}
                          </span>
                        )}
                        <span>Accepts: {hw.allowed_types?.join(', ')}</span>
                      </div>

                      {!hw.submitted && (
                        <>
                          {!isSubmitting ? (
                            <button
                              onClick={() => setSubmitForm((p) => ({ ...p, homeworkId: hw.id, content_type: hw.allowed_types?.[0] || 'text' }))}
                              className="btn-primary"
                            >
                              <Upload size={16} /> Submit Homework
                            </button>
                          ) : (
                            <div className="mt-3 p-4 bg-warm-50 rounded-xl space-y-3 animate-scale-in">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Submission Type</label>
                                <select
                                  value={submitForm.content_type}
                                  onChange={(e) => setSubmitForm((p) => ({ ...p, content_type: e.target.value }))}
                                  className="input-base"
                                >
                                  {hw.allowed_types?.map((t) => (
                                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                  ))}
                                </select>
                              </div>

                              {submitForm.content_type === 'text' && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Answer</label>
                                  <textarea
                                    value={submitForm.content_text}
                                    onChange={(e) => setSubmitForm((p) => ({ ...p, content_text: e.target.value }))}
                                    className="input-base resize-none"
                                    rows={5}
                                    placeholder="Type your answer here..."
                                  />
                                </div>
                              )}

                              {(submitForm.content_type === 'pdf' || submitForm.content_type === 'image') && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Upload {submitForm.content_type === 'pdf' ? 'PDF' : 'Image'}
                                  </label>
                                  <input
                                    type="file"
                                    accept={submitForm.content_type === 'pdf' ? '.pdf' : 'image/*'}
                                    onChange={(e) => setSubmitForm((p) => ({ ...p, file: e.target.files[0] }))}
                                    className="input-base file:mr-4 file:py-1 file:px-3 file:border-0 file:rounded-lg file:text-sm file:bg-brand-50 file:text-brand-700"
                                  />
                                </div>
                              )}

                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleSubmit(hw.id)}
                                  disabled={submitMutation.isPending}
                                  className="btn-primary"
                                >
                                  {submitMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                  Submit
                                </button>
                                <button
                                  onClick={() => setSubmitForm({ homeworkId: null, content_type: 'text', content_text: '', file: null })}
                                  className="btn-secondary"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <ClipboardList size={40} className="text-warm-300 mb-3" />
                <p className="text-warm-500">No homework assigned yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}