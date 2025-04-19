import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff, ArrowRightCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('📌 Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('🎉 Welcome back to your study challenge!');
      navigate('/');
    } catch (error) {
      toast.error('Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      toast.error('Enter your email to reset password');
      return;
    }

    try {
      await resetPassword(email);
      toast.success('📩 Password reset email sent!');
    } catch (error) {
      toast.error('Failed to send reset email.');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 font-sans"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1612831455543-bfb7e4949233?auto=format&fit=crop&w=1600&q=80')",
      }}
    >
      <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-3xl p-8 max-w-md w-full transition-all duration-300 hover:scale-[1.02] border border-indigo-100">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-indigo-800 animate-fadeIn">🎓 Study Challenge Login</h2>
          <p className="text-sm text-gray-600 mt-2">
            Stay focused. Track progress. Achieve your goals.
          </p>
          <div className="mt-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm transition transform hover:scale-105 bg-indigo-100 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md"
            >
              <UserPlus size={18} /> Create a new account & start your journey
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn delay-150">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex justify-end text-sm">
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-indigo-600 hover:text-indigo-700 font-medium transition"
            >
              Forgot your password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium text-sm transition disabled:opacity-50"
          >
            <LogIn size={18} />
            {isLoading ? 'Signing in to your study journey...' : 'Sign in & Start Tracking'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          📅 Stay consistent. You’re one step closer to mastering your goals!
        </div>
      </div>
    </div>
  );
}
