import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  CalendarCheck,
  UserCheck,
  LogOut as LogOutIcon,
  BedDouble,
  CreditCard,
  UserPlus,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const ReceptionDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDashboard = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await api.get('/reports/dashboard');
      if (res.data?.data) {
        setStats(res.data.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard(false);

    // Auto-refresh every 5 seconds for real-time live synchronization
    const timer = setInterval(() => {
      fetchDashboard(true);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const cards = stats?.cards || {
    todayCheckIns: 0,
    todayCheckOuts: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    cleaningRooms: 0,
    todayBookings: 0,
    todayRevenue: 0,
    outstandingPayments: 0,
    occupancyRate: 0,
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-[#E8E2D7] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
            Front Desk Operations Station
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#242321]">
            {user?.branch?.name || 'Hotel Front Desk'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Logged in as {user?.name} • Desk Payment Only
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              Live Real-Time Sync (Active)
            </span>
            <span className="text-[10px] text-gray-400">
              Synced: {lastUpdated.toLocaleTimeString()}
            </span>
            <button
              onClick={() => fetchDashboard(true)}
              disabled={isRefreshing}
              className="p-1 text-gray-500 hover:text-black transition-colors rounded hover:bg-gray-100"
              title="Refresh Stats Now"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-[#B79A65]' : ''}`} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/reception/walk-in"
            className="px-4 py-2 bg-[#242321] text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#B79A65] transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#B79A65]" />
            <span>New Walk-in</span>
          </Link>
          <Link
            to="/reception/bookings"
            className="px-4 py-2 bg-[#F8F5EF] border border-[#EFE8DC] text-[#242321] text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#EFE8DC] transition-colors flex items-center space-x-1.5"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-[#B79A65]" />
            <span>View Stays</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-lg border border-[#E8E2D7] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Today's Check-ins</span>
            <UserCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#242321]">
            {cards.todayCheckIns}
          </div>
          <span className="text-[10px] text-gray-400 block">Scheduled arrivals</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#E8E2D7] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Today's Check-outs</span>
            <LogOutIcon className="w-4 h-4 text-amber-700" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#242321]">
            {cards.todayCheckOuts}
          </div>
          <span className="text-[10px] text-gray-400 block">Scheduled departures</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#E8E2D7] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Available Rooms</span>
            <BedDouble className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="font-serif text-3xl font-bold text-emerald-800">
            {cards.availableRooms}
          </div>
          <span className="text-[10px] text-gray-400 block">Ready for check-in</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#E8E2D7] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Occupied Rooms</span>
            <BedDouble className="w-4 h-4 text-[#B79A65]" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#242321]">
            {cards.occupiedRooms}
          </div>
          <span className="text-[10px] text-gray-400 block">Current in-house guests</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#E8E2D7] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Needs Cleaning</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-serif text-3xl font-bold text-amber-700">
            {cards.cleaningRooms}
          </div>
          <span className="text-[10px] text-gray-400 block">Housekeeping pending</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#E8E2D7] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Today's Revenue</span>
            <CreditCard className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="font-serif text-3xl font-bold text-emerald-800">
            ₹{cards.todayRevenue.toLocaleString()}
          </div>
          <span className="text-[10px] text-gray-400 block">Collected at desk today</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#E8E2D7] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Pending Payments</span>
            <CreditCard className="w-4 h-4 text-amber-700" />
          </div>
          <div className="font-serif text-3xl font-bold text-amber-800">
            ₹{cards.outstandingPayments.toLocaleString()}
          </div>
          <span className="text-[10px] text-gray-400 block">To be collected at desk</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#E8E2D7] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Occupancy Rate</span>
            <Clock className="w-4 h-4 text-purple-700" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#242321]">
            {cards.occupancyRate}%
          </div>
          <span className="text-[10px] text-gray-400 block">Branch capacity filled</span>
        </div>

      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Link
          to="/reception/walk-in"
          className="bg-white p-6 rounded-lg border border-[#E8E2D7] hover:border-[#B79A65] transition-all shadow-sm group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded bg-[#F8F5EF] text-[#B79A65] flex items-center justify-center group-hover:bg-[#242321] group-hover:text-white transition-colors">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#242321]">
              Walk-in Guest Check-in
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Instantly create a walk-in booking for newly arrived guests, check room availability, and collect advance desk payment.
            </p>
          </div>
          <div className="pt-4 text-xs font-semibold text-[#B79A65] flex items-center space-x-1">
            <span>Create Walk-in</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          to="/reception/bookings"
          className="bg-white p-6 rounded-lg border border-[#E8E2D7] hover:border-[#B79A65] transition-all shadow-sm group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded bg-[#F8F5EF] text-[#B79A65] flex items-center justify-center group-hover:bg-[#242321] group-hover:text-white transition-colors">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#242321]">
              Manage Check-ins & Outs
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Verify guest identities, process check-ins, record cash/card/UPI desk payments, add room service charges, and checkout guests.
            </p>
          </div>
          <div className="pt-4 text-xs font-semibold text-[#B79A65] flex items-center space-x-1">
            <span>Open Stays Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          to="/reception/rooms"
          className="bg-white p-6 rounded-lg border border-[#E8E2D7] hover:border-[#B79A65] transition-all shadow-sm group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded bg-[#F8F5EF] text-[#B79A65] flex items-center justify-center group-hover:bg-[#242321] group-hover:text-white transition-colors">
              <BedDouble className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#242321]">
              Room Grid & Housekeeping
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Monitor room occupancy by floor. Mark rooms from CLEANING to AVAILABLE with a single click once ready.
            </p>
          </div>
          <div className="pt-4 text-xs font-semibold text-[#B79A65] flex items-center space-x-1">
            <span>View Room Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

      </div>

    </div>
  );
};
