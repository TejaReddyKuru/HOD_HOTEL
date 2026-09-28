import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { User, Branch, UserStatus } from '../../types';
import { UserCheck, Plus, Edit, Lock, ToggleLeft, ToggleRight, X, Building, Phone, Mail } from 'lucide-react';

export const AdminReceptionPage: React.FC = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [branchId, setBranchId] = useState('');
  const [status, setStatus] = useState<UserStatus>('ACTIVE');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [staffRes, branchesRes] = await Promise.all([
        api.get('/reception'),
        api.get('/branches'),
      ]);

      if (staffRes.data?.data) setStaff(staffRes.data.data);
      if (branchesRes.data?.data) {
        setBranches(branchesRes.data.data);
        if (!branchId && branchesRes.data.data.length > 0) {
          setBranchId(branchesRes.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load reception management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingStaff(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setStatus('ACTIVE');
    setModalOpen(true);
  };

  const openEditModal = (s: any) => {
    setEditingStaff(s);
    setName(s.name);
    setEmail(s.email);
    setPhone(s.phone || '');
    setPassword('');
    setBranchId(s.branchId || '');
    setStatus(s.status);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingStaff) {
        const payload: any = { name, email, phone, branchId, status };
        if (password.trim()) payload.password = password.trim();
        await api.put(`/reception/${editingStaff.id}`, payload);
      } else {
        await api.post('/reception', {
          name,
          email,
          phone,
          password,
          branchId,
        });
      }

      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save reception officer');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (s: any) => {
    const newStatus = s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    // Instant optimistic UI update
    setStaff((prev) =>
      prev.map((item) => (item.id === s.id ? { ...item, status: newStatus } : item))
    );

    try {
      await api.put(`/reception/${s.id}`, { status: newStatus });
    } catch (err: any) {
      // Revert if error occurs
      setStaff((prev) =>
        prev.map((item) => (item.id === s.id ? { ...item, status: s.status } : item))
      );
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
            Staff & Front Desk Authorities
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#242321]">
            Reception Staff Officers
          </h1>
          <p className="text-xs text-gray-500">
            Create front desk accounts and assign them to specific hotel branches (Rule: 1 branch per staff).
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#242321] text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#B79A65] transition-colors flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4 text-[#B79A65]" />
          <span>Add Reception Staff</span>
        </button>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-2 border-[#B79A65] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-xs text-gray-500">Loading reception staff...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((s) => {
            const isActive = s.status === 'ACTIVE';

            return (
              <div
                key={s.id}
                className="bg-white rounded-lg border border-[#E8E2D7] shadow-sm p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#242321]">{s.name}</h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#B79A65]">
                        Front Desk Officer
                      </span>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                        isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  {/* Assigned Branch Banner */}
                  <div className="p-2.5 bg-[#F8F5EF] rounded border border-[#EFE8DC] text-xs">
                    <span className="text-[10px] uppercase font-semibold text-gray-400 block">Assigned Hotel Branch</span>
                    <span className="font-bold text-gray-900 block truncate">
                      {s.branch?.name || 'Unassigned'}
                    </span>
                    <span className="text-[11px] text-gray-500 block">{s.branch?.city}</span>
                  </div>

                  <div className="space-y-1 text-xs text-gray-600 pt-1">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-[#B79A65]" />
                      <span>{s.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-[#B79A65]" />
                      <span>{s.phone || 'No direct phone'}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-500 pt-2 border-t border-gray-100 flex justify-between">
                    <span>Check-ins Processed: <strong>{s._count?.checkIns || 0}</strong></span>
                    <span>Desk Payments: <strong>{s._count?.payments || 0}</strong></span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  {/* Instant Animated Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(s)}
                    className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 cursor-pointer shadow-xs active:scale-95 ${
                      isActive
                        ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 hover:border-stone-300'
                    }`}
                    title={isActive ? 'Click to deactivate officer' : 'Click to reactivate officer'}
                  >
                    <span
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                        isActive ? 'bg-emerald-600' : 'bg-stone-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                          isActive ? 'translate-x-[18px]' : 'translate-x-[2px]'
                        }`}
                      />
                    </span>
                    <span className="tracking-wide">
                      {isActive ? 'Active' : 'Reactivate'}
                    </span>
                  </button>

                  {/* Sleek Edit Profile Button */}
                  <button
                    type="button"
                    onClick={() => openEditModal(s)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E2D7] text-gray-700 hover:text-[#B79A65] hover:border-[#B79A65] hover:bg-[#F8F5EF] text-xs font-semibold transition-all duration-200 shadow-xs active:scale-95 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#B79A65]" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4 shadow-xl text-xs animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif text-lg font-bold text-[#242321]">
                {editingStaff ? 'Edit Reception Officer' : 'Add New Reception Officer'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kavita Rathore"
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Email (Login ID)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="reception@houseofdreams.com"
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98200 00011"
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  {editingStaff ? 'Reset Password (leave blank to keep current)' : 'Password'}
                </label>
                <input
                  type="password"
                  required={!editingStaff}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingStaff ? '••••••••' : 'Min 6 characters'}
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Assigned Branch (Strict 1-Branch Rule)</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none"
                  required
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              {editingStaff && (
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Account Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as UserStatus)}
                    className="w-full p-2 border rounded focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#242321] text-white uppercase tracking-wider font-semibold rounded hover:bg-[#B79A65] transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Staff Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
