import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, Coffee, ShieldCheck } from 'lucide-react';

export const StoryPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] text-[#B79A65] font-semibold">
          Our Philosophy
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-[#242321]">
          More Than Just a Stay.
        </h1>
        <p className="text-xs uppercase tracking-[0.25em] text-[#766F66]">
          "Stay. Relax. Dream."
        </p>
      </div>

      {/* Main Narrative */}
      <div className="bg-white p-8 sm:p-14 rounded-lg border border-[#EFE8DC] shadow-sm space-y-8 text-base sm:text-lg text-[#5A4636] font-light leading-relaxed">
        <p className="font-serif text-2xl text-[#242321] italic font-normal">
          At House of Dreams, we believe a hotel should be more than four walls and a comfortable bed.
        </p>

        <p>
          It should be a place where you can slow down after a long journey, wake up feeling refreshed,
          spend meaningful time with the people you love, and leave with memories worth keeping.
        </p>

        <p>
          Our goal is simple — to make every guest feel welcomed, comfortable, and cared for.
          Whether it is watching the sunset illuminate the marble domes of Lake Pichola in Udaipur,
          inhaling the crisp cedar pine breezes atop Shimla’s misty ridges, or walking barefoot along the
          tranquil sands of South Goa, our sanctuaries are dedicated to peaceful living.
        </p>

        <div className="pt-6 border-t border-[#EFE8DC] grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
          <div className="space-y-1">
            <span className="font-serif text-2xl font-bold text-[#242321] block">3</span>
            <span className="text-[#766F66] uppercase tracking-wider">Sanctuaries</span>
          </div>
          <div className="space-y-1">
            <span className="font-serif text-2xl font-bold text-[#242321] block">21+</span>
            <span className="text-[#766F66] uppercase tracking-wider">Luxury Rooms & Suites</span>
          </div>
          <div className="space-y-1">
            <span className="font-serif text-2xl font-bold text-[#242321] block">100%</span>
            <span className="text-[#766F66] uppercase tracking-wider">Desk Payment Peace of Mind</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4">
        <h3 className="font-serif text-2xl font-bold text-[#242321]">
          Come as a Guest. Leave with a Memory.
        </h3>
        <Link
          to="/rooms"
          className="inline-flex items-center space-x-2 px-8 py-3 bg-[#242321] text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#B79A65] transition-colors"
        >
          <span>Reserve Your Room</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};
