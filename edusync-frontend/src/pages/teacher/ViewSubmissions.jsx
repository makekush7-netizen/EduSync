import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageShell from '../../components/layout/PageShell';
import { homeworkAPI } from '../../lib/api';
import { ArrowLeft, Loader2, FileText, Download, Type, Image, File, Clock } from 'lucide-react';

export default function ViewSubmissions() {
  const { id } = useParams();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['submissions', id],
    queryFn: () => homeworkAPI.getSubmissions(id).then((r) => r.data),
  });

  const typeIcons = { text: Type, pdf: File, image: Image };

  return (
    <PageShell>
      <div className="page-enter max-w-4xl">
        <button onClick={() => window.history.back()} className="btn-ghost mb-6 -ml-2">
          <ArrowLeft size={18} /> Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Submissions</h1>
          <p className="text-warm-500 mt-1">
            {submissions?.length || 0} student{(submissions?.length || 0) !== 1 ? 's' : ''} submitted
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-brand-500" size={28} />
          </div>
        ) : submissions?.length > 0 ? (
          <div className="space-y-3">
            {submissions.map((sub) => {
              const Icon = typeIcons[sub.content_type] || FileText;
              return (
                <div key={sub.id} className="solid-card p-5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Icon size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{sub.student_name}</p>
                    <p className="text-sm text-warm-500">{sub.student_email}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-warm-400">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(sub.submitted_at).toLocaleString()}
                      </span>
                      <span className="badge-neutral">{sub.content_type}</span>
                    </div>
                  </div>
                  {sub.content_type === 'text' ? (
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-700 line-clamp-2">{sub.content_text}</p>
                    </div>
                  ) : (
                    <a
                      href={sub.content_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs"
                    >
                      <Download size={14} />
                      Download
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <FileText size={40} className="text-warm-300 mb-3" />
            <p className="text-warm-500">No submissions yet</p>
            <p className="text-warm-400 text-xs mt-1">Students haven&apos;t submitted their work</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
