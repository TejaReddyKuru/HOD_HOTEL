import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles, Building2, UserCheck, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Sign In');
  const [error, setError] = useState('');

  // 1. Pre-warm backend and Neon DB immediately upon landing on login page
  useEffect(() => {
    api.get('/health').catch(() => {});
  }, []);

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setError('');
    setLoadingText('Verifying credentials...');

    // If server is on cold start, give helpful progress feedback
    const timer = setTimeout(() => {
      setLoadingText('Connecting to secure cloud server...');
    }, 2500);

    try {
      const user = await login(loginEmail, loginPass);
      clearTimeout(timer);
      if (redirect) {
        navigate(redirect);
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'RECEPTION') {
        navigate('/reception/dashboard');
      } else {
        navigate('/customer/bookings');
      }
    } catch (err: any) {
      clearTimeout(timer);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
      setLoadingText('Sign In');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(email, password);
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    executeLogin(quickEmail, quickPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-xl border border-[#EFE8DC] p-8 sm:p-10 shadow-xl max-w-lg w-full space-y-6 animate-fadeIn">
        
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <span className="font-serif text-2xl font-bold tracking-widest text-[#242321] block">
            HOUSE OF DREAMS
          </span>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
            Stay. Relax. Dream.
          </p>
          <h2 className="font-serif text-xl font-bold text-[#242321] pt-1">
            Sign In to Your Portal
          </h2>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg animate-fadeIn">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#B79A65]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded-lg text-xs text-[#242321] focus:outline-none focus:border-[#B79A65]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#B79A65]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded-lg text-xs text-[#242321] focus:outline-none focus:border-[#B79A65]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#242321] text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-[#B79A65] transition-all disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer shadow-sm active:scale-95"
          >
            {loading && (
              <div className="w-3.5 h-3.5 border-2 border-[#B79A65] border-t-transparent rounded-full animate-spin" />
            )}
            <span>{loading ? loadingText : 'Sign In'}</span>
            {!loading && <ArrowRight className="w-3.5 h-3.5 text-[#B79A65]" />}
          </button>
        </form>

        <div className="text-center text-xs text-[#766F66]">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-[#B79A65] font-semibold hover:underline">
            Register as Guest
          </Link>
        </div>

        {/* 1-Click Quick Demo Logins */}
        <div className="pt-4 border-t border-gray-100 space-y-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-gray-500 uppercase tracking-wider">1-Click Quick Demo Login</span>
            <span className="text-[10px] text-[#B79A65] font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Instant access
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Admin */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('admin@houseofdreams.com', 'admin123')}
              className="p-2 text-left rounded-lg border border-[#E8E2D7] bg-[#F8F5EF]/70 hover:bg-[#F8F5EF] hover:border-[#B79A65] transition cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center space-x-1.5 font-bold text-[#242321] text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B79A65]" />
                <span>Admin (Global)</span>
              </div>
              <span className="text-[10px] text-gray-500 truncate mt-0.5">admin@houseofdreams.com</span>
            </button>

            {/* Reception Udaipur */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('reception1@houseofdreams.com', 'reception123')}
              className="p-2 text-left rounded-lg border border-[#E8E2D7] bg-[#F8F5EF]/70 hover:bg-[#F8F5EF] hover:border-[#B79A65] transition cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center space-x-1.5 font-bold text-[#242321] text-[11px]">
                <Building2 className="w-3.5 h-3.5 text-[#B79A65]" />
                <span>Reception (Udaipur)</span>
              </div>
              <span className="text-[10px] text-gray-500 truncate mt-0.5">reception1@...</span>
            </button>

            {/* Reception Shimla */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('reception2@houseofdreams.com', 'reception123')}
              className="p-2 text-left rounded-lg border border-[#E8E2D7] bg-[#F8F5EF]/70 hover:bg-[#F8F5EF] hover:border-[#B79A65] transition cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center space-x-1.5 font-bold text-[#242321] text-[11px]">
                <Building2 className="w-3.5 h-3.5 text-[#B79A65]" />
                <span>Reception (Shimla)</span>
              </div>
              <span className="text-[10px] text-gray-500 truncate mt-0.5">reception2@...</span>
            </button>

            {/* Customer Guest */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('customer@houseofdreams.com', 'customer123')}
              className="p-2 text-left rounded-lg border border-[#E8E2D7] bg-[#F8F5EF]/70 hover:bg-[#F8F5EF] hover:border-[#B79A65] transition cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center space-x-1.5 font-bold text-[#242321] text-[11px]">
                <User className="w-3.5 h-3.5 text-[#B79A65]" />
                <span>Customer (Guest)</span>
              </div>
              <span className="text-[10px] text-gray-500 truncate mt-0.5">customer@...</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
