import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  UserPlus,
  CalendarCheck,
  BedDouble,
  CreditCard,
  LogOut,
  Menu,
  X,
  Building,
} from 'lucide-react';

export const ReceptionLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Front Desk Dashboard', path: '/reception/dashboard', icon: Compass },
    { label: 'New Walk-in Booking', path: '/reception/walk-in', icon: UserPlus },
    { label: 'Bookings & Stays', path: '/reception/bookings', icon: CalendarCheck },
    { label: 'Room Grid & Cleaning', path: '/reception/rooms', icon: BedDouble },
    { label: 'Desk Payments Log', path: '/reception/payments', icon: CreditCard },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const branchName = user?.branch?.name || 'Assigned Branch';
  const branchCity = user?.branch?.city || 'Hotel';

  return (
    <div className="min-h-screen bg-[#F4EFE6] flex text-[#242321]">
      
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#3E3127] text-[#EFE8DC] flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand & Branch Badge */}
        <div className="p-6 border-b border-[#524236] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-widest text-[#F8F5EF]">
              HOUSE OF DREAMS
            </span>
            <span className="text-[10px] tracking-wider uppercase text-[#B79A65] font-semibold flex items-center space-x-1 mt-0.5">
              <Building className="w-3 h-3" />
              <span>{branchCity} Desk</span>
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Branch Info Card */}
        <div className="mx-3 mt-4 p-3 bg-[#30261E] rounded border border-[#524236] text-xs">
          <span className="text-gray-400 block text-[10px] uppercase tracking-wider">Active Station</span>
          <span className="font-semibold text-white truncate block">{branchName}</span>
          <span className="text-[11px] text-[#B79A65] block mt-0.5">Desk Payment Collection Only</span>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded text-xs uppercase tracking-wider font-medium transition-colors ${
                  active
                    ? 'bg-[#B79A65] text-white shadow-sm font-semibold'
                    : 'text-[#DCD4CB] hover:bg-[#4E3E32] hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#B79A65]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Sign Out */}
        <div className="p-4 border-t border-[#524236]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-300 hover:text-red-100 hover:bg-[#4E3E32] rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Desk</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header */}
        <header className="bg-white border-b border-[#E8E2D7] h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-700 hover:text-black"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="text-xs text-gray-600">
              Reception Desk: <strong className="text-gray-900">{branchName}</strong>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/reception/walk-in"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-[#242321] text-white text-xs uppercase tracking-wider font-medium rounded hover:bg-[#B79A65] transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#B79A65]" />
              <span>New Walk-in</span>
            </Link>

            <div className="text-right">
              <div className="text-xs font-bold text-gray-900">{user?.name}</div>
              <div className="text-[10px] uppercase tracking-wider text-[#766F66]">Reception Officer</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#5A4636] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {user?.name?.charAt(0) || 'R'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
};
