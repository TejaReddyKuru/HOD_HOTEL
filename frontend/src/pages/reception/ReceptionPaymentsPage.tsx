import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Payment } from '../../types';
import { CreditCard, Calendar, User, Search, ShieldCheck, RefreshCw } from 'lucide-react';

export const ReceptionPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchPayments = async (silent = false) => {
    if (!silent) {
      if (payments.length === 0) setLoading(true);
      else setRefreshing(true);
    }
    try {
      const res = await api.get('/payments');
      if (res.data?.data) {
        setPayments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    const interval = setInterval(() => {
      fetchPayments(true);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = payments.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.paymentNumber.toLowerCase().includes(q) ||
      p.booking?.bookingNumber.toLowerCase().includes(q) ||
      p.booking?.customer?.name.toLowerCase().includes(q) ||
      p.paymentMethod.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
            Front Desk Cash & Digital Ledger
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#242321]">
            Desk Payment Records • {user?.branch?.name}
          </h1>
          <p className="text-xs text-gray-500">
            Physical desk payments collected at the reception station (Cash, POS Card, UPI).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Sync</span>
          </div>

          <button
            onClick={() => fetchPayments(false)}
            disabled={refreshing || loading}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-[#E8E2D7] rounded-lg text-xs font-medium text-gray-700 hover:bg-[#F8F5EF] transition-colors shadow-sm disabled:opacity-50"
            title="Refresh payment records"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#B79A65] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <div className="bg-white px-5 py-3 rounded-lg border border-[#E8E2D7] text-right shadow-sm">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
              Total Desk Collections
            </span>
            <span className="font-bold text-xl text-emerald-800">
              ₹{totalCollected.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg border border-[#E8E2D7] shadow-sm flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search payments by receipt #, booking ref, or guest name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-lg border border-[#E8E2D7] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-2 border-[#B79A65] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span className="text-xs text-gray-500">Loading payment ledger...</span>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No desk payments recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F5EF] border-b border-[#E8E2D7] text-[#5A4636] uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Receipt Number</th>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Collected By</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE8DC]">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#B79A65]">
                      {p.paymentNumber}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-gray-800">
                      {p.booking?.bookingNumber}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-gray-900">
                      {p.booking?.customer?.name}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-gray-100 text-gray-800 border">
                        {p.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-sm text-emerald-800">
                      ₹{p.amount.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                      {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3.5 px-4 text-gray-600">
                      {p.collectedBy?.name || 'Reception'}
                    </td>

                    <td className="py-3.5 px-4 text-gray-400 italic text-[11px]">
                      {p.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
