import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Booking, Branch, Room, BookingStatus, PaymentStatus } from '../../types';
import {
  Search,
  Filter,
  Printer,
  XCircle,
  Repeat,
  PlusCircle,
  Eye,
  Calendar,
  X,
  RefreshCw,
} from 'lucide-react';
import { InvoiceModal } from '../../components/common/InvoiceModal';

export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');

  // Modals
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null);

  // Change room modal
  const [changeRoomBooking, setChangeRoomBooking] = useState<Booking | null>(null);
  const [availableRoomsForChange, setAvailableRoomsForChange] = useState<Room[]>([]);
  const [selectedNewRoomId, setSelectedNewRoomId] = useState('');
  const [loadingRoomsForChange, setLoadingRoomsForChange] = useState(false);

  // Add charge modal
  const [chargeBooking, setChargeBooking] = useState<Booking | null>(null);
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeQty, setChargeQty] = useState(1);
  const [chargePrice, setChargePrice] = useState(0);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      if (res.data?.data) setBranches(res.data.data);
    } catch (err) {}
  };

  const fetchBookings = async (silent = false) => {
    if (!silent) {
      if (bookings.length === 0) setLoading(true);
      else setRefreshing(true);
    }
    try {
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (branchFilter !== 'ALL') params.branchId = branchFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (paymentStatusFilter !== 'ALL') params.paymentStatus = paymentStatusFilter;

      const res = await api.get('/bookings', { params });
      if (res.data?.data) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [branchFilter, statusFilter, paymentStatusFilter]);

  // Real-time polling when no modals are open
  useEffect(() => {
    const interval = setInterval(() => {
      if (!selectedInvoiceBooking && !changeRoomBooking && !chargeBooking) {
        fetchBookings(true);
      }
    }, 7000);
    return () => clearInterval(interval);
  }, [branchFilter, statusFilter, paymentStatusFilter, search, selectedInvoiceBooking, changeRoomBooking, chargeBooking]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Room availability will be released.')) return;
    try {
      await api.post(`/bookings/${id}/cancel`);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cancellation failed');
    }
  };

  // Open change room modal
  const openChangeRoomModal = async (b: Booking) => {
    setChangeRoomBooking(b);
    setSelectedNewRoomId('');
    setLoadingRoomsForChange(true);
    try {
      const res = await api.get('/rooms/search', {
        params: {
          branchId: b.branchId,
          checkInDate: b.checkInDate,
          checkOutDate: b.checkOutDate,
          guests: b.numberOfGuests,
        },
      });
      if (res.data?.data?.rooms) {
        setAvailableRoomsForChange(res.data.data.rooms);
      }
    } catch (err) {
      console.error('Failed to fetch rooms for change:', err);
    } finally {
      setLoadingRoomsForChange(false);
    }
  };

  const handleConfirmRoomChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeRoomBooking || !selectedNewRoomId) return;

    try {
      await api.post(`/bookings/${changeRoomBooking.id}/change-room`, {
        newRoomId: selectedNewRoomId,
      });
      setChangeRoomBooking(null);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Room change failed');
    }
  };

  // Open add charge modal
  const openChargeModal = (b: Booking) => {
    setChargeBooking(b);
    setChargeDesc('');
    setChargeQty(1);
    setChargePrice(0);
  };

  const handleAddCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeBooking) return;

    try {
      await api.post(`/bookings/${chargeBooking.id}/extra-charges`, {
        description: chargeDesc,
        quantity: chargeQty,
        unitPrice: chargePrice,
      });
      setChargeBooking(null);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Charge addition failed');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
            Central Reservations Ledger
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#242321]">
            All Hotel Bookings Across Branches
          </h1>
          <p className="text-xs text-gray-500">
            Monitor reservations, room allocations, desk payments, and tax invoices.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Auto-Sync</span>
          </div>

          <button
            onClick={() => fetchBookings(false)}
            disabled={refreshing || loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[#E8E2D7] rounded-lg text-xs font-medium text-gray-700 hover:bg-[#F8F5EF] transition-colors shadow-sm disabled:opacity-50"
            title="Refresh bookings"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#B79A65] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#E8E2D7] shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Booking ID, Customer Name, Phone, Email, Room Number..."
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

        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-gray-700">Branch:</span>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="p-1.5 border rounded bg-[#F8F5EF] focus:outline-none"
            >
              <option value="ALL">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-gray-700">Booking Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1.5 border rounded bg-[#F8F5EF] focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CHECKED_IN">CHECKED_IN</option>
              <option value="CHECKED_OUT">CHECKED_OUT</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="NO_SHOW">NO_SHOW</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-gray-700">Payment:</span>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="p-1.5 border rounded bg-[#F8F5EF] focus:outline-none"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="UNPAID">UNPAID</option>
              <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
              <option value="PAID">PAID</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg border border-[#E8E2D7] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-2 border-[#B79A65] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span className="text-xs text-gray-500">Loading bookings...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No bookings found matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F5EF] border-b border-[#E8E2D7] text-[#5A4636] uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Total (₹)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE8DC]">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#B79A65]">
                      {b.bookingNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">{b.customer?.name}</div>
                      <div className="text-[11px] text-gray-500">{b.customer?.phone || 'No phone'}</div>
                      <div className="text-[11px] text-gray-400">{b.customer?.email}</div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-gray-800">
                      {b.branch?.name?.split('-')[1]?.trim() || b.branch?.name}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#242321]">Room {b.room?.roomNumber}</div>
                      <div className="text-[11px] text-gray-500">{b.room?.roomType?.name}</div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-600">
                      <div>{new Date(b.checkInDate).toLocaleDateString()} - {new Date(b.checkOutDate).toLocaleDateString()}</div>
                      <div className="text-[10px] text-gray-400">({b.numberOfNights} Nights • {b.numberOfGuests} Guests)</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">₹{b.totalAmount.toLocaleString()}</div>
                      <div className="text-[11px] text-emerald-700">Paid: ₹{b.paidAmount.toLocaleString()}</div>
                      {b.balanceAmount > 0 && (
                        <div className="text-[11px] text-amber-800 font-bold">Due: ₹{b.balanceAmount.toLocaleString()}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                          b.status === 'CHECKED_IN'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'CHECKED_OUT'
                            ? 'bg-blue-100 text-blue-800'
                            : b.status === 'CONFIRMED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                          b.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.paymentStatus === 'PARTIALLY_PAID'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      {/* Change Room */}
                      {(b.status === 'CONFIRMED' || b.status === 'CHECKED_IN') && (
                        <button
                          onClick={() => openChangeRoomModal(b)}
                          className="p-1 text-gray-600 hover:text-[#B79A65]"
                          title="Change Room"
                        >
                          <Repeat className="w-4 h-4 inline" />
                        </button>
                      )}

                      {/* Add Extra Charges */}
                      {b.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => openChargeModal(b)}
                          className="p-1 text-gray-600 hover:text-[#B79A65]"
                          title="Add Extra Charges"
                        >
                          <PlusCircle className="w-4 h-4 inline" />
                        </button>
                      )}

                      {/* Cancel */}
                      {(b.status === 'CONFIRMED') && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Cancel Booking"
                        >
                          <XCircle className="w-4 h-4 inline" />
                        </button>
                      )}

                      {/* Invoice */}
                      <button
                        onClick={() => setSelectedInvoiceBooking(b)}
                        className="p-1 text-gray-600 hover:text-[#B79A65]"
                        title="Tax Invoice"
                      >
                        <Printer className="w-4 h-4 inline" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Change Room Modal */}
      {changeRoomBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4 shadow-xl text-xs animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif text-lg font-bold text-[#242321]">
                Change Room for {changeRoomBooking.bookingNumber}
              </h3>
              <button onClick={() => setChangeRoomBooking(null)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-500">
              Current: Room {changeRoomBooking.room?.roomNumber} ({changeRoomBooking.room?.roomType?.name}) at {changeRoomBooking.branch?.name}.
            </p>

            <form onSubmit={handleConfirmRoomChange} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Select Target Available Room
                </label>
                {loadingRoomsForChange ? (
                  <div className="text-gray-500 py-2">Searching available rooms...</div>
                ) : availableRoomsForChange.length === 0 ? (
                  <div className="text-red-600 py-2 font-medium">
                    No alternative rooms available in this branch for these dates.
                  </div>
                ) : (
                  <select
                    value={selectedNewRoomId}
                    onChange={(e) => setSelectedNewRoomId(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none"
                    required
                  >
                    <option value="">Select Room...</option>
                    {availableRoomsForChange.map((r) => (
                      <option key={r.id} value={r.id}>
                        Room {r.roomNumber} - {r.roomType?.name} (₹{r.pricePerNight}/night)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setChangeRoomBooking(null)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedNewRoomId}
                  className="px-5 py-2 bg-[#242321] text-white uppercase tracking-wider font-semibold rounded hover:bg-[#B79A65] transition-colors"
                >
                  Confirm Room Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Extra Charges Modal */}
      {chargeBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4 shadow-xl text-xs animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif text-lg font-bold text-[#242321]">
                Add Extra Charge
              </h3>
              <button onClick={() => setChargeBooking(null)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCharge} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={chargeDesc}
                  onChange={(e) => setChargeDesc(e.target.value)}
                  placeholder="e.g. Airport Chauffeur Service"
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={chargeQty}
                    onChange={(e) => setChargeQty(parseInt(e.target.value, 10) || 1)}
                    className="w-full p-2 border rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={chargePrice}
                    onChange={(e) => setChargePrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setChargeBooking(null)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={chargePrice <= 0}
                  className="px-5 py-2 bg-[#242321] text-white uppercase tracking-wider font-semibold rounded hover:bg-[#B79A65] transition-colors"
                >
                  Add Charge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoiceBooking && (
        <InvoiceModal
          booking={selectedInvoiceBooking}
          isOpen={!!selectedInvoiceBooking}
          onClose={() => setSelectedInvoiceBooking(null)}
        />
      )}

    </div>
  );
};
