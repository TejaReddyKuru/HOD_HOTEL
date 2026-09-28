import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Room, RoomStatus } from '../../types';
import { BedDouble, Sparkles, AlertTriangle, CheckCircle, Clock, User, RefreshCw, LayoutGrid, Film } from 'lucide-react';
import { BookMyShowRoomMatrix } from '../../components/rooms/BookMyShowRoomMatrix';

export const ReceptionRoomsPage: React.FC = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'CINEMA' | 'CARDS'>('CINEMA');

  const fetchRooms = async (silent = false) => {
    if (!silent) {
      if (rooms.length === 0) setLoading(true);
      else setRefreshing(true);
    }
    try {
      const res = await api.get('/rooms');
      if (res.data?.data) {
        setRooms(res.data.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(() => {
      fetchRooms(true);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (roomId: string, newStatus: RoomStatus) => {
    // Instant optimistic update
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, status: newStatus } : r))
    );
    try {
      await api.patch(`/rooms/${roomId}/status`, { status: newStatus });
      fetchRooms(true);
    } catch (err: any) {
      fetchRooms(true);
      alert(err.response?.data?.message || 'Failed to update room status');
    }
  };

  // Group rooms by floor
  const roomsByFloor: Record<number, Room[]> = {};
  rooms.forEach((r) => {
    if (!roomsByFloor[r.floor]) {
      roomsByFloor[r.floor] = [];
    }
    roomsByFloor[r.floor].push(r);
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* View Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-xl border border-[#E8E2D7] shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Display Mode:</span>
          <div className="flex bg-[#F8F5EF] p-1 rounded-lg border border-[#E8E2D7]">
            <button
              type="button"
              onClick={() => setViewMode('CINEMA')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                viewMode === 'CINEMA'
                  ? 'bg-[#242321] text-white shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-[#B79A65]" />
              <span>BookMyShow Seat Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                viewMode === 'CARDS'
                  ? 'bg-[#242321] text-white shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#B79A65]" />
              <span>Detailed Cards</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">Live Synced ({lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})</span>
          </div>
        </div>
      </div>

      {/* BookMyShow Matrix View */}
      {viewMode === 'CINEMA' ? (
        <BookMyShowRoomMatrix
          rooms={rooms}
          onStatusChange={handleUpdateStatus}
          userRole="RECEPTION"
          onRefresh={() => fetchRooms(false)}
          loading={loading || refreshing}
        />
      ) : (
        /* Detailed Cards View */
        <div className="space-y-6">
          {Object.keys(roomsByFloor)
            .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
            .map((floorStr) => {
              const floor = parseInt(floorStr, 10);
              const floorRooms = roomsByFloor[floor];

              return (
                <div key={floor} className="space-y-3">
                  <div className="border-b border-[#E8E2D7] pb-1.5 flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold text-[#242321]">
                      Floor {floor} ({floorRooms.length} Rooms)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {floorRooms.map((r) => {
                      const isCleaning = r.status === 'CLEANING';
                      const isAvailable = r.status === 'AVAILABLE';
                      const isOccupied = r.status === 'OCCUPIED';
                      const isMaintenance = r.status === 'MAINTENANCE';

                      return (
                        <div
                          key={r.id}
                          className={`bg-white rounded-lg border p-4 flex flex-col justify-between space-y-3 shadow-sm transition-all ${
                            isCleaning
                              ? 'border-amber-300 ring-1 ring-amber-300 bg-amber-50/20'
                              : isOccupied
                              ? 'border-blue-200'
                              : isAvailable
                              ? 'border-emerald-200'
                              : 'border-red-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-serif text-xl font-bold text-[#242321]">
                                Room {r.roomNumber}
                              </span>
                              <span className="text-xs text-gray-500 block">
                                {r.roomType?.name}
                              </span>
                            </div>

                            <span
                              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                                isAvailable
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isOccupied
                                  ? 'bg-blue-100 text-blue-800'
                                  : isCleaning
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {r.status}
                            </span>
                          </div>

                          {/* Guest / Booking Info */}
                          <div className="text-xs space-y-1">
                            {r.bookings && r.bookings.length > 0 ? (
                              <div className="p-2 bg-[#F8F5EF] rounded text-gray-700 space-y-0.5">
                                <span className="font-semibold block text-[11px] text-[#242321]">
                                  {r.bookings[0].status === 'CHECKED_IN' ? 'Current Guest:' : 'Next Arrival:'}
                                </span>
                                <div>{r.bookings[0].customer.name}</div>
                                <div className="text-[10px] text-gray-500">
                                  {new Date(r.bookings[0].checkInDate).toLocaleDateString()} - {new Date(r.bookings[0].checkOutDate).toLocaleDateString()}
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-400 italic text-[11px]">
                                No active booking currently assigned
                              </div>
                            )}
                          </div>

                          {/* Status Actions */}
                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                            {isCleaning && (
                              <button
                                onClick={() => handleUpdateStatus(r.id, 'AVAILABLE')}
                                className="w-full py-1.5 bg-emerald-800 text-white rounded text-[11px] font-semibold hover:bg-emerald-900 transition-colors flex items-center justify-center space-x-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Mark Cleaned & Available</span>
                              </button>
                            )}

                            {isAvailable && (
                              <div className="w-full flex space-x-1.5">
                                <button
                                  onClick={() => handleUpdateStatus(r.id, 'CLEANING')}
                                  className="flex-1 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-medium hover:bg-amber-100"
                                >
                                  Needs Cleaning
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(r.id, 'MAINTENANCE')}
                                  className="flex-1 py-1 bg-red-50 text-red-800 border border-red-200 rounded text-[10px] font-medium hover:bg-red-100"
                                >
                                  Maintenance
                                </button>
                              </div>
                            )}

                            {isMaintenance && (
                              <button
                                onClick={() => handleUpdateStatus(r.id, 'AVAILABLE')}
                                className="w-full py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-medium hover:bg-emerald-100"
                              >
                                Restore to Available
                              </button>
                            )}

                            {isOccupied && (
                              <span className="text-[11px] text-blue-700 italic">
                                Occupied by in-house guest
                              </span>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}

    </div>
  );
};
