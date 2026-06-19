import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GraduationCap, Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, AlertCircle, Shield, BookOpen, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const roles = [
  {
    value: 'student',
    label: 'Student',
    icon: GraduationCap,
    description: 'Browse courses, submit homework, chat with AI',
    color: 'border-blue-200 bg-blue-50 text-blue-700',
    activeColor: 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20',
  },
  {
    value: 'teacher',
    label: 'Teacher',
    icon: BookOpen,
    description: 'Create courses, assign homework, manage students',
    color: 'border-brand-200 bg-brand-50 text-brand-700',
    activeColor: 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20',
  },
  {
    value: 'admin',
    label: 'Admin',
    icon: Shield,
    description: 'Manage the school, invite teachers, oversee everything',
    color: 'border-amber-200 bg-amber-50 text-amber-700',
    activeColor: 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20',
  },
];

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(formData);
      toast.success(`Welcome to EduSync, ${user.full_name}!`);
      const dashboardMap = {
        admin: '/admin/dashboard',
        teacher: '/teacher/dashboard',
        student: '/student/dashboard',
      };
      navigate(dashboardMap[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Decorative Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-32 left-16 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-center p-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <GraduationCap size={28} />
            </div>
            <span className="text-2xl font-bold">EduSync</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Start Your<br />
            Learning Journey
          </h2>
          <p className="text-brand-200 text-lg max-w-md leading-relaxed">
            Join a community of learners and educators. Access courses, 
            submit assignments, and get AI-powered help — all in one place.
          </p>

          <div className="flex flex-wrap gap-3 mt-10">
            {['Easy Enrollment', 'AI Doubt Solver', 'PDF & Image Upload', 'Real-time Progress'].map((f) => (
              <span key={f} className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/90 border border-white/10">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-warm-50">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center">
              <GraduationCap size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">EduSync</span>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="text-warm-500 mt-2">Choose your role and get started</p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-scale-in">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role: role.value }))}
                    className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                      formData.role === role.value ? role.activeColor : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <role.icon size={22} className={`mx-auto mb-1 ${formData.role === role.value ? '' : 'text-gray-400'}`} />
                    <p className={`text-sm font-semibold ${formData.role === role.value ? '' : 'text-gray-600'}`}>{role.label}</p>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-warm-500">
                {roles.find((r) => r.value === formData.role)?.description}
              </p>
            </div>

            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400" />
                <input
                  id="reg-name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="input-base pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400" />
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@institution.edu"
                  className="input-base pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400" />
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="input-base pl-11 pr-11"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Create Account
                  <Sparkles size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-warm-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
