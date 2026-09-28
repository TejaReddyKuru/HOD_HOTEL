import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Coupon, DiscountType } from '../../types';
import { Tag, Plus, Edit, Trash2, X, Percent, DollarSign } from 'lucide-react';

export const AdminOffersPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(10);
  const [minBookingAmount, setMinBookingAmount] = useState(3000);
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>(2000);
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [usageLimit, setUsageLimit] = useState(200);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/offers');
      if (res.data?.data) {
        setCoupons(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDescription('');
    setDiscountType('PERCENTAGE');
    setDiscountValue(10);
    setMinBookingAmount(3000);
    setMaxDiscount(2000);
    setStartDate(new Date().toISOString().split('T')[0]);
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setEndDate(nextYear.toISOString().split('T')[0]);
    setUsageLimit(100);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue: Number(discountValue),
        minBookingAmount: Number(minBookingAmount),
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        startDate,
        endDate,
        usageLimit: Number(usageLimit),
      };

      if (editingCoupon) {
        await api.put(`/offers/${editingCoupon.id}`, payload);
      } else {
        await api.post('/offers', payload);
      }

      setModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/offers/${id}`);
      fetchCoupons();
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
            Marketing & Privileges
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#242321]">
            Offers, Coupons & Discounts
          </h1>
          <p className="text-xs text-gray-500">
            Create percentage or flat discount coupon codes applied during booking.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#242321] text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#B79A65] transition-colors flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4 text-[#B79A65]" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div key={c.id} className="bg-white rounded-lg border border-[#E8E2D7] p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold bg-[#F8F5EF] text-[#B79A65] px-2.5 py-1 rounded border border-[#EFE8DC]">
                  {c.code}
                </span>
                <span className="text-[11px] font-bold text-emerald-800">
                  {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                </span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">{c.description}</p>

              <div className="text-[11px] text-gray-500 pt-2 space-y-1">
                <div>Min Booking: ₹{c.minBookingAmount.toLocaleString()}</div>
                {c.maxDiscount && <div>Max Cap: ₹{c.maxDiscount.toLocaleString()}</div>}
                <div>Valid: {new Date(c.startDate).toLocaleDateString()} to {new Date(c.endDate).toLocaleDateString()}</div>
                <div>Usage: {c.usedCount} / {c.usageLimit} redeemed</div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end space-x-2">
              <button onClick={() => handleDelete(c.id)} className="p-1 text-red-500 hover:text-red-700">
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
              <h3 className="font-serif text-lg font-bold text-[#242321]">Create Coupon Offer</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MONSOON20"
                  className="w-full p-2 border rounded focus:outline-none font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 20% discount on heritage stays"
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                    className="w-full p-2 border rounded focus:outline-none"
                  >
                    <option value="PERCENTAGE">PERCENTAGE (%)</option>
                    <option value="FIXED_AMOUNT">FIXED AMOUNT (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value))}
                    className="w-full p-2 border rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Min Booking (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={minBookingAmount}
                    onChange={(e) => setMinBookingAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={maxDiscount || ''}
                    onChange={(e) => setMaxDiscount(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Optional"
                    className="w-full p-2 border rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none"
                  />
                </div>
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
                  className="px-6 py-2 bg-[#242321] text-white uppercase tracking-wider font-semibold rounded hover:bg-[#B79A65]"
                >
                  {saving ? 'Saving...' : 'Save Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
