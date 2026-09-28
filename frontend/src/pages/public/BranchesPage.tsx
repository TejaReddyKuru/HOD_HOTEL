import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Branch } from '../../types';
import { MapPin, Phone, Mail, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export const BranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get('/branches');
        if (res.data?.data) {
          setBranches(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load branches:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-[0.3em] text-[#B79A65] font-semibold">
          Our Destinations
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#242321]">
          Sanctuaries Across India
        </h1>
        <p className="text-sm text-[#766F66] leading-relaxed">
          From the regal lakeside vistas of Rajasthan to the cool pine forests of Himachal and the sun-drenched palms of Goa, each House of Dreams destination is an oasis of calm.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-[#B79A65] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-12">
          {branches.map((branch, index) => {
            const isReversed = index % 2 === 1;
            return (
              <div
                key={branch.id}
                className={`bg-white rounded-lg border border-[#EFE8DC] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col ${
                  isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'
                }`}
              >
                {/* Branch Image */}
                <div className="lg:w-1/2 h-72 sm:h-96 relative overflow-hidden">
                  <img
                    src={branch.featuredImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'}
                    alt={branch.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-[#242321]/80 backdrop-blur-sm text-white px-3 py-1 rounded text-xs uppercase tracking-wider font-semibold">
                    {branch.city}, {branch.state}
                  </div>
                </div>

                {/* Branch Details */}
                <div className="lg:w-1/2 p-8 sm:p-12 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#242321]">
                      {branch.name}
                    </h2>
                    <p className="text-sm text-[#5A4636] leading-relaxed">
                      {branch.description}
                    </p>

                    <div className="pt-2 space-y-2 text-xs text-[#766F66]">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-[#B79A65] flex-shrink-0" />
                        <span>{branch.address}, {branch.city}, {branch.state} - {branch.pincode}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-[#B79A65] flex-shrink-0" />
                        <span>{branch.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-[#B79A65] flex-shrink-0" />
                        <span>{branch.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-[#B79A65] flex-shrink-0" />
                        <span>Check-in: {branch.checkInTime} • Check-out: {branch.checkOutTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#EFE8DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs text-[#5A4636]">
                      <span className="font-bold text-base text-[#242321]">{branch._count?.rooms || 7}</span> Rooms Available
                    </div>
                    <Link
                      to={`/rooms?branchId=${branch.id}`}
                      className="px-6 py-2.5 bg-[#242321] text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#B79A65] transition-colors inline-flex items-center justify-center space-x-2"
                    >
                      <span>Explore Rooms</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
