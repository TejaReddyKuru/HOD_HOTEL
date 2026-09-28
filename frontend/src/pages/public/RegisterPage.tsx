import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, User, Phone, MapPin, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        name,
        email,
        phone,
        password,
        address,
      });
      navigate('/customer/bookings');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-lg border border-[#EFE8DC] p-8 sm:p-12 shadow-xl max-w-lg w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <span className="font-serif text-2xl font-bold tracking-widest text-[#242321] block">
            HOUSE OF DREAMS
          </span>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#B79A65] font-semibold">
            Stay. Relax. Dream.
          </p>
          <h2 className="font-serif text-xl font-bold text-[#242321] pt-1">
            Create Guest Account
          </h2>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-[#B79A65]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vikram Malhotra"
                className="w-full pl-9 pr-3 py-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-[#B79A65]" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98201 12345"
                  className="w-full pl-9 pr-3 py-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#B79A65]" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
              City / Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-[#B79A65]" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Bandra West, Mumbai"
                className="w-full pl-9 pr-3 py-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#242321] text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#B79A65] transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 shadow-sm"
          >
            <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-[#766F66]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#B79A65] font-semibold hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
};
