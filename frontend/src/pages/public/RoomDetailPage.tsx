import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Room, Booking } from '../../types';
import {
  Calendar,
  Users,
  Bed,
  Check,
  Tag,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
  Printer,
} from 'lucide-react';
import { InvoiceModal } from '../../components/common/InvoiceModal';

export const RoomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  const [checkIn, setCheckIn] = useState(() => {
    const fromParam = searchParams.get('checkIn');
    if (fromParam) return fromParam;
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  const [checkOut, setCheckOut] = useState(() => {
    const fromParam = searchParams.get('checkOut');
    if (fromParam) return fromParam;
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });
  const [guests, setGuests] = useState(parseInt(searchParams.get('guests') || '2', 10));

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Guest details form state
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [idType, setIdType] = useState('Aadhaar Card');
  const [idNumber, setIdNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      if (!guestName) setGuestName(user.name);
      if (!guestEmail) setGuestEmail(user.email);
      if (!guestPhone && user.phone) setGuestPhone(user.phone);
    }
  }, [user]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${id}`);
        if (res.data?.data) {
          setRoom(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load room:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRoom();
  }, [id]);

  // Price calculations
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.max(
    1,
    Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  const pricePerNight = room?.pricePerNight || 0;
  const roomCharges = pricePerNight * nights;

  let discount = 0;
  if (appliedCoupon) {
    discount = appliedCoupon.calculatedDiscount;
  }

  const taxableAmount = Math.max(0, roomCharges - discount);
  const taxAmount = Math.round(taxableAmount * 0.12 * 100) / 100;
  const grandTotal = Math.round((taxableAmount + taxAmount) * 100) / 100;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || !room) return;
    setValidatingCoupon(true);
    setCouponError('');
    try {
      const res = await api.post('/offers/validate', {
        code: couponCode.trim(),
        branchId: room.branchId,
        amount: roomCharges,
      });
      if (res.data?.success && res.data?.data) {
        setAppliedCoupon(res.data.data);
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;

    if (!isAuthenticated) {
      navigate(`/login?redirect=/rooms/${room.id}`);
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.post('/bookings', {
        branchId: room.branchId,
        roomId: room.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests: guests,
        specialRequests,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        guestName,
        guestEmail,
        guestPhone,
        idType,
        idNumber,
      });

      if (res.data?.success && res.data?.data) {
        setConfirmedBooking(res.data.data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to complete reservation. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#B79A65] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <h2 className="font-serif text-2xl font-bold">Room Not Found</h2>
        <Link to="/rooms" className="mt-4 inline-block text-xs uppercase tracking-widest text-[#B79A65]">
          Back to all rooms
        </Link>
      </div>
    );
  }

  // Booking Confirmation View
  if (confirmedBooking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-8 animate-fadeIn">
        <div className="bg-white rounded-lg border border-[#EFE8DC] p-8 sm:p-12 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
              Reservation Confirmed
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#242321]">
              PAYMENT AT HOTEL
            </h1>
            <p className="text-sm text-[#5A4636] max-w-lg mx-auto">
              Your reservation is confirmed. Payment will be collected at the House of Dreams reception desk upon check-in or checkout.
            </p>
          </div>

          {/* Booking Summary Box */}
          <div className="bg-[#F8F5EF] p-6 rounded-lg border border-[#EFE8DC] text-left text-xs space-y-3">
            <div className="flex justify-between border-b border-[#EFE8DC] pb-2">
              <span className="text-gray-500">Booking Reference:</span>
              <span className="font-mono font-bold text-sm text-[#242321]">{confirmedBooking.bookingNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Branch:</span>
              <span className="font-semibold text-[#242321]">{room.branch?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Room:</span>
              <span>Room {room.roomNumber} ({room.roomType?.name})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Stay Dates:</span>
              <span>{new Date(checkIn).toLocaleDateString()} to {new Date(checkOut).toLocaleDateString()} ({nights} Nights)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Guests:</span>
              <span>{guests} Guests ({guestName})</span>
            </div>
            <div className="flex justify-between border-t border-[#EFE8DC] pt-2 font-bold text-sm">
              <span>Total Amount:</span>
              <span>₹{grandTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-amber-800 font-semibold">
              <span>Payment Status:</span>
              <span>UNPAID (Pay at Desk via Cash, Card, or UPI)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#B79A65] text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#9F824F] transition-colors flex items-center justify-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>View / Print Invoice</span>
            </button>
            <Link
              to="/customer/bookings"
              className="w-full sm:w-auto px-6 py-2.5 bg-[#242321] text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#5A4636] transition-colors flex items-center justify-center space-x-2"
            >
              <span>Go to My Bookings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Invoice Modal */}
        <InvoiceModal
          booking={{
            ...confirmedBooking,
            room,
            branch: room.branch!,
            customer: user || { id: '', name: guestName, email: guestEmail },
          }}
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
        />
      </div>
    );
  }

  let images: string[] = [];
  try {
    images = JSON.parse(room.images || '[]');
  } catch {
    images = [];
  }
  const coverImage = images[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Breadcrumb */}
      <div className="text-xs text-[#766F66] flex items-center space-x-2">
        <Link to="/rooms" className="hover:text-[#B79A65]">Rooms</Link>
        <span>/</span>
        <span className="text-[#242321] font-medium">{room.branch?.name}</span>
        <span>/</span>
        <span className="text-[#B79A65] font-semibold">Room {room.roomNumber}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left 2 Cols: Gallery, Details, Amenities */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Photo & Gallery */}
          <div className="space-y-3">
            <div className="h-80 sm:h-[450px] rounded-lg overflow-hidden shadow-sm">
              <img
                src={coverImage}
                alt={`Room ${room.roomNumber}`}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {images.slice(0, 3).map((img, i) => (
                  <div key={i} className="h-28 rounded-md overflow-hidden shadow-sm">
                    <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Room Header & Description */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EFE8DC] pb-4">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
                  {room.branch?.city} • Floor {room.floor}
                </span>
                <h1 className="font-serif text-3xl font-bold text-[#242321]">
                  {room.roomType?.name} (Room {room.roomNumber})
                </h1>
              </div>
              <div className="mt-3 sm:mt-0 text-left sm:text-right">
                <span className="text-xs text-[#766F66] block">Nightly Tariff</span>
                <span className="font-bold text-2xl text-[#242321]">
                  ₹{room.pricePerNight.toLocaleString()}
                </span>
                <span className="text-[11px] text-gray-400 block">+12% GST</span>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-xs text-[#5A4636]">
              <div className="flex items-center space-x-1.5">
                <Bed className="w-4 h-4 text-[#B79A65]" />
                <span>{room.roomType?.bedType || 'King Bed'}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-[#B79A65]" />
                <span>Up to {room.capacity} Guests</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-[#B79A65]" />
                <span>Check-in: {room.branch?.checkInTime || '14:00'}</span>
              </div>
            </div>

            <p className="text-sm text-[#5A4636] leading-relaxed pt-2">
              {room.description || room.roomType?.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="space-y-4 pt-4 border-t border-[#EFE8DC]">
            <h3 className="font-serif text-xl font-bold text-[#242321]">
              Room Comforts & Amenities
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {room.roomAmenities && room.roomAmenities.map((ra) => (
                <div
                  key={ra.id}
                  className="flex items-center space-x-2 p-3 bg-white rounded border border-[#EFE8DC] text-xs text-[#5A4636]"
                >
                  <Check className="w-4 h-4 text-[#B79A65] flex-shrink-0" />
                  <span>{ra.amenity.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Desk Payment Guarantee Notice */}
          <div className="bg-[#EFE8DC]/50 p-6 rounded-lg border border-[#EFE8DC] space-y-2">
            <div className="flex items-center space-x-2 text-sm font-semibold text-[#242321]">
              <ShieldCheck className="w-5 h-5 text-[#B79A65]" />
              <span>Desk Payment Guarantee</span>
            </div>
            <p className="text-xs text-[#766F66] leading-relaxed">
              We do not collect payments online. Reserving online holds your room immediately.
              You will settle your charges physically upon arrival or checkout at the House of Dreams reception desk using Cash, POS Card, or UPI QR code.
            </p>
          </div>

        </div>

        {/* Right 1 Col: Reservation & Price Quote Widget */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-[#EFE8DC] p-6 shadow-lg sticky top-28 space-y-6">
            
            <div>
              <h3 className="font-serif text-xl font-bold text-[#242321]">
                Reserve This Room
              </h3>
              <p className="text-xs text-[#766F66]">
                Instant reservation • Settle at front desk
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              
              {/* Dates */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                  Number of Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                  className="w-full px-2.5 py-1.5 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
                >
                  {[...Array(room.capacity)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Guest{i > 0 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Guest Information */}
              <div className="pt-2 border-t border-[#EFE8DC] space-y-3">
                <span className="block text-[10px] uppercase tracking-wider font-bold text-[#5A4636]">
                  Primary Guest Information
                </span>

                <div>
                  <input
                    type="text"
                    placeholder="Full Legal Name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    placeholder="10-digit Phone"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Voter ID">Voter ID</option>
                  </select>
                  <input
                    type="text"
                    placeholder="ID Document No."
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <textarea
                    placeholder="Special requests (optional: e.g. late check-in, ground floor)"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={2}
                    className="w-full px-2.5 py-1.5 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Coupon input */}
              <div className="pt-2 border-t border-[#EFE8DC] space-y-1">
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#5A4636]">
                  Offer / Coupon Code
                </label>
                <div className="flex space-x-1.5">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-2.5 py-1.5 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs font-mono uppercase focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="px-3 py-1.5 bg-[#242321] text-white text-[11px] font-semibold rounded hover:bg-[#B79A65] transition-colors disabled:opacity-50"
                  >
                    {validatingCoupon ? 'Checking...' : 'Apply'}
                  </button>
                </div>
                {appliedCoupon && (
                  <span className="text-[11px] text-emerald-700 font-medium block">
                    ✓ Applied: {appliedCoupon.description} (-₹{appliedCoupon.calculatedDiscount})
                  </span>
                )}
                {couponError && (
                  <span className="text-[11px] text-red-600 block">
                    {couponError}
                  </span>
                )}
              </div>

              {/* Price Calculation Summary */}
              <div className="pt-3 border-t border-[#EFE8DC] space-y-2 text-xs">
                <div className="flex justify-between text-[#766F66]">
                  <span>Room Charges ({nights} Night{nights > 1 ? 's' : ''}):</span>
                  <span>₹{roomCharges.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon Discount:</span>
                    <span>- ₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#766F66]">
                  <span>GST Tax (12%):</span>
                  <span>₹{taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#242321] pt-2 border-t border-[#EFE8DC]">
                  <span>Total Amount Due:</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
                <div className="text-[11px] text-emerald-800 font-semibold text-center pt-1">
                  Payment will be collected at reception desk.
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#242321] text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#B79A65] transition-all shadow-md disabled:opacity-50"
              >
                {submitting ? 'Confirming Reservation...' : 'CONFIRM RESERVATION'}
              </button>

              {!isAuthenticated && (
                <p className="text-[11px] text-center text-[#766F66]">
                  You will be prompted to sign in or register before confirming.
                </p>
              )}

            </form>

          </div>
        </div>

      </div>

    </div>
  );
};
