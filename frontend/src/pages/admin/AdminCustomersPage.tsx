import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, User, Calendar, Eye, X } from 'lucide-react';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected customer for history modal
  const [historyCustomer, setHistoryCustomer] = useState<any | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers', {
        params: { search: search.trim() || undefined },
      });
      if (res.data?.data) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
          Guest Profiles & Loyalty
        </span>
        <h1 className="font-serif text-2xl font-bold text-[#242321]">
          Customer Directory & Stay Histories
        </h1>
        <p className="text-xs text-gray-500">
          View guest lifetime stays, spending analytics, and previous reservations. Passwords are encrypted and secure.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg border border-[#E8E2D7] shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, email address, or phone number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-[#242321] text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#B79A65] transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#E8E2D7] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-2 border-[#B79A65] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span className="text-xs text-gray-500">Loading customer profiles...</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No customers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F5EF] border-b border-[#E8E2D7] text-[#5A4636] uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Total Bookings</th>
                  <th className="py-3 px-4">Completed Stays</th>
                  <th className="py-3 px-4">Cancellations</th>
                  <th className="py-3 px-4">Lifetime Spend</th>
                  <th className="py-3 px-4">Last Stay</th>
                  <th className="py-3 px-4 text-right">History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE8DC]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {c.name}
                    </td>

                    <td className="py-3.5 px-4">
                      <div>{c.email}</div>
                      <div className="text-[11px] text-gray-400">{c.phone || 'No phone'}</div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-gray-800">
                      {c.totalBookings}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-800">
                      {c.completedStays}
                    </td>

                    <td className="py-3.5 px-4 text-gray-500">
                      {c.cancelledBookings}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      ₹{c.totalSpending.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-gray-600">
                      {c.lastStay ? new Date(c.lastStay).toLocaleDateString() : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setHistoryCustomer(c)}
                        className="px-2.5 py-1 bg-[#F8F5EF] border border-[#EFE8DC] text-[#242321] rounded text-[11px] font-semibold hover:bg-[#B79A65] hover:text-white transition-colors flex items-center space-x-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Bookings</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Booking History Modal */}
      {historyCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full space-y-4 shadow-xl text-xs max-h-[85vh] overflow-y-auto animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#242321]">
                  Booking History: {historyCustomer.name}
                </h3>
                <span className="text-gray-400">{historyCustomer.email} • {historyCustomer.phone}</span>
              </div>
              <button onClick={() => setHistoryCustomer(null)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {historyCustomer.bookings && historyCustomer.bookings.length > 0 ? (
                historyCustomer.bookings.map((b: any) => (
                  <div key={b.id} className="p-3 bg-[#F8F5EF] rounded border border-[#EFE8DC] flex justify-between items-center text-xs">
                    <div>
                      <div className="font-mono font-bold text-[#B79A65]">{b.bookingNumber}</div>
                      <div className="text-gray-600 font-medium">{b.branch?.name} ({b.branch?.city})</div>
                      <div className="text-[11px] text-gray-500">
                        {new Date(b.checkInDate).toLocaleDateString()} - {new Date(b.checkOutDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.status === 'CHECKED_OUT' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {b.status}
                      </span>
                      <div className="font-bold text-gray-900 mt-1">₹{b.totalAmount.toLocaleString()}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No bookings found for this customer.</p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setHistoryCustomer(null)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
