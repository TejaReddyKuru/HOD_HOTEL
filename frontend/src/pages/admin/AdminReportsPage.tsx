import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Branch } from '../../types';
import { Download, BarChart3, TrendingUp, Calendar, CreditCard, Building2, Layers } from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get('/branches');
        if (res.data?.data) setBranches(res.data.data);
      } catch (err) {}
    };
    fetchBranches();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/dashboard', {
        params: { branchId: branchFilter },
      });
      if (res.data?.data) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [branchFilter]);

  const handleExportCsv = (type: 'bookings' | 'payments') => {
    const token = localStorage.getItem('hod_token');
    const branchQuery = branchFilter !== 'ALL' ? `&branchId=${branchFilter}` : '';
    const url = `/api/reports/export-csv?type=${type}${branchQuery}`;

    // Download using anchor tag with token in header or fetch blob
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `house-of-dreams-${type}-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => alert('Export failed'));
  };

  const cards = dashboardData?.cards || {};
  const statusCounts = dashboardData?.statusCounts || {};
  const methodBreakdown = dashboardData?.methodBreakdown || {};

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
            Intelligence & Export Ledger
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#242321]">
            Management Reports & Analytics
          </h1>
          <p className="text-xs text-gray-500">
            Generate and export revenue, branch occupancy, room utilization, and booking records to CSV.
          </p>
        </div>

        {/* CSV Export Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleExportCsv('bookings')}
            className="px-4 py-2 bg-[#242321] text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#B79A65] transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#B79A65]" />
            <span>Export Bookings CSV</span>
          </button>
          <button
            onClick={() => handleExportCsv('payments')}
            className="px-4 py-2 bg-[#5A4636] text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#242321] transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#B79A65]" />
            <span>Export Payments CSV</span>
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg border border-[#E8E2D7] shadow-sm flex items-center space-x-3 text-xs">
        <span className="font-semibold text-gray-700">Filter Branch:</span>
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="p-1.5 border rounded bg-[#F8F5EF] focus:outline-none"
        >
          <option value="ALL">All Branches Combined</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-2 border-[#B79A65] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-xs text-gray-500">Generating analytics report...</span>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Section 1: Revenue Metrics */}
          <div className="bg-white p-6 rounded-lg border border-[#E8E2D7] shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#242321] flex items-center space-x-2 border-b pb-3">
              <CreditCard className="w-5 h-5 text-[#B79A65]" />
              <span>Desk Revenue Analysis (No Online Gateway)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-[#F8F5EF] rounded border border-[#EFE8DC]">
                <span className="text-gray-500 block text-[10px] uppercase font-semibold">Today's Revenue</span>
                <span className="font-bold text-xl text-emerald-800">₹{(cards.todayRevenue || 0).toLocaleString()}</span>
              </div>
              <div className="p-4 bg-[#F8F5EF] rounded border border-[#EFE8DC]">
                <span className="text-gray-500 block text-[10px] uppercase font-semibold">Month-to-Date Revenue</span>
                <span className="font-bold text-xl text-emerald-800">₹{(cards.monthlyRevenue || 0).toLocaleString()}</span>
              </div>
              <div className="p-4 bg-[#F8F5EF] rounded border border-[#EFE8DC]">
                <span className="text-gray-500 block text-[10px] uppercase font-semibold">Pending Desk Balances</span>
                <span className="font-bold text-xl text-amber-800">₹{(cards.outstandingPayments || 0).toLocaleString()}</span>
              </div>
              <div className="p-4 bg-[#F8F5EF] rounded border border-[#EFE8DC]">
                <span className="text-gray-500 block text-[10px] uppercase font-semibold">Overall Occupancy Rate</span>
                <span className="font-bold text-xl text-purple-800">{cards.occupancyRate || 0}%</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <span className="text-[11px] font-semibold text-gray-700 block mb-2">Payment Method Breakdown</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 border rounded text-center">
                  <span className="text-gray-500 block text-[10px] uppercase">Cash</span>
                  <span className="font-bold text-base text-gray-900">₹{(methodBreakdown.CASH || 0).toLocaleString()}</span>
                </div>
                <div className="p-3 border rounded text-center">
                  <span className="text-gray-500 block text-[10px] uppercase">Card (POS)</span>
                  <span className="font-bold text-base text-gray-900">₹{(methodBreakdown.CARD || 0).toLocaleString()}</span>
                </div>
                <div className="p-3 border rounded text-center">
                  <span className="text-gray-500 block text-[10px] uppercase">UPI QR</span>
                  <span className="font-bold text-base text-gray-900">₹{(methodBreakdown.UPI || 0).toLocaleString()}</span>
                </div>
                <div className="p-3 border rounded text-center">
                  <span className="text-gray-500 block text-[10px] uppercase">Other</span>
                  <span className="font-bold text-base text-gray-900">₹{(methodBreakdown.OTHER || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Booking Lifecycle Report */}
          <div className="bg-white p-6 rounded-lg border border-[#E8E2D7] shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#242321] flex items-center space-x-2 border-b pb-3">
              <Calendar className="w-5 h-5 text-[#B79A65]" />
              <span>Booking Lifecycle Distribution</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-center">
              <div className="p-3 rounded border border-amber-200 bg-amber-50/50">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">Confirmed</span>
                <span className="font-bold text-xl text-amber-900">{statusCounts.confirmed || 0}</span>
              </div>
              <div className="p-3 rounded border border-emerald-200 bg-emerald-50/50">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Checked In</span>
                <span className="font-bold text-xl text-emerald-900">{statusCounts.checkedIn || 0}</span>
              </div>
              <div className="p-3 rounded border border-blue-200 bg-blue-50/50">
                <span className="text-[10px] uppercase font-bold text-blue-800 block">Checked Out</span>
                <span className="font-bold text-xl text-blue-900">{statusCounts.checkedOut || 0}</span>
              </div>
              <div className="p-3 rounded border border-gray-200 bg-gray-50">
                <span className="text-[10px] uppercase font-bold text-gray-600 block">Cancelled</span>
                <span className="font-bold text-xl text-gray-700">{statusCounts.cancelled || 0}</span>
              </div>
              <div className="p-3 rounded border border-red-200 bg-red-50/50">
                <span className="text-[10px] uppercase font-bold text-red-800 block">No Show</span>
                <span className="font-bold text-xl text-red-900">{statusCounts.noShow || 0}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Branch Performance Matrix */}
          <div className="bg-white p-6 rounded-lg border border-[#E8E2D7] shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#242321] flex items-center space-x-2 border-b pb-3">
              <Building2 className="w-5 h-5 text-[#B79A65]" />
              <span>Sanctuary Branch Performance</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F5EF] border-b text-gray-600 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Branch Sanctuary</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Total Rooms</th>
                    <th className="py-2.5 px-3">Occupied</th>
                    <th className="py-2.5 px-3">Occupancy %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dashboardData?.branchOccupancy?.map((bo: any) => (
                    <tr key={bo.id}>
                      <td className="py-3 px-3 font-semibold text-gray-900">{bo.name}</td>
                      <td className="py-3 px-3 text-gray-600">{bo.city}</td>
                      <td className="py-3 px-3">{bo.totalRooms}</td>
                      <td className="py-3 px-3 text-blue-700 font-medium">{bo.occupiedRooms}</td>
                      <td className="py-3 px-3 font-bold text-[#B79A65]">{bo.occupancyRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
