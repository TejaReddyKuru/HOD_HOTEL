import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Branch, BranchStatus } from '../../types';
import { Building2, Plus, Edit, ToggleLeft, ToggleRight, MapPin, Phone, Mail, Clock, X, Trash2 } from 'lucide-react';

export const AdminBranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutTime, setCheckOutTime] = useState('11:00');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<BranchStatus>('ACTIVE');
  const [saving, setSaving] = useState(false);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/branches');
      if (res.data?.data) {
        setBranches(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load branches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const openCreateModal = () => {
    setEditingBranch(null);
    setName('');
    setDescription('');
    setAddress('');
    setCity('');
    setState('');
    setPincode('');
    setPhone('');
    setEmail('');
    setCheckInTime('14:00');
    setCheckOutTime('11:00');
    setImageUrl('');
    setStatus('ACTIVE');
    setModalOpen(true);
  };

  const openEditModal = (b: Branch) => {
    setEditingBranch(b);
    setName(b.name);
    setDescription(b.description);
    setAddress(b.address);
    setCity(b.city);
    setState(b.state);
    setPincode(b.pincode);
    setPhone(b.phone);
    setEmail(b.email);
    setCheckInTime(b.checkInTime);
    setCheckOutTime(b.checkOutTime);
    let firstImg = '';
    try {
      const parsed = JSON.parse(b.images || '[]');
      firstImg = parsed[0] || '';
    } catch {}
    setImageUrl(b.featuredImage || firstImg);
    setStatus(b.status);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        name,
        description,
        address,
        city,
        state,
        pincode,
        phone,
        email,
        checkInTime,
        checkOutTime,
        status,
      };
      if (imageUrl) {
        payload.featuredImage = imageUrl;
        payload.images = [imageUrl];
      }

      if (editingBranch) {
        await api.put(`/branches/${editingBranch.id}`, payload);
      } else {
        await api.post('/branches', payload);
      }

      setModalOpen(false);
      fetchBranches();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save branch');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (branch: Branch) => {
    const action = branch.status === 'ACTIVE' ? 'deactivate' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${action} ${branch.name}? All historical bookings & revenue reports will remain safely preserved.`)) return;

    try {
      await api.patch(`/branches/${branch.id}/toggle-status`);
      fetchBranches();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Status toggle failed');
    }
  };

  const handleDeleteBranch = async (branch: Branch) => {
    if (!window.confirm(`Are you sure you want to permanently delete hotel branch "${branch.name}" and its associated rooms? This action cannot be undone.`)) return;

    try {
      await api.delete(`/branches/${branch.id}`);
      fetchBranches();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
            Multi-Branch Architecture
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#242321]">
            Hotel Branches Management
          </h1>
          <p className="text-xs text-gray-500">
            Create, configure, and manage hotel branches without deleting historical booking ledgers.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#242321] text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#B79A65] transition-colors flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4 text-[#B79A65]" />
          <span>Add New Branch</span>
        </button>
      </div>

      {/* Branch Cards Grid */}
      {loading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-2 border-[#B79A65] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-xs text-gray-500">Loading hotel branches...</span>
        </div>
      ) : branches.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E8E2D7] p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#F8F5EF] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E8E2D7]">
            <Building2 className="w-8 h-8 text-[#B79A65]" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#242321] mb-2">No Hotel Branches Configured Yet</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            Your property management platform is clean and ready. Click the button below to register your original hotel property, address, check-in policies, and photos.
          </p>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-[#242321] text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#B79A65] transition-colors inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4 text-[#B79A65]" />
            <span>Add Your First Branch</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((b) => {
            const isActive = b.status === 'ACTIVE';

            return (
              <div
                key={b.id}
                className="bg-white rounded-lg border border-[#E8E2D7] shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={b.featuredImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'}
                      alt={b.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-[#242321]/80 backdrop-blur-sm text-white px-2.5 py-0.5 rounded text-[11px] font-semibold">
                      {b.city}, {b.state}
                    </div>
                    <div className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                      isActive ? 'bg-emerald-800 text-white' : 'bg-red-800 text-white'
                    }`}>
                      {b.status}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#242321]">{b.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{b.description}</p>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600 pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-[#B79A65] flex-shrink-0" />
                        <span className="truncate">{b.address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3.5 h-3.5 text-[#B79A65] flex-shrink-0" />
                        <span>{b.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-[#B79A65] flex-shrink-0" />
                        <span>Check-in: {b.checkInTime} • Check-out: {b.checkOutTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-gray-100 mt-2 flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    <strong className="text-gray-900">{b._count?.rooms || 0}</strong> Rooms • <strong className="text-gray-900">{b._count?.bookings || 0}</strong> Bookings
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(b)}
                      className="p-1.5 text-gray-600 hover:text-[#B79A65] transition-colors"
                      title="Edit Branch"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(b)}
                      className={`p-1.5 transition-colors ${isActive ? 'text-amber-700 hover:text-amber-900' : 'text-emerald-700 hover:text-emerald-900'}`}
                      title={isActive ? 'Deactivate Branch' : 'Reactivate Branch'}
                    >
                      {isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleDeleteBranch(b)}
                      className="p-1.5 text-red-500 hover:text-red-700 transition-colors"
                      title="Delete Branch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif text-lg font-bold text-[#242321]">
                {editingBranch ? 'Edit Hotel Branch' : 'Add New Hotel Branch'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Branch Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="House of Dreams - Mussoorie Cloud View"
                    className="w-full p-2 border rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mussoorie"
                    className="w-full p-2 border rounded focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the aesthetic and natural setting..."
                  className="w-full p-2 border rounded focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Uttarakhand"
                    className="w-full p-2 border rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="248179"
                    className="w-full p-2 border rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BranchStatus)}
                    className="w-full p-2 border rounded focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Full Street Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Mall Road, Near Library Chowk"
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Front Desk Phone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 135 263 1100"
                    className="w-full p-2 border rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mussoorie@houseofdreams.com"
                    className="w-full p-2 border rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Standard Check-in Time</label>
                  <input
                    type="text"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    placeholder="14:00"
                    className="w-full p-2 border rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Standard Check-out Time</label>
                  <input
                    type="text"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    placeholder="11:00"
                    className="w-full p-2 border rounded focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Featured Photo Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
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
                  {saving ? 'Saving...' : 'Save Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
