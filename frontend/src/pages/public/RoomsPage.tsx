import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Branch, Room } from '../../types';
import {
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  Sparkles,
  Bed,
  Check,
  ShieldCheck,
} from 'lucide-react';

export const RoomsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const branchParam = searchParams.get('branchId') || '';
  const checkInParam = searchParams.get('checkIn') || '';
  const checkOutParam = searchParams.get('checkOut') || '';
  const guestsParam = searchParams.get('guests') || '2';

  // Local filter states
  const [branchId, setBranchId] = useState(branchParam);
  const [checkIn, setCheckIn] = useState(() => {
    if (checkInParam) return checkInParam;
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [checkOut, setCheckOut] = useState(() => {
    if (checkOutParam) return checkOutParam;
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });
  const [guests, setGuests] = useState(guestsParam);

  // Load branches
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await api.get('/branches');
        if (res.data?.data) {
          setBranches(res.data.data);
          if (!branchId && res.data.data.length > 0) {
            setBranchId(res.data.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load branches:', err);
      }
    };
    loadBranches();
  }, []);

  // Search rooms when branchId, checkIn, or checkOut changes
  const searchRooms = async () => {
    if (!branchId || !checkIn || !checkOut) return;
    setLoading(true);
    try {
      const res = await api.get('/rooms/search', {
        params: {
          branchId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          guests,
        },
      });
      if (res.data?.data?.rooms) {
        setRooms(res.data.data.rooms);
      }
    } catch (err) {
      console.error('Failed to search rooms:', err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (branchId) {
      searchRooms();
    }
  }, [branchId, checkIn, checkOut, guests]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ branchId, checkIn, checkOut, guests });
    searchRooms();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
          Luxury Accommodations
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#242321]">
          Available Rooms & Suites
        </h1>
        <p className="text-xs sm:text-sm text-[#766F66]">
          Real-time availability. Direct reservation with physical desk payment at check-in.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-6 rounded-lg border border-[#EFE8DC] shadow-sm">
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
              Hotel Branch
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-[#B79A65]" />
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
              Check-in Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-[#B79A65]" />
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
              Check-out Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-[#B79A65]" />
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
              Guests
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-2.5 w-4 h-4 text-[#B79A65]" />
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
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
            <button
              type="submit"
              className="w-full py-2.5 bg-[#242321] text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#B79A65] transition-colors"
            >
              Update Search
            </button>
          </div>

        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-[#B79A65] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs uppercase tracking-wider text-[#766F66]">Checking live availability...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#EFE8DC] p-12 text-center max-w-lg mx-auto space-y-4">
          <Sparkles className="w-8 h-8 text-[#B79A65] mx-auto" />
          <h3 className="font-serif text-xl font-bold text-[#242321]">
            No Rooms Available for These Dates
          </h3>
          <p className="text-xs text-[#766F66] leading-relaxed">
            All rooms in this branch are currently reserved for the selected period.
            Please adjust your check-in dates or try another serene destination.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => {
            let images: string[] = [];
            try {
              images = JSON.parse(room.images || '[]');
            } catch {
              images = [];
            }
            const coverImage = images[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427';

            return (
              <div
                key={room.id}
                className="bg-white rounded-lg border border-[#EFE8DC] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={coverImage}
                      alt={`Room ${room.roomNumber}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#242321]/80 backdrop-blur-sm text-white px-2.5 py-1 rounded text-[11px] uppercase tracking-wider font-semibold">
                      Room {room.roomNumber} • Floor {room.floor}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-emerald-800/90 text-white px-2.5 py-0.5 rounded text-[10px] uppercase tracking-widest font-semibold">
                      Available
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#B79A65] font-semibold block">
                        {room.branch?.name?.split('-')[1]?.trim() || 'House of Dreams'}
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#242321]">
                        {room.roomType?.name || 'Deluxe Room'}
                      </h3>
                      <p className="text-xs text-[#766F66] line-clamp-2 mt-1 leading-relaxed">
                        {room.description || room.roomType?.description}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-[#5A4636] pt-1">
                      <div className="flex items-center space-x-1">
                        <Bed className="w-4 h-4 text-[#B79A65]" />
                        <span>{room.roomType?.bedType || 'King Bed'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-[#B79A65]" />
                        <span>Up to {room.capacity} Guests</span>
                      </div>
                    </div>

                    {/* Room Amenities preview */}
                    {room.roomAmenities && room.roomAmenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {room.roomAmenities.slice(0, 3).map((ra) => (
                          <span
                            key={ra.id}
                            className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded bg-[#F8F5EF] text-[#5A4636] border border-[#EFE8DC]"
                          >
                            <Check className="w-3 h-3 text-[#B79A65]" />
                            <span>{ra.amenity.name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-[#EFE8DC]/80 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#766F66] block">Per Night</span>
                    <span className="font-bold text-lg text-[#242321]">
                      ₹{room.pricePerNight.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-400 block">+12% GST at desk</span>
                  </div>

                  <Link
                    to={`/rooms/${room.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                    className="px-5 py-2.5 bg-[#242321] text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#B79A65] transition-colors inline-flex items-center space-x-1.5 shadow-sm"
                  >
                    <span>Reserve</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Desk Payment Notice Banner */}
      <div className="bg-[#EFE8DC]/60 rounded-lg p-6 border border-[#EFE8DC] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5A4636]">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-6 h-6 text-[#B79A65] flex-shrink-0" />
          <div>
            <span className="font-bold text-[#242321] block">Desk Payment Only Policy</span>
            <span>Your reservation holds your room instantly. Payment is settled at the hotel reception upon check-in or checkout.</span>
          </div>
        </div>
        <span className="font-serif italic text-sm text-[#766F66]">Stay. Relax. Dream.</span>
      </div>

    </div>
  );
};
