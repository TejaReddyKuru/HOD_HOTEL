import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Amenity } from '../../types';
import { Sparkles, Plus, Edit, Trash2, X, Check } from 'lucide-react';

export const AdminAmenitiesPage: React.FC = () => {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Sparkles');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [saving, setSaving] = useState(false);

  const fetchAmenities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/amenities');
      if (res.data?.data) {
        setAmenities(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load amenities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  const openCreateModal = () => {
    setEditingAmenity(null);
    setName('');
    setIcon('Sparkles');
    setDescription('');
    setCategory('GENERAL');
    setModalOpen(true);
  };

  const openEditModal = (a: Amenity) => {
    setEditingAmenity(a);
    setName(a.name);
    setIcon(a.icon);
    setDescription(a.description || '');
    setCategory(a.category);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingAmenity) {
        await api.put(`/amenities/${editingAmenity.id}`, { name, icon, description, category });
      } else {
        await api.post('/amenities', { name, icon, description, category });
      }
      setModalOpen(false);
      fetchAmenities();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save amenity');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this amenity?')) return;
    try {
      await api.delete(`/amenities/${id}`);
      fetchAmenities();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
            Comfort Features
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#242321]">
            Hotel Amenities & Conveniences
          </h1>
          <p className="text-xs text-gray-500">
            Create reusable amenities to assign across hotel rooms.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#242321] text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#B79A65] transition-colors flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4 text-[#B79A65]" />
          <span>Add Amenity</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {amenities.map((a) => (
          <div key={a.id} className="bg-white p-4 rounded-lg border border-[#E8E2D7] shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-bold text-sm text-[#242321] block">{a.name}</span>
              <span className="text-[11px] text-gray-400 block">{a.description || a.category}</span>
            </div>
            <div className="flex items-center space-x-1">
              <button onClick={() => openEditModal(a)} className="p-1 text-gray-400 hover:text-[#B79A65]">
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(a.id)} className="p-1 text-red-400 hover:text-red-700">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full space-y-4 shadow-xl text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif text-base font-bold text-[#242321]">
                {editingAmenity ? 'Edit Amenity' : 'Add Amenity'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Amenity Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Infinity Swimming Pool"
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Icon Key</label>
                <input
                  type="text"
                  required
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="Wifi / Coffee / Bed / Waves"
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief note..."
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-[#242321] text-white font-semibold rounded hover:bg-[#B79A65]"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
