import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Brain, UploadCloud, Users, Sparkles } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-warm-50 font-sans selection:bg-brand-500 selection:text-white flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-warm-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center text-white">
              <BookOpen size={18} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-700 to-teal-600 bg-clip-text text-transparent">
              EduSync
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Log in
            </Link>
            <Link to="/register" className="btn-primary py-2 px-4 text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-24 pb-32 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-brand-400/20 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-sm font-medium mb-8">
              <Sparkles size={16} />
              <span>AI-Powered Learning Platform</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-8">
              Modern Education,<br />
              <span className="bg-gradient-hero bg-clip-text text-transparent">Synchronized.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              EduSync brings teachers and students together with intuitive course management, 
              rich media uploads, and a cutting-edge Gemini AI study assistant.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary py-3.5 px-8 text-lg w-full sm:w-auto flex items-center justify-center gap-2 group">
                Start Your Journey
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="btn-secondary py-3.5 px-8 text-lg w-full sm:w-auto">
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to succeed</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                A unified platform designed for the modern classroom, equipped with powerful tools for both educators and learners.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="glass-card p-8">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <Users size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Role-Based Access</h3>
                <p className="text-gray-600 leading-relaxed">
                  Dedicated portals for Admins, Teachers, and Students. Manage your school, create rich courses, and enroll in classes seamlessly.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="glass-card p-8">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                  <Brain size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI Study Assistant</h3>
                <p className="text-gray-600 leading-relaxed">
                  Powered by Google Gemini. Students get a 24/7 personalized tutor that understands course context and helps clarify complex topics.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="glass-card p-8">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-6">
                  <UploadCloud size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Rich Media Support</h3>
                <p className="text-gray-600 leading-relaxed">
                  Embed videos, upload PDF lessons, and allow students to submit homework via text, images, or documents effortlessly.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-brand-400" />
            <span className="text-xl font-bold">EduSync</span>
          </div>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} EduSync Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
