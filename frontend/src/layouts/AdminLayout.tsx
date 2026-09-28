import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Layers,
  Sparkles,
  CalendarCheck,
  Users,
  UserCheck,
  CreditCard,
  BarChart3,
  Tag,
  Star,
  Settings,
  ShieldAlert,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Hotel,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Branches', path: '/admin/branches', icon: Building2 },
    { label: 'Rooms', path: '/admin/rooms', icon: BedDouble },
    { label: 'Room Types', path: '/admin/room-types', icon: Layers },
    { label: 'Amenities', path: '/admin/amenities', icon: Sparkles },
    { label: 'All Bookings', path: '/admin/bookings', icon: CalendarCheck },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Reception Staff', path: '/admin/reception', icon: UserCheck },
    { label: 'Desk Payments', path: '/admin/payments', icon: CreditCard },
    { label: 'Revenue & Reports', path: '/admin/reports', icon: BarChart3 },
    { label: 'Offers & Coupons', path: '/admin/offers', icon: Tag },
    { label: 'Guest Reviews', path: '/admin/reviews', icon: Star },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
    { label: 'Audit Trail', path: '/admin/audit-logs', icon: ShieldAlert },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F4EFE6] flex text-[#242321]">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#242321] text-[#EFE8DC] flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-[#383531] flex items-center justify-between">
          <Link to="/" className="flex flex-col group">
            <span className="font-serif text-lg font-bold tracking-widest text-[#F8F5EF] group-hover:text-[#B79A65] transition-colors">
              HOUSE OF DREAMS
            </span>
            <span className="text-[9px] tracking-[0.25em] uppercase text-[#B79A65] font-semibold">
              Admin Executive Suite
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-md text-xs uppercase tracking-wider font-medium transition-colors ${
                  active
                    ? 'bg-[#B79A65] text-white shadow-sm font-semibold'
                    : 'text-[#C5BCB1] hover:bg-[#2F2C29] hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#B79A65]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#383531] space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs text-[#A59D92] hover:text-white hover:bg-[#2F2C29] rounded transition-colors"
          >
            <span className="flex items-center space-x-2">
              <Hotel className="w-4 h-4 text-[#B79A65]" />
              <span>Public Website</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-[#2F2C29] rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="bg-white border-b border-[#E8E2D7] h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-700 hover:text-black"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="text-xs text-gray-500 hidden sm:block">
              Multi-Branch Global Management • <span className="text-emerald-700 font-semibold">PostgreSQL Live</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-xs font-bold text-gray-900">{user?.name}</div>
              <div className="text-[10px] uppercase tracking-wider text-[#B79A65] font-semibold">Hotel Owner / Admin</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#B79A65] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
};
