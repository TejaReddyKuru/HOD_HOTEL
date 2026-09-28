import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Room, RoomStatus, Branch } from '../../types';
import {
  BedDouble,
  User,
  Sparkles,
  Wrench,
  Clock,
  CheckCircle,
  Building2,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Phone,
  RefreshCw,
  X,
  Compass,
} from 'lucide-react';

interface BookMyShowRoomMatrixProps {
  rooms: Room[];
  branches?: Branch[];
  selectedBranchId?: string;
  onBranchChange?: (branchId: string) => void;
  onStatusChange?: (roomId: string, newStatus: RoomStatus) => Promise<void>;
  userRole: 'ADMIN' | 'RECEPTION';
  onRefresh?: () => void;
  loading?: boolean;
}

export const BookMyShowRoomMatrix: React.FC<BookMyShowRoomMatrixProps> = ({
  rooms,
  branches = [],
  selectedBranchId,
  onBranchChange,
  onStatusChange,
  userRole,
  onRefresh,
  loading = false,
}) => {
  const navigate = useNavigate();

  // Filters & State
  const [selectedFloor, setSelectedFloor] = useState<number | 'ALL'>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    if (selectedFloor !== 'ALL' && r.floor !== selectedFloor) return false;
    if (selectedStatusFilter !== 'ALL' && r.status !== selectedStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = r.roomNumber.toLowerCase().includes(q);
      const matchType = r.roomType?.name?.toLowerCase().includes(q);
      const matchGuest = r.bookings?.[0]?.customer?.name?.toLowerCase().includes(q);
      if (!matchNum && !matchType && !matchGuest) return false;
    }
    return true;
  });

  // Calculate statistics
  const totalCount = rooms.length;
  const availableCount = rooms.filter((r) => r.status === 'AVAILABLE').length;
  const occupiedCount = rooms.filter((r) => r.status === 'OCCUPIED').length;
  const cleaningCount = rooms.filter((r) => r.status === 'CLEANING').length;
  const maintenanceCount = rooms.filter((r) => r.status === 'MAINTENANCE').length;
  const reservedCount = rooms.filter((r) => r.status === 'RESERVED').length;

  const occupancyRate = totalCount > 0 ? Math.round(((occupiedCount + reservedCount) / totalCount) * 100) : 0;

  // Group by floors descending (top floor at top, ground floor at bottom like a building/theater)
  const uniqueFloors = Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => b - a);

  const getFloorName = (floor: number) => {
    if (floor === 1) return '1st Floor • Deluxe Garden Havens';
    if (floor === 2) return '2nd Floor • Executive Heritage Suites';
    if (floor === 3) return '3rd Floor • Royal Mewar & Penthouse';
    return `Floor ${floor} • Luxury Wings`;
  };

  const handleQuickStatusUpdate = async (roomId: string, newStatus: RoomStatus) => {
    if (!onStatusChange) return;
    setActionLoading(true);
    try {
      await onStatusChange(roomId, newStatus);
      if (selectedRoom?.id === roomId) {
        setSelectedRoom((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleWalkInBooking = (room: Room) => {
    if (userRole === 'RECEPTION') {
      navigate('/reception/walk-in', { state: { roomId: room.id, roomNumber: room.roomNumber } });
    } else {
      navigate('/admin/bookings');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Branch Switcher */}
      <div className="bg-white rounded-xl border border-[#E8E2D7] p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Branch & Title */}
          <div>
            <div className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-[#B79A65]">
              <Compass className="w-3.5 h-3.5" />
              <span>Interactive Cinema-Style Room Grid</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#242321] mt-0.5">
              Live Room Availability Matrix
            </h2>
            <p className="text-xs text-gray-500">
              Interactive graphical layout modeled after real-time seat matrices for instant booking and occupancy visibility.
            </p>
          </div>

          {/* Right Action / Branch Picker */}
          <div className="flex flex-wrap items-center gap-3">
            {/* If Admin: Branch Selector */}
            {userRole === 'ADMIN' && branches.length > 0 && onBranchChange && (
              <div className="flex items-center space-x-2 bg-[#F8F5EF] p-1.5 rounded-lg border border-[#E8E2D7]">
                <Building2 className="w-4 h-4 text-[#B79A65] ml-1.5" />
                <select
                  value={selectedBranchId || ''}
                  onChange={(e) => onBranchChange(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-[#242321] focus:outline-none pr-3 cursor-pointer"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E8E2D7] text-gray-700 hover:text-[#B79A65] hover:bg-[#F8F5EF] rounded-lg text-xs font-semibold transition shadow-2xs cursor-pointer disabled:opacity-50"
                title="Refresh Room Matrix"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#B79A65] ${loading ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
            )}

            {/* Occupancy Indicator Badge */}
            <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-[#242321] text-white rounded-lg text-xs">
              <span className="text-[11px] text-gray-300">Live Occupancy:</span>
              <span className="font-bold text-[#B79A65]">{occupancyRate}%</span>
              <div className="w-12 h-2 bg-gray-700 rounded-full overflow-hidden ml-1">
                <div
                  className="h-full bg-[#B79A65] transition-all duration-500"
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Legend Bar (BookMyShow Style) */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setSelectedStatusFilter('ALL')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition cursor-pointer ${
                selectedStatusFilter === 'ALL'
                  ? 'bg-[#242321] text-white border-[#242321]'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>All ({totalCount})</span>
            </button>

            {/* Available */}
            <button
              type="button"
              onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'AVAILABLE' ? 'ALL' : 'AVAILABLE')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition cursor-pointer ${
                selectedStatusFilter === 'AVAILABLE'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span className="w-3 h-3 rounded-t-sm rounded-b-xs bg-emerald-500 border border-emerald-600 inline-block shadow-2xs" />
              <span>Available ({availableCount})</span>
            </button>

            {/* Occupied */}
            <button
              type="button"
              onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'OCCUPIED' ? 'ALL' : 'OCCUPIED')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition cursor-pointer ${
                selectedStatusFilter === 'OCCUPIED'
                  ? 'bg-rose-700 text-white border-rose-700 shadow-sm'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span className="w-3 h-3 rounded-t-sm rounded-b-xs bg-rose-500 border border-rose-600 inline-block shadow-2xs" />
              <span>Occupied ({occupiedCount})</span>
            </button>

            {/* Reserved */}
            {reservedCount > 0 && (
              <button
                type="button"
                onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'RESERVED' ? 'ALL' : 'RESERVED')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition cursor-pointer ${
                  selectedStatusFilter === 'RESERVED'
                    ? 'bg-amber-700 text-white border-amber-700 shadow-sm'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <span className="w-3 h-3 rounded-t-sm rounded-b-xs bg-amber-400 border border-amber-500 inline-block shadow-2xs" />
                <span>Reserved ({reservedCount})</span>
              </button>
            )}

            {/* Cleaning */}
            <button
              type="button"
              onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'CLEANING' ? 'ALL' : 'CLEANING')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition cursor-pointer ${
                selectedStatusFilter === 'CLEANING'
                  ? 'bg-sky-700 text-white border-sky-700 shadow-sm'
                  : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'
              }`}
            >
              <span className="w-3 h-3 rounded-t-sm rounded-b-xs bg-sky-400 border border-sky-500 inline-block shadow-2xs animate-pulse" />
              <span>Cleaning ({cleaningCount})</span>
            </button>

            {/* Maintenance */}
            {maintenanceCount > 0 && (
              <button
                type="button"
                onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'MAINTENANCE' ? 'ALL' : 'MAINTENANCE')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition cursor-pointer ${
                  selectedStatusFilter === 'MAINTENANCE'
                    ? 'bg-stone-700 text-white border-stone-700 shadow-sm'
                    : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                }`}
              >
                <span className="w-3 h-3 rounded-t-sm rounded-b-xs bg-stone-400 border border-stone-500 inline-block shadow-2xs" />
                <span>Maintenance ({maintenanceCount})</span>
              </button>
            )}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search room # or guest..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#B79A65]"
            />
          </div>
        </div>
      </div>

      {/* Main Theater / Room Matrix Arena */}
      <div className="relative bg-[#201D1A] rounded-2xl p-6 sm:p-10 border border-[#3A3530] shadow-xl overflow-hidden text-white">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-[#B79A65]/10 blur-3xl pointer-events-none rounded-full" />

        {/* Curved Horizon Screen (BookMyShow Screen This Way) */}
        <div className="max-w-xl mx-auto mb-12 text-center">
          <div className="relative py-2">
            {/* Curved Screen Arc Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-transparent via-[#B79A65] to-transparent rounded-[100%] shadow-[0_0_20px_rgba(183,154,101,0.5)] opacity-80" />
            <div className="mt-2 text-[10px] tracking-[0.35em] uppercase font-bold text-[#EFE8DC]/70">
              ⌢ HOTEL FRONT • LAKE & NATURE HORIZON VIEW ⌢
            </div>
            <span className="text-[9px] text-[#A59D92] tracking-wider block">
              (All premium suites and balconies face this scenic horizon)
            </span>
          </div>
        </div>

        {/* Floor Rows */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-2 border-[#B79A65] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="text-xs text-[#EFE8DC]/70">Loading room layout...</span>
          </div>
        ) : rooms.length === 0 ? (
          <div className="py-16 text-center text-stone-400">
            <BedDouble className="w-12 h-12 mx-auto mb-3 text-[#B79A65]/60" />
            <h3 className="font-serif text-lg font-bold text-[#F8F5EF]">No Rooms Found</h3>
            <p className="text-xs text-[#A59D92] mt-1">Please select another branch or add rooms to this property.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {uniqueFloors.map((floor) => {
              const floorRooms = filteredRooms.filter((r) => r.floor === floor);
              if (floorRooms.length === 0) return null;

              return (
                <div key={floor} className="space-y-4">
                  {/* Floor Category Header */}
                  <div className="flex items-center justify-between border-b border-[#3A3530] pb-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-[#332D27] border border-[#4D433A] font-bold text-[#B79A65] text-[10px] tracking-wider uppercase">
                        FLOOR {floor}
                      </span>
                      <h4 className="font-serif font-semibold text-[#F8F5EF] text-sm">
                        {getFloorName(floor)}
                      </h4>
                    </div>
                    <span className="text-[11px] text-[#A59D92]">
                      {floorRooms.filter((r) => r.status === 'AVAILABLE').length} of {floorRooms.length} Available
                    </span>
                  </div>

                  {/* Seat Pods Grid (BookMyShow Matrix) */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4.5 pt-1">
                    {floorRooms.map((room) => {
                      const isSelected = selectedRoom?.id === room.id;
                      const isAvailable = room.status === 'AVAILABLE';
                      const isOccupied = room.status === 'OCCUPIED';
                      const isCleaning = room.status === 'CLEANING';
                      const isReserved = room.status === 'RESERVED';
                      const isMaintenance = room.status === 'MAINTENANCE';

                      // Pod Color Scheme
                      let podStyle = 'bg-stone-800 text-stone-300 border-stone-700 hover:border-stone-500';
                      let statusBadge = 'Available';
                      let microIcon = <BedDouble className="w-3.5 h-3.5" />;

                      if (isAvailable) {
                        podStyle = 'bg-emerald-950/40 text-emerald-200 border-emerald-500/80 hover:bg-emerald-900/60 hover:border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]';
                        statusBadge = 'Available';
                        microIcon = <BedDouble className="w-3.5 h-3.5 text-emerald-400" />;
                      } else if (isOccupied) {
                        podStyle = 'bg-rose-950/40 text-rose-200 border-rose-500/70 hover:bg-rose-900/60 hover:border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.15)]';
                        statusBadge = 'Occupied';
                        microIcon = <User className="w-3.5 h-3.5 text-rose-400" />;
                      } else if (isCleaning) {
                        podStyle = 'bg-sky-950/40 text-sky-200 border-sky-400/80 hover:bg-sky-900/60 hover:border-sky-300 animate-pulse';
                        statusBadge = 'Cleaning';
                        microIcon = <Sparkles className="w-3.5 h-3.5 text-sky-300" />;
                      } else if (isReserved) {
                        podStyle = 'bg-amber-950/40 text-amber-200 border-amber-400/80 hover:bg-amber-900/60 hover:border-amber-300';
                        statusBadge = 'Reserved';
                        microIcon = <Clock className="w-3.5 h-3.5 text-amber-300" />;
                      } else if (isMaintenance) {
                        podStyle = 'bg-stone-900 text-stone-500 border-stone-700 cursor-not-allowed';
                        statusBadge = 'Maintenance';
                        microIcon = <Wrench className="w-3.5 h-3.5 text-stone-500" />;
                      }

                      return (
                        <button
                          key={room.id}
                          type="button"
                          onClick={() => setSelectedRoom(room)}
                          className={`group relative flex flex-col items-center justify-between w-20 sm:w-24 h-24 p-2 rounded-t-xl rounded-b-md border-2 transition-all duration-200 cursor-pointer select-none active:scale-95 ${podStyle} ${
                            isSelected
                              ? 'ring-4 ring-[#B79A65] scale-105 shadow-[0_0_20px_rgba(183,154,101,0.6)] !border-[#B79A65]'
                              : 'hover:-translate-y-1 hover:shadow-lg'
                          }`}
                          title={`Room ${room.roomNumber} • ${room.roomType?.name} • ${statusBadge}`}
                        >
                          {/* Seat Headrest Bar */}
                          <div className="w-full flex items-center justify-between text-[10px]">
                            <span className="font-mono font-bold tracking-tight text-white group-hover:text-[#B79A65] transition-colors">
                              {room.roomNumber}
                            </span>
                            {microIcon}
                          </div>

                          {/* Center Room Type Snippet */}
                          <div className="w-full text-center px-0.5 truncate">
                            <span className="text-[10px] text-gray-300 block truncate font-medium">
                              {room.bookings?.[0]?.customer?.name || room.roomType?.name?.replace('Room', '').replace('Suite', '').trim() || 'Suite'}
                            </span>
                          </div>

                          {/* Bottom Price Pill */}
                          <div className="w-full pt-1 border-t border-white/10 flex items-center justify-center">
                            <span className="text-[10px] font-bold tracking-wide text-white/90">
                              ₹{room.pricePerNight ? (room.pricePerNight / 1000).toFixed(1) + 'k' : '—'}
                            </span>
                          </div>

                          {/* Selection Checkmark */}
                          {isSelected && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#B79A65] text-[#242321] rounded-full flex items-center justify-center font-bold text-xs shadow-md">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-out / Bottom Selected Room Ticket (BookMyShow Style Booking Slip) */}
      {selectedRoom && (
        <div className="bg-white rounded-xl border border-[#E8E2D7] shadow-lg p-6 animate-fadeIn transition-all">
          <div className="flex items-start justify-between border-b pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-[#242321] text-white flex flex-col items-center justify-center font-mono shadow-sm">
                <span className="text-[9px] uppercase tracking-wider text-[#B79A65]">ROOM</span>
                <span className="text-base font-bold leading-tight">{selectedRoom.roomNumber}</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-serif text-lg font-bold text-[#242321]">
                    {selectedRoom.roomType?.name || 'Luxury Room'}
                  </h3>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      selectedRoom.status === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : selectedRoom.status === 'OCCUPIED'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : selectedRoom.status === 'CLEANING'
                        ? 'bg-sky-100 text-sky-800 border border-sky-300'
                        : selectedRoom.status === 'RESERVED'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-stone-100 text-stone-800 border border-stone-300'
                    }`}
                  >
                    {selectedRoom.status}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  Floor {selectedRoom.floor} • Capacity: {selectedRoom.capacity} Guests • ₹{selectedRoom.pricePerNight?.toLocaleString()} / night
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedRoom(null)}
              className="text-gray-400 hover:text-black p-1 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-xs">
            
            {/* Left: Occupant or Room Details */}
            <div className="space-y-3">
              {selectedRoom.bookings && selectedRoom.bookings.length > 0 ? (
                <div className="p-3 bg-[#F8F5EF] rounded-lg border border-[#EFE8DC] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#242321]">
                    <span>
                      {selectedRoom.bookings[0].status === 'CHECKED_IN' ? 'Current In-House Guest' : 'Upcoming Confirmed Guest'}
                    </span>
                    <span className="text-[#B79A65] font-mono">{selectedRoom.bookings[0].bookingNumber}</span>
                  </div>
                  <div className="space-y-1 text-gray-700">
                    <div className="font-semibold text-sm text-[#242321]">{selectedRoom.bookings[0].customer?.name}</div>
                    {selectedRoom.bookings[0].customer?.phone && (
                      <div className="flex items-center space-x-1.5 text-gray-500 text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-[#B79A65]" />
                        <span>{selectedRoom.bookings[0].customer.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1.5 text-gray-500 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-[#B79A65]" />
                      <span>
                        {new Date(selectedRoom.bookings[0].checkInDate).toLocaleDateString()} ➔{' '}
                        {new Date(selectedRoom.bookings[0].checkOutDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Ready for Immediate Guest Walk-In</span>
                  </div>
                  <p className="text-emerald-700 text-[11px]">
                    This room is thoroughly sanitized, inspected, and free of double-booking overlaps.
                  </p>
                </div>
              )}

              {selectedRoom.description && (
                <p className="text-gray-500 italic text-[11px]">
                  "{selectedRoom.description}"
                </p>
              )}
            </div>

            {/* Right: Instant Operational Actions */}
            <div className="flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                  Quick Desk Operations
                </span>

                <div className="flex flex-wrap gap-2">
                  {/* Action 1: Walk-in Booking if Available */}
                  {selectedRoom.status === 'AVAILABLE' && (
                    <button
                      type="button"
                      onClick={() => handleWalkInBooking(selectedRoom)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#242321] text-white hover:bg-[#B79A65] rounded-lg text-xs font-semibold uppercase tracking-wider transition shadow-sm cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-[#B79A65]" />
                      <span>Book Instant Walk-In</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  )}

                  {/* Action 2: If Cleaning -> Set to Available */}
                  {selectedRoom.status === 'CLEANING' && onStatusChange && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleQuickStatusUpdate(selectedRoom.id, 'AVAILABLE')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-semibold uppercase tracking-wider transition shadow-sm cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{actionLoading ? 'Updating...' : 'Mark Clean & Ready'}</span>
                    </button>
                  )}

                  {/* Action 3: Mark for Housekeeping Cleaning */}
                  {selectedRoom.status === 'AVAILABLE' && onStatusChange && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleQuickStatusUpdate(selectedRoom.id, 'CLEANING')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-sky-50 text-sky-800 border border-sky-300 hover:bg-sky-100 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      <span>Set to Cleaning</span>
                    </button>
                  )}

                  {/* Action 4: Maintenance Toggle */}
                  {onStatusChange && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() =>
                        handleQuickStatusUpdate(
                          selectedRoom.id,
                          selectedRoom.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE'
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 text-stone-700 border border-stone-300 hover:bg-stone-200 rounded-lg text-xs font-medium transition cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5 text-stone-500" />
                      <span>{selectedRoom.status === 'MAINTENANCE' ? 'Restore to Available' : 'Maintenance'}</span>
                    </button>
                  )}

                  {/* Action 5: Check Bookings */}
                  {selectedRoom.bookings && selectedRoom.bookings.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(userRole === 'RECEPTION' ? '/reception/bookings' : '/admin/bookings')
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E8E2D7] text-gray-700 hover:text-[#B79A65] hover:bg-[#F8F5EF] rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      <span>View Booking Records</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#B79A65]" />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-gray-400 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B79A65]" />
                <span>Physical Desk Payments • Double-Booking Isolation Engine Protected</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
