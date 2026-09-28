import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Booking, BookingStatus, PaymentMethod } from '../../types';
import {
  Search,
  CheckCircle,
  LogOut as CheckOutIcon,
  CreditCard,
  PlusCircle,
  Printer,
  Calendar,
  Phone,
  User,
  X,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { InvoiceModal } from '../../components/common/InvoiceModal';

export const ReceptionBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null);

  // Collect Payment Modal
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [recordingPayment, setRecordingPayment] = useState(false);

  // Extra Charges Modal
  const [chargeBooking, setChargeBooking] = useState<Booking | null>(null);
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeQty, setChargeQty] = useState(1);
  const [chargeRate, setChargeRate] = useState<number>(0);
  const [addingCharge, setAddingCharge] = useState(false);

  const fetchBookings = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setIsRefreshing(true);

    try {
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await api.get('/bookings', { params });
      if (res.data?.data) {
        setBookings(res.data.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings(false);

    // Live background polling every 6 seconds if no modal is actively open
    const timer = setInterval(() => {
      if (!paymentBooking && !chargeBooking && !selectedInvoiceBooking) {
        fetchBookings(true);
      }
    }, 6000);

    return () => clearInterval(timer);
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  // Check-in action
  const handleCheckIn = async (booking: Booking) => {
    if (!window.confirm(`Check in guest ${booking.customer.name} into Room ${booking.room?.roomNumber}?`)) return;
    try {
      await api.post(`/bookings/${booking.id}/check-in`);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-in failed');
    }
  };

  // Check-out action
  const handleCheckOut = async (booking: Booking) => {
    if (booking.balanceAmount > 0) {
      alert(`Guest has an outstanding balance of ₹${booking.balanceAmount.toLocaleString()}. Please collect payment before checkout.`);
      openPaymentModal(booking);
      return;
    }

    if (!window.confirm(`Check out guest ${booking.customer.name} from Room ${booking.room?.roomNumber}? Room will be marked for CLEANING.`)) return;
    try {
      await api.post(`/bookings/${booking.id}/check-out`);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-out failed');
    }
  };

  // Open Payment modal
  const openPaymentModal = (b: Booking) => {
    setPaymentBooking(b);
    setPaymentAmount(b.balanceAmount);
    setPaymentMethod('CASH');
    setPaymentNotes('Desk settlement at front desk');
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentBooking) return;
    setRecordingPayment(true);

    try {
      await api.post('/payments/record-desk', {
        bookingId: paymentBooking.id,
        amount: paymentAmount,
        paymentMethod,
        notes: paymentNotes,
      });
      setPaymentBooking(null);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment recording failed');
    } finally {
      setRecordingPayment(false);
    }
  };

  // Open Extra Charge modal
  const openChargeModal = (b: Booking) => {
    setChargeBooking(b);
    setChargeDesc('');
    setChargeQty(1);
    setChargeRate(0);
  };

  const handleAddCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeBooking) return;
    setAddingCharge(true);

    try {
      await api.post(`/bookings/${chargeBooking.id}/extra-charges`, {
        description: chargeDesc,
        quantity: chargeQty,
        unitPrice: chargeRate,
      });
      setChargeBooking(null);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add charge');
    } finally {
      setAddingCharge(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
            Front Desk Station • {user?.branch?.name}
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#242321]">
            Guest Bookings & Stay Management
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            Live Updates Active
          </span>
          <button
            onClick={() => fetchBookings(true)}
            disabled={isRefreshing}
            className="p-1 text-gray-500 hover:text-black transition-colors rounded hover:bg-gray-100"
            title="Refresh Bookings Now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#B79A65]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#E8E2D7] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <form onSubmit={handleSearchSubmit} className="flex-1 flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Guest Name, Phone, Email, Room or Booking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#242321] text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#B79A65] transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED (Expected)</option>
            <option value="CHECKED_IN">CHECKED_IN (In-house)</option>
            <option value="CHECKED_OUT">CHECKED_OUT (Departed)</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg border border-[#E8E2D7] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
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
                  <th className="py-3 px-4">Guest Details</th>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Desk Payment</th>
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
                      <div className="text-[11px] text-gray-500">{b.customer?.phone || b.guests?.[0]?.phone || 'No phone'}</div>
                      <div className="text-[11px] text-gray-400">{b.customer?.email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#242321]">Room {b.room?.roomNumber}</div>
                      <div className="text-[11px] text-gray-500">{b.room?.roomType?.name}</div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-600">
                      <div>In: {new Date(b.checkInDate).toLocaleDateString()}</div>
                      <div>Out: {new Date(b.checkOutDate).toLocaleDateString()}</div>
                      <div className="text-[10px] text-gray-400">({b.numberOfNights} Nights)</div>
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
                      <div className="font-semibold text-gray-900">Total: ₹{b.totalAmount.toLocaleString()}</div>
                      <div className="text-[11px] text-emerald-700">Paid: ₹{b.paidAmount.toLocaleString()}</div>
                      <div className={`text-[11px] font-bold ${b.balanceAmount > 0 ? 'text-amber-800' : 'text-gray-500'}`}>
                        Due: ₹{b.balanceAmount.toLocaleString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      {/* Check In */}
                      {b.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleCheckIn(b)}
                          className="px-2.5 py-1 bg-emerald-800 text-white rounded text-[11px] font-semibold hover:bg-emerald-900 transition-colors"
                        >
                          Check In
                        </button>
                      )}

                      {/* Check Out */}
                      {b.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => handleCheckOut(b)}
                          className="px-2.5 py-1 bg-amber-800 text-white rounded text-[11px] font-semibold hover:bg-amber-900 transition-colors"
                        >
                          Check Out
                        </button>
                      )}

                      {/* Collect Payment */}
                      {b.balanceAmount > 0 && b.status !== 'CANCELLED' && (
                        <button
                          onClick={() => openPaymentModal(b)}
                          className="px-2.5 py-1 bg-[#242321] text-white rounded text-[11px] font-semibold hover:bg-[#B79A65] transition-colors"
                          title="Record desk payment"
                        >
                          Collect ₹
                        </button>
                      )}

                      {/* Add Charges */}
                      {b.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => openChargeModal(b)}
                          className="px-2.5 py-1 bg-[#F8F5EF] border border-[#EFE8DC] text-[#5A4636] rounded text-[11px] font-semibold hover:bg-[#EFE8DC] transition-colors"
                          title="Add room service / laundry charge"
                        >
                          + Charge
                        </button>
                      )}

                      {/* Invoice */}
                      <button
                        onClick={() => setSelectedInvoiceBooking(b)}
                        className="p-1 text-gray-500 hover:text-[#B79A65] transition-colors"
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

      {/* Collect Payment Modal */}
      {paymentBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4 shadow-xl animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif text-lg font-bold text-[#242321]">
                Record Desk Payment
              </h3>
              <button onClick={() => setPaymentBooking(null)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F8F5EF] p-3 rounded text-xs space-y-1">
              <p><span className="text-gray-500">Booking:</span> <strong>{paymentBooking.bookingNumber}</strong> ({paymentBooking.customer?.name})</p>
              <p><span className="text-gray-500">Total Tariff:</span> ₹{paymentBooking.totalAmount.toLocaleString()}</p>
              <p><span className="text-gray-500">Already Paid:</span> ₹{paymentBooking.paidAmount.toLocaleString()}</p>
              <p><span className="text-gray-500">Current Balance:</span> <strong className="text-amber-800 font-bold">₹{paymentBooking.balanceAmount.toLocaleString()}</strong></p>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                  Amount Being Collected (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={paymentBooking.balanceAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border rounded focus:outline-none font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full p-2 border rounded focus:outline-none"
                >
                  <option value="CASH">CASH</option>
                  <option value="CARD">POS CARD</option>
                  <option value="UPI">UPI QR CODE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Received at check-in desk"
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setPaymentBooking(null)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingPayment || paymentAmount <= 0}
                  className="px-5 py-2 bg-[#242321] text-white uppercase tracking-wider font-semibold rounded hover:bg-[#B79A65] transition-colors"
                >
                  {recordingPayment ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Extra Charge Modal */}
      {chargeBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4 shadow-xl animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif text-lg font-bold text-[#242321]">
                Add Extra Service Charge
              </h3>
              <button onClick={() => setChargeBooking(null)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Add food, room service, laundry, or extra amenities for Room {chargeBooking.room?.roomNumber}.
            </p>

            <form onSubmit={handleAddCharge} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                  Item Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. In-Room Breakfast & Coffee"
                  value={chargeDesc}
                  onChange={(e) => setChargeDesc(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                    Quantity
                  </label>
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
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                    Unit Price (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={chargeRate}
                    onChange={(e) => setChargeRate(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#F8F5EF] rounded font-bold text-xs flex justify-between">
                <span>Total Charge (before tax):</span>
                <span>₹{(chargeQty * chargeRate).toLocaleString()}</span>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setChargeBooking(null)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingCharge || chargeRate <= 0}
                  className="px-5 py-2 bg-[#242321] text-white uppercase tracking-wider font-semibold rounded hover:bg-[#B79A65] transition-colors"
                >
                  {addingCharge ? 'Adding...' : 'Add Charge'}
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
