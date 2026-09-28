import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Room, Branch, RoomType, RoomStatus } from '../../types';
import { BedDouble, Plus, Edit, Filter, X, Check, AlertTriangle, Trash2, RefreshCw, Film, Table } from 'lucide-react';
import { BookMyShowRoomMatrix } from '../../components/rooms/BookMyShowRoomMatrix';

export const AdminRoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & View Mode
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'CINEMA' | 'TABLE'>('CINEMA');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form State
  const [branchId, setBranchId] = useState('');
  const [roomTypeId, setRoomTypeId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState(1);
  const [capacity, setCapacity] = useState(2);
  const [pricePerNight, setPricePerNight] = useState(5000);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<RoomStatus>('AVAILABLE');
  const [saving, setSaving] = useState(false);

  const fetchData = async (silent = false) => {
    if (!silent) {
      if (rooms.length === 0) setLoading(true);
      else setRefreshing(true);
    }
    try {
      const [roomsRes, branchesRes, typesRes] = await Promise.all([
        api.get('/rooms', {
          params: {
            branchId: branchFilter !== 'ALL' ? branchFilter : undefined,
            status: statusFilter !== 'ALL' ? statusFilter : undefined,
          },
        }),
        api.get('/branches'),
        api.get('/room-types'),
      ]);

      if (roomsRes.data?.data) setRooms(roomsRes.data.data);
      if (branchesRes.data?.data) {
        setBranches(branchesRes.data.data);
        if (!branchId && branchesRes.data.data.length > 0) {
          setBranchId(branchesRes.data.data[0].id);
        }
      }
      if (typesRes.data?.data) {
        setRoomTypes(typesRes.data.data);
        if (!roomTypeId && typesRes.data.data.length > 0) {
          setRoomTypeId(typesRes.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load room management data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [branchFilter, statusFilter]);

  // Real-time polling when modal is not open
  useEffect(() => {
    const interval = setInterval(() => {
      if (!modalOpen) {
        fetchData(true);
      }
    }, 7000);
    return () => clearInterval(interval);
  }, [modalOpen, branchFilter, statusFilter]);

  const openCreateModal = () => {
    setEditingRoom(null);
    setRoomNumber('');
    setFloor(1);
    setCapacity(2);
    setPricePerNight(5000);
    setDescription('');
    setImageUrl('');
    setStatus('AVAILABLE');
    setModalOpen(true);
  };

  const openEditModal = (r: Room) => {
    setEditingRoom(r);
    setBranchId(r.branchId);
    setRoomTypeId(r.roomTypeId);
    setRoomNumber(r.roomNumber);
    setFloor(r.floor);
    setCapacity(r.capacity);
    setPricePerNight(r.pricePerNight);
    setDescription(r.description || '');
    let firstImg = '';
    try {
      const parsed = JSON.parse(r.images || '[]');
      firstImg = parsed[0] || '';
    } catch {}
    setImageUrl(firstImg);
    setStatus(r.status);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: any = {
        branchId,
        roomTypeId,
        roomNumber,
        floor: Number(floor),
        capacity: Number(capacity),
        pricePerNight: Number(pricePerNight),
        description,
        status,
        images: imageUrl ? [imageUrl] : [],
      };

      if (editingRoom) {
        await api.put(`/rooms/${editingRoom.id}`, payload);
      } else {
        await api.post('/rooms', payload);
      }

      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save room');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (roomId: string, newStatus: RoomStatus) => {
    // Instant optimistic update
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, status: newStatus } : r))
    );
    try {
      await api.patch(`/rooms/${roomId}/status`, { status: newStatus });
      fetchData(true);
    } catch (err: any) {
      fetchData(true);
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleDeleteRoom = async (room: Room) => {
    if (!window.confirm(`Are you sure you want to permanently delete Room ${room.roomNumber}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/rooms/${room.id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
            Global Room Inventory
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#242321]">
            Rooms & Suites Portfolio
          </h1>
          <p className="text-xs text-gray-500">
            Configure rooms across all hotel branches, floors, tariffs, and housekeeping statuses.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Auto-Sync</span>
          </div>

          <button
            onClick={() => fetchData(false)}
            disabled={refreshing || loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[#E8E2D7] rounded-lg text-xs font-medium text-gray-700 hover:bg-[#F8F5EF] transition-colors shadow-sm disabled:opacity-50"
            title="Refresh rooms"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#B79A65] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-[#242321] text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#B79A65] transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#B79A65]" />
            <span>Add New Room</span>
          </button>
        </div>
      </div>

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
              onClick={() => setViewMode('TABLE')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-[#242321] text-white shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Table className="w-3.5 h-3.5 text-[#B79A65]" />
              <span>Inventory Table</span>
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Showing {rooms.length} room{rooms.length === 1 ? '' : 's'} across {branches.length} branch{branches.length === 1 ? '' : 'es'}
        </div>
      </div>

      {/* BookMyShow Matrix View */}
      {viewMode === 'CINEMA' ? (
        <BookMyShowRoomMatrix
          rooms={rooms}
          branches={branches}
          selectedBranchId={branchFilter}
          onBranchChange={(newBranchId) => setBranchFilter(newBranchId)}
          onStatusChange={handleStatusChange}
          userRole="ADMIN"
          onRefresh={() => fetchData(false)}
          loading={loading || refreshing}
        />
      ) : (
        /* Inventory Table View */
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg border border-[#E8E2D7] shadow-sm flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
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

            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-700">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-1.5 border rounded bg-[#F8F5EF] focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="OCCUPIED">OCCUPIED</option>
                <option value="CLEANING">CLEANING</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-[#E8E2D7] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-2 border-[#B79A65] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span className="text-xs text-gray-500">Loading rooms...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F5EF] border-b border-[#E8E2D7] text-[#5A4636] uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Room No.</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Room Type</th>
                  <th className="py-3 px-4">Floor</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Tariff / Night</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE8DC]">
                {rooms.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      <BedDouble className="w-10 h-10 text-[#B79A65] mx-auto mb-2 opacity-50" />
                      <p className="font-semibold text-sm text-[#242321]">No rooms registered yet</p>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                        {branches.length === 0
                          ? 'Please configure your hotel branch under Branches first before adding rooms.'
                          : 'Click "Add New Room" above to register room numbers, tariffs, and floors.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  rooms.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#242321]">
                        Room {r.roomNumber}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-gray-800">
                        {r.branch?.name?.split('-')[1]?.trim() || r.branch?.name}
                      </td>

                      <td className="py-3.5 px-4 text-gray-700">
                        {r.roomType?.name}
                      </td>

                      <td className="py-3.5 px-4 text-gray-600">
                        Floor {r.floor}
                      </td>

                      <td className="py-3.5 px-4 text-gray-600">
                        {r.capacity} Guests
                      </td>

                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        ₹{r.pricePerNight.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={r.status}
                          onChange={(e) => handleStatusChange(r.id, e.target.value as RoomStatus)}
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded border focus:outline-none cursor-pointer ${
                            r.status === 'AVAILABLE'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : r.status === 'OCCUPIED'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : r.status === 'CLEANING'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-red-50 text-red-800 border-red-300'
                          }`}
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="OCCUPIED">OCCUPIED</option>
                          <option value="CLEANING">CLEANING</option>
                          <option value="MAINTENANCE">MAINTENANCE</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-1.5 text-gray-600 hover:text-[#B79A65] transition-colors"
                          title="Edit Room"
                        >
                          <Edit className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(r)}
                          className="p-1.5 text-red-500 hover:text-red-700 transition-colors"
                          title="Delete Room"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto animate-fadeIn text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif text-lg font-bold text-[#242321]">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            {branches.length === 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded flex items-center space-x-2 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span>No hotel branches registered. Please go to the <strong>Branches</strong> page to add your hotel property first before creating rooms.</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Assigned Branch</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none"
                    required
                    disabled={branches.length === 0}
                  >
                    {branches.length === 0 ? (
                      <option value="">No branches available</option>
                    ) : (
                      branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Room Category</label>
                  <select
                    value={roomTypeId}
                    onChange={(e) => setRoomTypeId(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none"
                    required
                  >
                    {roomTypes.map((rt) => (
                      <option key={rt.id} value={rt.id}>{rt.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. 101"
                    className="w-full p-2 border rounded focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Floor Level</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={floor}
                    onChange={(e) => setFloor(parseInt(e.target.value, 10))}
                    className="w-full p-2 border rounded focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value, 10))}
                    className="w-full p-2 border rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Nightly Price (₹)</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(parseFloat(e.target.value))}
                    className="w-full p-2 border rounded focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as RoomStatus)}
                    className="w-full p-2 border rounded focus:outline-none"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="CLEANING">CLEANING</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Specific room view or highlights..."
                  className="w-full p-2 border rounded focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Photo Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#242321] text-white uppercase tracking-wider font-semibold rounded hover:bg-[#B79A65] transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
