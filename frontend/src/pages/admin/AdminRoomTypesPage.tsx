import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { RoomType } from '../../types';
import { Layers, Plus, Edit, Trash2, X } from 'lucide-react';

export const AdminRoomTypesPage: React.FC = () => {
  const [types, setTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<RoomType | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState(5000);
  const [maxOccupancy, setMaxOccupancy] = useState(2);
  const [bedType, setBedType] = useState('King Bed');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/room-types');
      if (res.data?.data) {
        setTypes(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load room types:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const openCreateModal = () => {
    setEditingType(null);
    setName('');
    setDescription('');
    setBasePrice(5000);
    setMaxOccupancy(2);
    setBedType('King Bed');
    setImageUrl('');
    setModalOpen(true);
  };

  const openEditModal = (t: RoomType) => {
    setEditingType(t);
    setName(t.name);
    setDescription(t.description);
    setBasePrice(t.basePrice);
    setMaxOccupancy(t.maxOccupancy);
    setBedType(t.bedType);
    let firstImg = '';
    try {
      const parsed = JSON.parse(t.images || '[]');
      firstImg = parsed[0] || '';
    } catch {}
    setImageUrl(firstImg);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        name,
        description,
        basePrice: Number(basePrice),
        maxOccupancy: Number(maxOccupancy),
        bedType,
        images: imageUrl ? [imageUrl] : [],
      };

      if (editingType) {
        await api.put(`/room-types/${editingType.id}`, payload);
      } else {
        await api.post('/room-types', payload);
      }

      setModalOpen(false);
      fetchTypes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save room type');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this room type?')) return;
    try {
      await api.delete(`/room-types/${id}`);
      fetchTypes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
            Catalog Categories
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#242321]">
            Room Types & Categorization
          </h1>
          <p className="text-xs text-gray-500">
            Define categories, standard bed types, and base tariffs.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#242321] text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#B79A65] transition-colors flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4 text-[#B79A65]" />
          <span>Add Room Type</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {types.map((t) => (
          <div key={t.id} className="bg-white rounded-lg border border-[#E8E2D7] shadow-sm p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-serif text-lg font-bold text-[#242321]">{t.name}</h3>
                <span className="text-xs font-bold text-emerald-800">Base ₹{t.basePrice}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{t.description}</p>
              <div className="text-xs text-gray-600 pt-2 space-y-1">
                <div><span className="text-gray-400">Bed:</span> {t.bedType}</div>
                <div><span className="text-gray-400">Max Capacity:</span> {t.maxOccupancy} Guests</div>
                <div><span className="text-gray-400">Active Rooms:</span> {t._count?.rooms || 0} Rooms Assigned</div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end space-x-2">
              <button
                onClick={() => openEditModal(t)}
                className="p-1.5 text-gray-600 hover:text-[#B79A65]"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                className="p-1.5 text-red-600 hover:text-red-800"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4 shadow-xl text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif text-lg font-bold text-[#242321]">
                {editingType ? 'Edit Room Type' : 'Add Room Type'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Royal Lakefront Suite"
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe category aesthetics..."
                  className="w-full p-2 border rounded focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(parseFloat(e.target.value))}
                    className="w-full p-2 border rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Max Guests</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={maxOccupancy}
                    onChange={(e) => setMaxOccupancy(parseInt(e.target.value, 10))}
                    className="w-full p-2 border rounded focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Bed Configuration</label>
                <input
                  type="text"
                  required
                  value={bedType}
                  onChange={(e) => setBedType(e.target.value)}
                  placeholder="e.g. King Bed + Daybed"
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>

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
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
