import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Review } from '../../types';
import { Star, Eye, EyeOff, Trash2 } from 'lucide-react';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reviews', { params: { includeHidden: 'true' } });
      if (res.data?.data) {
        setReviews(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleHide = async (id: string) => {
    try {
      await api.patch(`/reviews/${id}/toggle-hide`);
      fetchReviews();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Toggle failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      fetchReviews();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
          Reputation & Guest Feedback
        </span>
        <h1 className="font-serif text-2xl font-bold text-[#242321]">
          Customer Reviews Moderation
        </h1>
        <p className="text-xs text-gray-500">
          Reviews are submitted exclusively by guests who have completed verified stays.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((r) => (
          <div
            key={r.id}
            className={`bg-white rounded-lg border p-5 shadow-sm space-y-3 flex flex-col justify-between ${
              r.isHidden ? 'border-amber-300 bg-amber-50/20' : 'border-[#E8E2D7]'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-[#B79A65]">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                {r.isHidden && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    Hidden
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-700 italic leading-relaxed">
                "{r.comment}"
              </p>

              <div className="pt-2 border-t text-[11px] text-gray-500">
                <div className="font-bold text-gray-900">{r.customer?.name} ({r.customer?.email})</div>
                <div>{r.branch?.name}</div>
                <div>{new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end space-x-2 text-xs">
              <button
                onClick={() => handleToggleHide(r.id)}
                className="px-2.5 py-1 border rounded text-gray-600 hover:bg-gray-50 flex items-center space-x-1"
              >
                {r.isHidden ? <Eye className="w-3.5 h-3.5 text-emerald-700" /> : <EyeOff className="w-3.5 h-3.5 text-amber-700" />}
                <span>{r.isHidden ? 'Show Publicly' : 'Hide'}</span>
              </button>
              <button
                onClick={() => handleDelete(r.id)}
                className="p-1.5 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
