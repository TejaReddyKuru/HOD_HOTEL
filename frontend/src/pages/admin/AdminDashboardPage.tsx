import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Branch, DashboardStats } from '../../types';
import {
  Building2,
  BedDouble,
  CreditCard,
  UserCheck,
  LogOut,
  CalendarCheck,
  TrendingUp,
  Percent,
  AlertCircle,
  Filter,
  DollarSign,
  PieChart,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Load branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get('/branches');
        if (res.data?.data) {
          setBranches(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load branches:', err);
      }
    };
    fetchBranches();
  }, []);

  // Load dashboard stats for selected branch
  const fetchStats = async (silent = false) => {
    if (!silent) {
      if (!stats) setLoading(true);
      else setRefreshing(true);
    }
    try {
      const res = await api.get('/reports/dashboard', {
        params: { branchId: selectedBranch },
      });
      if (res.data?.data) {
        setStats(res.data.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      fetchStats(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [selectedBranch]);

  const cards = stats?.cards || {
    totalBranches: 0,
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    todayBookings: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    outstandingPayments: 0,
    occupancyRate: 0,
  };

  const statusCounts = stats?.statusCounts || {
    confirmed: 0,
    checkedIn: 0,
    checkedOut: 0,
    cancelled: 0,
    noShow: 0,
  };

  const methodBreakdown = stats?.methodBreakdown || {
    CASH: 0,
    CARD: 0,
    UPI: 0,
    OTHER: 0,
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header with Branch Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
            Global Management Command
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#242321]">
            Executive Hotel Dashboard
          </h1>
          <p className="text-xs text-gray-500">
            Real-time performance across all House of Dreams sanctuaries.
          </p>
        </div>

        {/* Controls: Branch Filter + Live Sync + Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Auto-Sync</span>
          </div>

          <button
            onClick={() => fetchStats(false)}
            disabled={refreshing || loading}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-[#E8E2D7] rounded-lg text-xs font-medium text-gray-700 hover:bg-[#F8F5EF] transition-colors shadow-sm disabled:opacity-50"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#B79A65] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {/* Multi-Branch Filter */}
          <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-[#E8E2D7] shadow-sm">
            <Filter className="w-4 h-4 text-[#B79A65]" />
            <span className="text-xs text-gray-600 font-medium">Branch:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="text-xs font-bold text-[#242321] bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Branches Combined</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center">
          <div className="w-8 h-8 border-2 border-[#B79A65] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-xs text-gray-500">Loading multi-branch metrics...</span>
        </div>
      ) : (
        <>
          {/* Top 11 Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-lg border border-[#E8E2D7] shadow-sm space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">Total Branches</span>
              <div className="font-serif text-3xl font-bold text-[#242321]">{cards.totalBranches}</div>
              <span className="text-[10px] text-[#B79A65]">Active luxury destinations</span>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#E8E2D7] shadow-sm space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">Total Rooms</span>
              <div className="font-serif text-3xl font-bold text-[#242321]">{cards.totalRooms}</div>
              <span className="text-[10px] text-gray-500">Suites & chalets portfolio</span>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#E8E2D7] shadow-sm space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">Available Rooms</span>
              <div className="font-serif text-3xl font-bold text-emerald-800">{cards.availableRooms}</div>
              <span className="text-[10px] text-emerald-600">Vacant & ready for guests</span>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#E8E2D7] shadow-sm space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">Occupied Rooms</span>
              <div className="font-serif text-3xl font-bold text-blue-800">{cards.occupiedRooms}</div>
              <span className="text-[10px] text-blue-600">Currently in-house</span>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#E8E2D7] shadow-sm space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">Today's Check-ins</span>
              <div className="font-serif text-3xl font-bold text-[#242321]">{cards.todayCheckIns}</div>
              <span className="text-[10px] text-gray-500">Arrivals expected</span>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#E8E2D7] shadow-sm space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">Today's Check-outs</span>
              <div className="font-serif text-3xl font-bold text-[#242321]">{cards.todayCheckOuts}</div>
              <span className="text-[10px] text-gray-500">Departures scheduled</span>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#E8E2D7] shadow-sm space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">Today's Bookings</span>
              <div className="font-serif text-3xl font-bold text-[#242321]">{cards.todayBookings}</div>
              <span className="text-[10px] text-gray-500">New reservations today</span>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#E8E2D7] shadow-sm space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">Occupancy Rate</span>
              <div className="font-serif text-3xl font-bold text-purple-800">{cards.occupancyRate}%</div>
              <span className="text-[10px] text-purple-600">Overall capacity filled</span>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#E8E2D7] shadow-sm space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">Today's Desk Revenue</span>
              <div className="font-serif text-3xl font-bold text-emerald-800">₹{cards.todayRevenue.toLocaleString()}</div>
              <span className="text-[10px] text-emerald-600">Collected today at desks</span>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#E8E2D7] shadow-sm space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">Monthly Desk Revenue</span>
              <div className="font-serif text-3xl font-bold text-emerald-800">₹{cards.monthlyRevenue.toLocaleString()}</div>
              <span className="text-[10px] text-emerald-600">Month-to-date collections</span>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#E8E2D7] shadow-sm space-y-1 col-span-2">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">Outstanding Desk Balances</span>
              <div className="font-serif text-3xl font-bold text-amber-800">₹{cards.outstandingPayments.toLocaleString()}</div>
              <span className="text-[10px] text-amber-700">To be collected upon check-in / checkout at desks</span>
            </div>

          </div>

          {/* Interactive Charts & Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* 7-Day Revenue Trend Chart */}
            <div className="bg-white p-6 rounded-lg border border-[#E8E2D7] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-serif text-base font-bold text-[#242321] flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-[#B79A65]" />
                  <span>7-Day Desk Revenue Trend</span>
                </h3>
                <span className="text-[11px] text-gray-400">Desk Collections</span>
              </div>

              {/* Bar visualization */}
              <div className="h-48 flex items-end justify-between gap-2 pt-6">
                {stats?.sevenDayTrend.map((d, i) => {
                  const maxRev = Math.max(...stats.sevenDayTrend.map((t) => t.revenue), 10000);
                  const heightPercent = Math.max(8, Math.round((d.revenue / maxRev) * 100));

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                        ₹{d.revenue.toLocaleString()}
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-[#B79A65] rounded-t hover:bg-[#242321] transition-colors relative"
                      />
                      <span className="text-[10px] text-gray-500 font-medium">
                        {d.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Branch Occupancy Comparison */}
            <div className="bg-white p-6 rounded-lg border border-[#E8E2D7] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-serif text-base font-bold text-[#242321] flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-[#B79A65]" />
                  <span>Branch Occupancy Matrix</span>
                </h3>
                <span className="text-[11px] text-gray-400">Live Status</span>
              </div>

              <div className="space-y-4 pt-2">
                {stats?.branchOccupancy.map((bo) => (
                  <div key={bo.id} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-[#242321] font-semibold">{bo.name} ({bo.city})</span>
                      <span className="text-[#B79A65] font-bold">{bo.occupancyRate}% ({bo.occupiedRooms}/{bo.totalRooms} Rooms)</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${bo.occupancyRate}%` }}
                        className="h-full bg-[#5A4636] rounded-full transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Distribution */}
            <div className="bg-white p-6 rounded-lg border border-[#E8E2D7] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-serif text-base font-bold text-[#242321] flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-[#B79A65]" />
                  <span>Desk Collection Breakdown by Method</span>
                </h3>
                <span className="text-[11px] text-gray-400">No Online Gateway</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-[#F8F5EF] rounded border border-[#EFE8DC]">
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">CASH (Physical Currency)</span>
                  <span className="font-bold text-base text-[#242321]">₹{methodBreakdown.CASH.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-[#F8F5EF] rounded border border-[#EFE8DC]">
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">CARD (Desk POS Terminal)</span>
                  <span className="font-bold text-base text-[#242321]">₹{methodBreakdown.CARD.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-[#F8F5EF] rounded border border-[#EFE8DC]">
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">UPI (Desk QR Code)</span>
                  <span className="font-bold text-base text-[#242321]">₹{methodBreakdown.UPI.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-[#F8F5EF] rounded border border-[#EFE8DC]">
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">OTHER</span>
                  <span className="font-bold text-base text-[#242321]">₹{methodBreakdown.OTHER.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Booking Status Distribution */}
            <div className="bg-white p-6 rounded-lg border border-[#E8E2D7] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-serif text-base font-bold text-[#242321] flex items-center space-x-2">
                  <CalendarCheck className="w-4 h-4 text-[#B79A65]" />
                  <span>Booking Lifecycle Overview</span>
                </h3>
                <span className="text-[11px] text-gray-400">Total Bookings</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded border border-amber-200 bg-amber-50/40">
                  <span className="text-amber-800 font-semibold text-[10px] uppercase block">CONFIRMED</span>
                  <span className="font-bold text-lg text-amber-900">{statusCounts.confirmed}</span>
                </div>
                <div className="p-3 rounded border border-emerald-200 bg-emerald-50/40">
                  <span className="text-emerald-800 font-semibold text-[10px] uppercase block">CHECKED IN</span>
                  <span className="font-bold text-lg text-emerald-900">{statusCounts.checkedIn}</span>
                </div>
                <div className="p-3 rounded border border-blue-200 bg-blue-50/40">
                  <span className="text-blue-800 font-semibold text-[10px] uppercase block">CHECKED OUT</span>
                  <span className="font-bold text-lg text-blue-900">{statusCounts.checkedOut}</span>
                </div>
                <div className="p-3 rounded border border-gray-200 bg-gray-50">
                  <span className="text-gray-600 font-semibold text-[10px] uppercase block">CANCELLED</span>
                  <span className="font-bold text-lg text-gray-700">{statusCounts.cancelled}</span>
                </div>
                <div className="p-3 rounded border border-red-200 bg-red-50/40">
                  <span className="text-red-800 font-semibold text-[10px] uppercase block">NO SHOW</span>
                  <span className="font-bold text-lg text-red-900">{statusCounts.noShow}</span>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
};
