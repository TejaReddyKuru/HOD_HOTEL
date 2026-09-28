import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Booking, BookingStatus } from '../../types';
import {
  Calendar,
  MapPin,
  Clock,
  Printer,
  XCircle,
  Star,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { InvoiceModal } from '../../components/common/InvoiceModal';

export const CustomerBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'CURRENT' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');
  
  // Selected booking for invoice modal
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState<Booking | null>(null);

  // Review modal state
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings');
      if (res.data?.data) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you wish to cancel this reservation?')) return;
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      alert('Reservation cancelled successfully.');
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cancellation failed.');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        branchId: reviewBooking.branchId,
        roomId: reviewBooking.roomId,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewMessage('Thank you for sharing your experience!');
      setTimeout(() => {
        setReviewBooking(null);
        setReviewComment('');
        setReviewMessage('');
      }, 2000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'UPCOMING') return b.status === 'CONFIRMED';
    if (activeTab === 'CURRENT') return b.status === 'CHECKED_IN';
    if (activeTab === 'COMPLETED') return b.status === 'CHECKED_OUT';
    if (activeTab === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Title */}
      <div>
        <span className="text-xs uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
          Guest Portal
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#242321]">
          My Reservations & Stays
        </h1>
        <p className="text-xs sm:text-sm text-[#766F66]">
          View your confirmed stays, desk payment balances, download tax invoices, or submit verified reviews.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#EFE8DC] space-x-6 text-xs uppercase tracking-wider font-semibold">
        {(['UPCOMING', 'CURRENT', 'COMPLETED', 'CANCELLED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-[#B79A65] text-[#242321] font-bold'
                : 'border-transparent text-[#766F66] hover:text-[#242321]'
            }`}
          >
            {tab.toLowerCase()} ({bookings.filter((b) => {
              if (tab === 'UPCOMING') return b.status === 'CONFIRMED';
              if (tab === 'CURRENT') return b.status === 'CHECKED_IN';
              if (tab === 'COMPLETED') return b.status === 'CHECKED_OUT';
              if (tab === 'CANCELLED') return b.status === 'CANCELLED';
              return false;
            }).length})
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-[#B79A65] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-xs text-[#766F66]">Loading your reservations...</span>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#EFE8DC] p-12 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-[#B79A65] mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#242321]">
            No {activeTab.toLowerCase()} bookings found
          </h3>
          <p className="text-xs text-[#766F66]">
            Looking for your next peaceful getaway? Browse our rooms across India.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-lg border border-[#EFE8DC] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Left Details */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#B79A65] bg-[#F8F5EF] px-2 py-0.5 rounded border border-[#EFE8DC]">
                    {b.bookingNumber}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      b.status === 'CHECKED_IN'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.status === 'CHECKED_OUT'
                        ? 'bg-blue-100 text-blue-800'
                        : b.status === 'CONFIRMED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {b.status}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      b.paymentStatus === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.paymentStatus === 'PARTIALLY_PAID'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Desk Payment: {b.paymentStatus}
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-[#242321]">
                  Room {b.room?.roomNumber} • {b.room?.roomType?.name}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#5A4636]">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-[#B79A65]" />
                    <span>{b.branch?.name} ({b.branch?.city})</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-[#B79A65]" />
                    <span>
                      {new Date(b.checkInDate).toLocaleDateString()} – {new Date(b.checkOutDate).toLocaleDateString()} ({b.numberOfNights} Nights)
                    </span>
                  </div>
                </div>

                {b.balanceAmount > 0 && (
                  <p className="text-xs text-amber-800 font-medium pt-1">
                    Outstanding desk balance: ₹{b.balanceAmount.toLocaleString()} (settled at reception desk)
                  </p>
                )}
              </div>

              {/* Right Side: Total & Actions */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3">
                <div className="text-left md:text-right">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 block">Total Tariff</span>
                  <span className="font-bold text-lg text-[#242321]">
                    ₹{b.totalAmount.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-gray-500 block">
                    Paid: ₹{b.paidAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedBookingForInvoice(b)}
                    className="px-3 py-1.5 bg-[#F8F5EF] border border-[#EFE8DC] text-[#242321] text-xs rounded hover:bg-[#EFE8DC] transition-colors flex items-center space-x-1"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#B79A65]" />
                    <span>Invoice</span>
                  </button>

                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="px-3 py-1.5 border border-red-200 text-red-700 text-xs rounded hover:bg-red-50 transition-colors flex items-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}

                  {b.status === 'CHECKED_OUT' && (
                    <button
                      onClick={() => setReviewBooking(b)}
                      className="px-3 py-1.5 bg-[#B79A65] text-white text-xs rounded hover:bg-[#9F824F] transition-colors flex items-center space-x-1 font-medium"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>Write Review</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Modal */}
      {selectedBookingForInvoice && (
        <InvoiceModal
          booking={selectedBookingForInvoice}
          isOpen={!!selectedBookingForInvoice}
          onClose={() => setSelectedBookingForInvoice(null)}
        />
      )}

      {/* Review Modal for Completed Stays */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-serif text-xl font-bold text-[#242321]">
              Share Your Experience
            </h3>
            <p className="text-xs text-[#766F66]">
              Verified review for your completed stay at {reviewBooking.branch?.name}.
            </p>

            {reviewMessage ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded text-center font-medium">
                {reviewMessage}
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5A4636] mb-1">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating
                              ? 'text-[#B79A65] fill-[#B79A65]'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4636] mb-1">
                    Your Thoughts & Memories
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell future guests about your stay, tranquility, and front desk hospitality..."
                    className="w-full p-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewBooking(null)}
                    className="px-4 py-2 border border-gray-200 text-xs rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-4 py-2 bg-[#242321] text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#B79A65] transition-colors"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
