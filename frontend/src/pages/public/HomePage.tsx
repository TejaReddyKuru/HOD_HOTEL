import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { Branch, Room, Review } from '../../types';
import {
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Star,
  Sparkles,
  Heart,
  Coffee,
  CheckCircle,
  Clock,
  Compass,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search Widget State
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [checkIn, setCheckIn] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [checkOut, setCheckOut] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });
  const [guests, setGuests] = useState<number>(2);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesRes, reviewsRes] = await Promise.all([
          api.get('/branches'),
          api.get('/reviews'),
        ]);

        if (branchesRes.data?.data) {
          setBranches(branchesRes.data.data);
          if (branchesRes.data.data.length > 0) {
            setSelectedBranch(branchesRes.data.data[0].id);
          }
        }

        if (reviewsRes.data?.data) {
          setReviews(reviewsRes.data.data.slice(0, 3));
        }

        // Fetch sample rooms
        const roomsRes = await api.get('/rooms/search', {
          params: {
            branchId: branchesRes.data?.data[0]?.id || '',
            checkInDate: checkIn,
            checkOutDate: checkOut,
          },
        });
        if (roomsRes.data?.data?.rooms) {
          setRooms(roomsRes.data.data.rooms.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/rooms?branchId=${selectedBranch}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
    );
  };

  return (
    <div className="space-y-24 sm:space-y-32">
      
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Warm Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85"
            alt="House of Dreams Luxury Sanctuary"
            className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#242321] via-black/40 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white space-y-6 pt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#242321]/80 backdrop-blur-md border border-[#B79A65]/40 text-[#B79A65] text-xs uppercase tracking-[0.25em]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to House of Dreams</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#F8F5EF] leading-tight"
          >
            Stay. Relax. Dream.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-xl text-[#EFE8DC]/90 max-w-2xl mx-auto font-light leading-relaxed"
          >
            A peaceful place to pause, reconnect, and make beautiful memories.
            Handcrafted sanctuaries nestled across serene heritage and nature destinations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <a
              href="#search-widget"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#B79A65] text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#9F824F] transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <span>Book Your Stay</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              to="/rooms"
              className="w-full sm:w-auto px-8 py-3.5 bg-white/10 backdrop-blur-md text-white border border-white/20 text-xs uppercase tracking-widest font-semibold rounded hover:bg-white/20 transition-all"
            >
              Explore Rooms
            </Link>
          </motion.div>

          {/* Desk Payment Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="pt-6 flex items-center justify-center space-x-2 text-xs text-[#EFE8DC]/80"
          >
            <ShieldCheck className="w-4 h-4 text-[#B79A65]" />
            <span>Zero online payment risk • Physical desk payment at hotel reception</span>
          </motion.div>
        </div>
      </section>

      {/* 2. BOOKING SEARCH WIDGET */}
      <section id="search-widget" className="max-w-6xl mx-auto px-4 -mt-16 sm:-mt-24 relative z-20">
        <div className="bg-white rounded-lg shadow-xl border border-[#EFE8DC] p-6 sm:p-8">
          <div className="mb-4 text-center sm:text-left">
            <h3 className="font-serif text-xl font-bold text-[#242321]">
              Find Your Ideal Sanctuary
            </h3>
            <p className="text-xs text-[#766F66]">
              Real-time room availability checked directly across all branches.
            </p>
          </div>

          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Branch Selector */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A4636] mb-1.5">
                Destination / Branch
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#B79A65]" />
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-sm text-[#242321] focus:ring-1 focus:ring-[#B79A65] focus:outline-none"
                  required
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Check-in Date */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A4636] mb-1.5">
                Check-in Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-[#B79A65]" />
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-sm text-[#242321] focus:ring-1 focus:ring-[#B79A65] focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Check-out Date */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A4636] mb-1.5">
                Check-out Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-[#B79A65]" />
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-sm text-[#242321] focus:ring-1 focus:ring-[#B79A65] focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full py-3 bg-[#242321] text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#B79A65] transition-colors shadow-md flex items-center justify-center space-x-2"
              >
                <span>Check Availability</span>
                <ArrowRight className="w-4 h-4 text-[#B79A65]" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 3. OUR MOTIVE / PHILOSOPHY */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <span className="text-xs uppercase tracking-[0.3em] text-[#B79A65] font-semibold">
          Our Brand Philosophy
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#242321]">
          More Than Just a Stay.
        </h2>
        <div className="w-16 h-0.5 bg-[#B79A65] mx-auto" />
        <blockquote className="text-base sm:text-lg text-[#5A4636] font-light leading-relaxed space-y-4">
          <p>
            At House of Dreams, we believe a hotel should be more than four walls and a comfortable bed.
          </p>
          <p>
            It should be a place where you can slow down after a long journey, wake up feeling refreshed,
            spend meaningful time with the people you love, and leave with memories worth keeping.
          </p>
          <p className="font-normal text-[#242321]">
            Our goal is simple — to make every guest feel welcomed, comfortable, and cared for.
          </p>
        </blockquote>
      </section>

      {/* 4. FEATURED BRANCHES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
              Destinations
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#242321]">
              Our Signature Sanctuaries
            </h2>
          </div>
          <Link
            to="/branches"
            className="mt-4 sm:mt-0 text-xs uppercase tracking-widest font-semibold text-[#5A4636] hover:text-[#B79A65] flex items-center space-x-1"
          >
            <span>View All Branches</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {branches.map((b) => (
            <div
              key={b.id}
              className="group bg-white rounded-lg overflow-hidden border border-[#EFE8DC] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={b.featuredImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'}
                  alt={b.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#242321]/80 backdrop-blur-sm text-white px-3 py-1 rounded text-[11px] uppercase tracking-wider font-semibold">
                  {b.city}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#242321] group-hover:text-[#B79A65] transition-colors">
                    {b.name}
                  </h3>
                  <p className="text-xs text-[#766F66] line-clamp-3 mt-2 leading-relaxed">
                    {b.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-[#EFE8DC] flex items-center justify-between">
                  <div className="text-xs text-[#5A4636]">
                    <span className="font-semibold">{b._count?.rooms || 7}</span> Luxury Rooms
                  </div>
                  <Link
                    to={`/branches/${b.id}`}
                    className="text-xs uppercase tracking-widest font-semibold text-[#B79A65] group-hover:translate-x-1 transition-transform inline-flex items-center space-x-1"
                  >
                    <span>Explore Branch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WHY HOUSE OF DREAMS */}
      <section className="bg-[#EFE8DC]/50 py-20 border-y border-[#EFE8DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
              The Experience
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#242321]">
              Why Choose House of Dreams
            </h2>
            <p className="text-sm text-[#766F66]">
              Every touchpoint is thoughtfully designed to bring calmness and comfort to your stay.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Supreme Comfort',
                desc: 'Handcrafted Egyptian cotton linens, custom orthopaedic mattresses, and quiet soundproofed rooms.',
                icon: Heart,
              },
              {
                title: 'Warm Hospitality',
                desc: 'Personalized attention from our front desk concierges, treating every guest as cherished family.',
                icon: Coffee,
              },
              {
                title: 'Peace & Serenity',
                desc: 'Peaceful garden courtyards, mountain mist sit-outs, and ocean vistas away from crowded chaos.',
                icon: Sparkles,
              },
              {
                title: 'Desk Payment Only',
                desc: 'Zero online gateway headaches or bank frauds. Pay directly with Cash, POS Card, or UPI at reception.',
                icon: ShieldCheck,
              },
              {
                title: 'Spotless Cleanliness',
                desc: 'Dedicated housekeeping protocols ensuring rooms transition from cleaning to immaculate perfection.',
                icon: CheckCircle,
              },
              {
                title: 'Memorable Experiences',
                desc: 'From lakeside sunsets to crisp Himalayan mornings, every moment is crafted to be cherished.',
                icon: Compass,
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="bg-white p-8 rounded-lg border border-[#EFE8DC] space-y-3 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-[#F8F5EF] text-[#B79A65] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[#242321]">{feature.title}</h4>
                  <p className="text-xs text-[#766F66] leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. GUEST REVIEWS */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
            Heartfelt Words
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#242321]">
            Guest Experiences
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white p-6 rounded-lg border border-[#EFE8DC] shadow-sm space-y-4">
              <div className="flex items-center space-x-1 text-[#B79A65]">
                {[...Array(r.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-[#5A4636] italic leading-relaxed">
                "{r.comment}"
              </p>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="font-bold text-[#242321]">{r.customer?.name}</span>
                <span className="text-gray-400">{r.branch?.name?.split('-')[1]?.trim()}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. SIGNATURE CTA SECTION */}
      <section className="relative py-24 bg-[#242321] text-white text-center overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto px-4 space-y-6">
          <span className="text-xs uppercase tracking-[0.3em] text-[#B79A65] font-semibold">
            An Unhurried Invitation
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#F8F5EF] leading-tight">
            Come as a Guest.<br />Leave with a Memory.
          </h2>
          <blockquote className="text-sm sm:text-base text-[#DCD4CB] font-light leading-relaxed max-w-xl mx-auto space-y-2">
            <p>Some journeys are about the destination.</p>
            <p>Some are about the people you meet along the way.</p>
            <p>And sometimes, they're simply about finding a quiet place to breathe.</p>
            <p className="font-serif italic text-[#B79A65] pt-2">Welcome to House of Dreams.</p>
          </blockquote>
          <div className="pt-4">
            <Link
              to="/rooms"
              className="inline-flex items-center space-x-2 px-8 py-3.5 bg-[#B79A65] text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#9F824F] transition-all shadow-xl"
            >
              <span>Book Your Stay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
