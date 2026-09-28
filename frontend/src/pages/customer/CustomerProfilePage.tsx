import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { User, Mail, Phone, MapPin, CheckCircle, Save } from 'lucide-react';

export const CustomerProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      await api.put('/customers/profile', { name, phone, address });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div>
        <span className="text-xs uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
          Account Settings
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#242321]">
          Guest Profile
        </h1>
        <p className="text-xs text-[#766F66]">
          Manage your personal details for quick front desk check-in.
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg border border-[#EFE8DC] shadow-sm space-y-6">
        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-700" />
            <span>Profile information updated successfully.</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
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
                className="w-full pl-9 pr-3 py-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
              Email Address (Login Identity)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-9 pr-3 py-2 bg-gray-100 border border-gray-200 rounded text-xs text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
              Primary Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 w-4 h-4 text-[#B79A65]" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-[#B79A65]" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="City, State"
                className="w-full pl-9 pr-3 py-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-[#242321] text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#B79A65] transition-colors flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Update Profile'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
