import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  const brandName = settings.hotel_name || 'HOUSE OF DREAMS';
  const tagline = settings.hotel_tagline || 'Stay. Relax. Dream.';
  const philosophy = settings.hotel_philosophy || 
    'At House of Dreams, we believe a hotel should be more than four walls and a bed. It is a quiet sanctuary to pause, reconnect, and create memories worth keeping.';
  const phone = settings.contact_phone || '+91 1800 200 4663';
  const email = settings.contact_email || 'concierge@houseofdreams.com';
  const paymentPolicy = settings.payment_policy || 'Desk Payment Only • Zero Online Gateway Risk';
  const cancellationPolicy = settings.cancellation_policy || 'Free up to 48 hrs before check-in.';

  return (
    <footer className="bg-[#242321] text-[#EFE8DC] pt-16 pb-12 border-t border-[#33312E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Philosophy */}
          <div className="space-y-4">
            <span className="font-serif text-2xl font-bold tracking-widest text-[#F8F5EF] block uppercase">
              {brandName}
            </span>
            <p className="text-xs uppercase tracking-[0.25em] text-[#B79A65] font-medium">
              {tagline}
            </p>
            <p className="text-sm text-[#A59D92] leading-relaxed">
              {philosophy}
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs text-[#B79A65]">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-2">{paymentPolicy}</span>
            </div>
          </div>

          {/* Our Branches */}
          <div>
            <h4 className="font-serif text-lg text-[#F8F5EF] mb-4">Our Sanctuaries</h4>
            <ul className="space-y-3 text-sm text-[#A59D92]">
              <li>
                <Link to="/branches" className="hover:text-[#B79A65] transition-colors block">
                  <span className="font-medium text-[#EFE8DC]">Udaipur Heritage Palace</span>
                  <span className="block text-xs text-[#766F66]">Lake Pichola Boulevard, Rajasthan</span>
                </Link>
              </li>
              <li>
                <Link to="/branches" className="hover:text-[#B79A65] transition-colors block">
                  <span className="font-medium text-[#EFE8DC]">Shimla Misty Pines</span>
                  <span className="block text-xs text-[#766F66]">Observatory Hill Heights, Himachal</span>
                </Link>
              </li>
              <li>
                <Link to="/branches" className="hover:text-[#B79A65] transition-colors block">
                  <span className="font-medium text-[#EFE8DC]">Goa Palm Serenity</span>
                  <span className="block text-xs text-[#766F66]">Sunset Beach, Cavelossim, South Goa</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg text-[#F8F5EF] mb-4">Experience</h4>
            <ul className="space-y-2.5 text-sm text-[#A59D92]">
              <li>
                <Link to="/story" className="hover:text-[#B79A65] transition-colors">Our Philosophy</Link>
              </li>
              <li>
                <Link to="/rooms" className="hover:text-[#B79A65] transition-colors">Luxury Suites & Chalets</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#B79A65] transition-colors">Concierge & Helpline</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#B79A65] transition-colors">Staff & Guest Sign In</Link>
              </li>
              <li>
                <span className="text-xs text-[#766F66] block pt-1 line-clamp-2" title={cancellationPolicy}>
                  Cancellation: {cancellationPolicy}
                </span>
              </li>
            </ul>
          </div>

          {/* Contact & Desk Info */}
          <div>
            <h4 className="font-serif text-lg text-[#F8F5EF] mb-4">Concierge Desk</h4>
            <div className="space-y-3 text-sm text-[#A59D92]">
              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-[#B79A65] mt-1 flex-shrink-0" />
                <a 
                  href={`tel:${phone.replace(/\s+/g, '')}`} 
                  className="hover:text-[#B79A65] transition-colors"
                >
                  {phone} (Toll-Free 24/7)
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-[#B79A65] mt-1 flex-shrink-0" />
                <a 
                  href={`mailto:${email}`} 
                  className="hover:text-[#B79A65] transition-colors break-all"
                >
                  {email}
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-[#B79A65] mt-1 flex-shrink-0" />
                <span>Corporate Office: Nariman Point, Mumbai</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#33312E] flex flex-col md:flex-row items-center justify-between text-xs text-[#766F66] space-y-4 md:space-y-0">
          <div>
            © {new Date().getFullYear()} {brandName} Hotels & Resorts Ltd. All rights reserved.
          </div>
          <div className="italic font-serif text-[#A59D92] text-sm">
            "{philosophy}"
          </div>
          <div className="flex items-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-[#B79A65] fill-[#B79A65]" />
            <span>for peaceful stays</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

