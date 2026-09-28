import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Menu, X, User, LogOut, Calendar, ShieldCheck, Compass, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const brandName = settings.hotel_name || 'HOUSE OF DREAMS';
  const tagline = settings.hotel_tagline || 'Stay. Relax. Dream.';

  return (
    <header className="sticky top-0 z-50 bg-[#F8F5EF]/95 backdrop-blur-md border-b border-[#EFE8DC] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex flex-col group">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-widest text-[#242321] group-hover:text-[#B79A65] transition-colors uppercase">
              {brandName}
            </span>
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#766F66] font-medium -mt-1">
              {tagline}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm tracking-wider uppercase transition-colors font-medium ${
                isActive('/') ? 'text-[#B79A65] font-semibold' : 'text-[#242321] hover:text-[#B79A65]'
              }`}
            >
              Home
            </Link>
            <Link
              to="/story"
              className={`text-sm tracking-wider uppercase transition-colors font-medium ${
                isActive('/story') ? 'text-[#B79A65] font-semibold' : 'text-[#242321] hover:text-[#B79A65]'
              }`}
            >
              Our Story
            </Link>
            <Link
              to="/branches"
              className={`text-sm tracking-wider uppercase transition-colors font-medium ${
                isActive('/branches') ? 'text-[#B79A65] font-semibold' : 'text-[#242321] hover:text-[#B79A65]'
              }`}
            >
              Branches
            </Link>
            <Link
              to="/rooms"
              className={`text-sm tracking-wider uppercase transition-colors font-medium ${
                isActive('/rooms') ? 'text-[#B79A65] font-semibold' : 'text-[#242321] hover:text-[#B79A65]'
              }`}
            >
              Rooms
            </Link>
            <Link
              to="/contact"
              className={`text-sm tracking-wider uppercase transition-colors font-medium ${
                isActive('/contact') ? 'text-[#B79A65] font-semibold' : 'text-[#242321] hover:text-[#B79A65]'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* User & Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {role === 'ADMIN' && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#242321] text-[#F8F5EF] text-xs uppercase tracking-wider font-medium hover:bg-[#5A4636] transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#B79A65]" />
                    <span>Admin Portal</span>
                  </Link>
                )}

                {role === 'RECEPTION' && (
                  <Link
                    to="/reception/dashboard"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#5A4636] text-[#F8F5EF] text-xs uppercase tracking-wider font-medium hover:bg-[#242321] transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#B79A65]" />
                    <span>Front Desk ({user?.branch?.name?.split('-')[1]?.trim() || 'Assigned Branch'})</span>
                  </Link>
                )}

                {role === 'CUSTOMER' && (
                  <Link
                    to="/customer/bookings"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-[#B79A65] text-[#5A4636] text-xs uppercase tracking-wider font-medium hover:bg-[#B79A65]/10 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#B79A65]" />
                    <span>My Bookings</span>
                  </Link>
                )}

                <Link
                  to={role === 'CUSTOMER' ? '/customer/profile' : '#'}
                  className="flex items-center space-x-1.5 text-sm text-[#242321] font-medium hover:text-[#B79A65]"
                >
                  <User className="w-4 h-4 text-[#766F66]" />
                  <span>{user?.name?.split(' ')[0]}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 text-[#766F66] hover:text-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-xs uppercase tracking-widest font-medium text-[#242321] hover:text-[#B79A65] transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/rooms"
                  className="px-5 py-2.5 rounded bg-[#242321] text-[#F8F5EF] text-xs uppercase tracking-widest font-medium hover:bg-[#B79A65] hover:text-white transition-all shadow-sm flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#B79A65]" />
                  <span>Book Now</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#242321] hover:text-[#B79A65]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F8F5EF] border-b border-[#EFE8DC] px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm tracking-wider uppercase font-medium text-[#242321]"
          >
            Home
          </Link>
          <Link
            to="/story"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm tracking-wider uppercase font-medium text-[#242321]"
          >
            Our Story
          </Link>
          <Link
            to="/branches"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm tracking-wider uppercase font-medium text-[#242321]"
          >
            Branches
          </Link>
          <Link
            to="/rooms"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm tracking-wider uppercase font-medium text-[#242321]"
          >
            Rooms
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm tracking-wider uppercase font-medium text-[#242321]"
          >
            Contact
          </Link>

          <div className="pt-4 border-t border-[#EFE8DC] space-y-2">
            {isAuthenticated ? (
              <>
                <div className="text-xs text-[#766F66]">Signed in as {user?.name} ({role})</div>
                {role === 'ADMIN' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-xs uppercase tracking-wider text-[#B79A65] font-semibold"
                  >
                    Go to Admin Portal
                  </Link>
                )}
                {role === 'RECEPTION' && (
                  <Link
                    to="/reception/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-xs uppercase tracking-wider text-[#B79A65] font-semibold"
                  >
                    Go to Front Desk Portal
                  </Link>
                )}
                {role === 'CUSTOMER' && (
                  <Link
                    to="/customer/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-xs uppercase tracking-wider text-[#B79A65] font-semibold"
                  >
                    My Bookings
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-sm text-red-700 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 border border-[#242321] text-xs uppercase tracking-wider font-medium text-[#242321]"
                >
                  Sign In
                </Link>
                <Link
                  to="/rooms"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 bg-[#242321] text-[#F8F5EF] text-xs uppercase tracking-wider font-medium"
                >
                  Book Your Stay
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
