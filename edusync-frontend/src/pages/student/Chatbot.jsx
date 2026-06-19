import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageShell from '../../components/layout/PageShell';
import { courseAPI, chatAPI } from '../../lib/api';
import {
  ArrowLeft, Send, Loader2, Sparkles, Bot, User, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Chatbot() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { data: course } = useQuery({
    queryKey: ['course', id],
    queryFn: () => courseAPI.getById(id).then((r) => r.data),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await chatAPI.send(id, {
        message: userMessage,
        history: messages,
      });

      setMessages([...newMessages, { role: 'model', content: res.data.reply }]);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to get AI response');
      // Remove the user message on error
      setMessages(messages);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  return (
    <PageShell>
      <div className="page-enter h-[calc(100vh-7rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Link to={`/student/courses/${id}`} className="btn-ghost -ml-2">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles size={20} className="text-amber-500" />
                AI Study Assistant
              </h1>
              <p className="text-sm text-warm-500">{course?.title}</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button onClick={clearChat} className="btn-ghost text-warm-400 hover:text-red-500">
              <Trash2 size={16} />
              Clear
            </button>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 solid-card overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-brand-100 rounded-2xl flex items-center justify-center mb-4">
                  <Bot size={32} className="text-brand-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Hi there! 👋</h2>
                <p className="text-warm-500 max-w-md mb-6">
                  I&apos;m your AI study assistant for <span className="font-semibold text-gray-700">{course?.title}</span>.
                  Ask me anything about the course concepts!
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {[
                    'Explain the key concepts',
                    'Help me understand the last lesson',
                    'Give me a practice question',
                    'Summarize the course topics',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-1.5 bg-warm-50 hover:bg-warm-100 border border-warm-200 
                                 rounded-full text-sm text-warm-600 hover:text-gray-800 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    {msg.role !== 'user' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bot size={16} className="text-brand-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-brand-600 text-white rounded-br-md'
                          : 'bg-warm-50 text-gray-800 border border-warm-200 rounded-bl-md'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-brand-700" />
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 items-start animate-fade-in">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-brand-100 rounded-lg flex items-center justify-center">
                      <Bot size={16} className="text-brand-600" />
                    </div>
                    <div className="bg-warm-50 border border-warm-200 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about the course..."
                className="flex-1 input-base resize-none min-h-[44px] max-h-32"
                rows={1}
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="btn-primary px-4 py-3 flex-shrink-0"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
            <p className="text-xs text-warm-400 mt-2 text-center">
              Powered by Google Gemini · Responses may not always be accurate
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
