import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
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
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-lg border border-[#EFE8DC] p-8 sm:p-12 shadow-xl max-w-md w-full space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <span className="font-serif text-2xl font-bold tracking-widest text-[#242321] block">
            HOUSE OF DREAMS
          </span>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#B79A65] font-semibold">
            Stay. Relax. Dream.
          </p>
          <h2 className="font-serif text-xl font-bold text-[#242321] pt-2">
            Sign In to Your Account
          </h2>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
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
                className="w-full pl-9 pr-3 py-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
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
                className="w-full pl-9 pr-3 py-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#242321] text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#B79A65] transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-[#766F66]">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-[#B79A65] font-semibold hover:underline">
            Register Here
          </Link>
        </div>


      </div>
    </div>
  );
};
