import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Branch } from '../../types';
import { MapPin, Phone, Mail, Clock, ArrowRight, ShieldCheck, Star } from 'lucide-react';

export const BranchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const res = await api.get(`/branches/${id}`);
        if (res.data?.data) {
          setBranch(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load branch detail:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBranch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#B79A65] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <h2 className="font-serif text-2xl font-bold">Branch Not Found</h2>
        <Link to="/branches" className="mt-4 inline-block text-xs uppercase tracking-widest text-[#B79A65]">
          Back to all branches
        </Link>
      </div>
    );
  }

  let images: string[] = [];
  try {
    images = JSON.parse(branch.images || '[]');
  } catch {
    images = [];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Branch Header */}
      <div className="space-y-4">
        <span className="text-xs uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
          {branch.city}, {branch.state}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#242321]">
          {branch.name}
        </h1>
        <p className="text-sm text-[#5A4636] max-w-3xl leading-relaxed">
          {branch.description}
        </p>
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((img, idx) => (
          <div key={idx} className="h-64 rounded-lg overflow-hidden shadow-sm">
            <img src={img} alt={`${branch.name} ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
        ))}
      </div>

      {/* Contact & Timings Bar */}
      <div className="bg-white p-6 rounded-lg border border-[#EFE8DC] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-[#B79A65]" />
          <span>{branch.address}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4 text-[#B79A65]" />
          <span>{branch.phone}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[#B79A65]" />
          <span>Check-in: {branch.checkInTime} / Check-out: {branch.checkOutTime}</span>
        </div>
        <div className="flex items-center space-x-2 text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-[#B79A65]" />
          <span>Desk Payment Only (Cash/Card/UPI)</span>
        </div>
      </div>

      {/* CTA to rooms */}
      <div className="text-center pt-8">
        <Link
          to={`/rooms?branchId=${branch.id}`}
          className="px-8 py-3.5 bg-[#242321] text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#B79A65] transition-colors inline-flex items-center space-x-2 shadow-lg"
        >
          <span>View Available Rooms in {branch.city}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
