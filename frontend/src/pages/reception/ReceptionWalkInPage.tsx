import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Room } from '../../types';
import {
  UserPlus,
  Calendar,
  BedDouble,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const ReceptionWalkInPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedRoomId = (location.state as any)?.roomId;

  const [checkIn, setCheckIn] = useState(() => new Date().toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [guests, setGuests] = useState(2);

  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState(preselectedRoomId || '');
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Guest Details
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [idType, setIdType] = useState('Aadhaar Card');
  const [idNumber, setIdNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Advance Payment
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI' | 'OTHER'>('CASH');
  const [paymentNotes, setPaymentNotes] = useState('Advance payment collected at reception desk');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successBooking, setSuccessBooking] = useState<any>(null);

  // Load available rooms for current branch
  const fetchAvailableRooms = async () => {
    if (!user?.branchId) return;
    setLoadingRooms(true);
    try {
      const res = await api.get('/rooms/search', {
        params: {
          branchId: user.branchId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          guests,
        },
      });
      if (res.data?.data?.rooms) {
        const rooms = res.data.data.rooms;
        setAvailableRooms(rooms);
        if (preselectedRoomId && rooms.some((r: any) => r.id === preselectedRoomId)) {
          setSelectedRoomId(preselectedRoomId);
        } else if (rooms.length > 0 && !selectedRoomId) {
          setSelectedRoomId(rooms[0].id);
        } else if (rooms.length === 0) {
          setSelectedRoomId('');
        }
      }
    } catch (err: any) {
      console.error('Failed to load available rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchAvailableRooms();
  }, [checkIn, checkOut, guests, user?.branchId]);

  const selectedRoom = availableRooms.find((r) => r.id === selectedRoomId);

  // Nights calculation
  const nights = Math.max(
    1,
    Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
  );
  const roomCharges = selectedRoom ? selectedRoom.pricePerNight * nights : 0;
  const tax = Math.round(roomCharges * 0.12 * 100) / 100;
  const total = roomCharges + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) {
      setError('Please select an available room.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/bookings/walk-in', {
        branchId: user?.branchId,
        roomId: selectedRoomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests: guests,
        guestName,
        guestEmail: guestEmail || undefined,
        guestPhone,
        idType,
        idNumber,
        specialRequests,
        advancePaymentAmount: advanceAmount > 0 ? advanceAmount : undefined,
        paymentMethod: advanceAmount > 0 ? paymentMethod : undefined,
        paymentNotes: advanceAmount > 0 ? paymentNotes : undefined,
      });

      if (res.data?.success && res.data?.data) {
        setSuccessBooking(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create walk-in booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImmediateCheckIn = async () => {
    if (!successBooking) return;
    try {
      await api.post(`/bookings/${successBooking.id}/check-in`);
      navigate('/reception/bookings');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-in failed');
    }
  };

  if (successBooking) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg border border-[#E8E2D7] shadow-lg text-center space-y-6">
        <CheckCircle className="w-12 h-12 text-emerald-700 mx-auto" />
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider text-[#B79A65] font-semibold">Walk-in Confirmed</span>
          <h2 className="font-serif text-2xl font-bold text-[#242321]">
            Booking {successBooking.bookingNumber} Created
          </h2>
          <p className="text-xs text-gray-500">
            Guest {guestName} registered for Room {selectedRoom?.roomNumber}.
          </p>
        </div>

        <div className="bg-[#F8F5EF] p-4 rounded text-left text-xs space-y-2 border border-[#EFE8DC]">
          <div className="flex justify-between">
            <span className="text-gray-500">Total Booking Amount:</span>
            <span className="font-bold">₹{successBooking.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Paid at Desk:</span>
            <span className="text-emerald-700 font-bold">₹{successBooking.paidAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Balance Outstanding:</span>
            <span className="text-amber-800 font-bold">₹{successBooking.balanceAmount.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleImmediateCheckIn}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-800 text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-emerald-900 transition-colors shadow-sm"
          >
            Check In Guest Now
          </button>
          <button
            onClick={() => navigate('/reception/bookings')}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#242321] text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#B79A65] transition-colors"
          >
            Go to Bookings List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
          Front Desk Concierge
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#242321]">
          New Walk-in Reservation
        </h1>
        <p className="text-xs text-gray-500">
          Create reservation for guests who have arrived physically at {user?.branch?.name}.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Stay Dates & Room Selection */}
        <div className="bg-white p-6 rounded-lg border border-[#E8E2D7] shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-[#242321] flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#B79A65]" />
            <span>1. Dates & Room Assignment</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                Check-in Date
              </label>
              <input
                type="date"
                required
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full p-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                Check-out Date
              </label>
              <input
                type="date"
                required
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full p-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                Number of Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                className="w-full p-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5+ Guests</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
              Select Available Room ({availableRooms.length} available)
            </label>
            {loadingRooms ? (
              <div className="text-xs text-gray-500 py-2">Checking available rooms...</div>
            ) : availableRooms.length === 0 ? (
              <div className="text-xs text-red-600 py-2 font-medium">
                No rooms available for these dates.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableRooms.map((r) => {
                  const isSelected = selectedRoomId === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRoomId(r.id)}
                      className={`p-3 rounded border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#B79A65] bg-[#F8F5EF] ring-1 ring-[#B79A65]'
                          : 'border-[#EFE8DC] hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm text-[#242321]">Room {r.roomNumber}</span>
                        <span className="text-[11px] font-semibold text-emerald-800">₹{r.pricePerNight}/night</span>
                      </div>
                      <span className="text-xs text-gray-600 block">{r.roomType?.name}</span>
                      <span className="text-[10px] text-gray-400 block">Floor {r.floor} • Capacity {r.capacity}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Guest Information & Verification */}
        <div className="bg-white p-6 rounded-lg border border-[#E8E2D7] shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-[#242321] flex items-center space-x-2">
            <UserPlus className="w-4 h-4 text-[#B79A65]" />
            <span>2. Guest Identification & Contact</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                Guest Full Name
              </label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Full name as per ID"
                className="w-full p-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="+91 98201 12345"
                className="w-full p-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="guest@example.com"
                className="w-full p-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                Government ID Type
              </label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="w-full p-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
              >
                <option value="Aadhaar Card">Aadhaar Card</option>
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
                <option value="Voter ID">Voter ID</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                ID Document Number
              </label>
              <input
                type="text"
                required
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="e.g. 1234-5678-9012"
                className="w-full p-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
              Special Requests / Reception Notes
            </label>
            <input
              type="text"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g. Extra blanket, late departure request"
              className="w-full p-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
            />
          </div>
        </div>

        {/* Step 3: Desk Payment Collection */}
        <div className="bg-white p-6 rounded-lg border border-[#E8E2D7] shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-[#242321] flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-[#B79A65]" />
            <span>3. Physical Desk Payment Record</span>
          </h3>

          <div className="bg-[#F8F5EF] p-4 rounded border border-[#EFE8DC] text-xs space-y-1">
            <div className="flex justify-between text-gray-600">
              <span>Room Charges ({nights} Night{nights > 1 ? 's' : ''}):</span>
              <span>₹{roomCharges.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST (12%):</span>
              <span>₹{tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-[#242321] pt-1 border-t border-[#EFE8DC]">
              <span>Total Stay Tariff:</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                Advance Amount Collected (₹)
              </label>
              <input
                type="number"
                min="0"
                max={total}
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full p-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
              />
              <span className="text-[10px] text-gray-400 block mt-0.5">
                Leave 0 if payment will be collected at checkout.
              </span>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full p-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
              >
                <option value="CASH">CASH</option>
                <option value="CARD">POS CARD</option>
                <option value="UPI">UPI QR CODE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                Payment Reference / Note
              </label>
              <input
                type="text"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="w-full p-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || availableRooms.length === 0}
            className="px-8 py-3 bg-[#242321] text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#B79A65] transition-colors disabled:opacity-50 flex items-center space-x-2 shadow-md"
          >
            <span>{submitting ? 'Creating Walk-in...' : 'CONFIRM WALK-IN RESERVATION'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>
    </div>
  );
};
