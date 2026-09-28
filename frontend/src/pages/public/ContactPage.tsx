import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();
  const [submitted, setSubmitted] = useState(false);

  const phone = settings.contact_phone || '+91 1800 200 4663';
  const email = settings.contact_email || 'concierge@houseofdreams.com';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-[0.3em] text-[#B79A65] font-semibold">
          Get in Touch
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#242321]">
          Concierge & Support
        </h1>
        <p className="text-sm text-[#766F66]">
          Our hospitality team is available round-the-clock to answer inquiries and assist with your stay.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Contact Info */}
        <div className="bg-white p-8 rounded-lg border border-[#EFE8DC] space-y-6">
          <h3 className="font-serif text-2xl font-bold text-[#242321]">
            Central Helpdesk
          </h3>

          <div className="space-y-4 text-sm text-[#5A4636]">
            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-[#B79A65] mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold block text-[#242321]">Toll-Free Reservations (24/7)</span>
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-[#B79A65] transition-colors">
                  {phone}
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-[#B79A65] mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold block text-[#242321]">Concierge Inquiries</span>
                <a href={`mailto:${email}`} className="hover:text-[#B79A65] transition-colors">
                  {email}
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-[#B79A65] mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold block text-[#242321]">Headquarters</span>
                <span>House of Dreams Corporate Tower, Nariman Point, Mumbai 400021</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-[#B79A65] mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold block text-[#242321]">Front Desk Hours</span>
                <span>All hotel branch front desks are staffed 24 hours a day, 7 days a week.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-white p-8 rounded-lg border border-[#EFE8DC] space-y-6">
          <h3 className="font-serif text-2xl font-bold text-[#242321]">
            Send an Inquiry
          </h3>

          {submitted ? (
            <div className="p-8 text-center space-y-3 bg-[#F8F5EF] rounded border border-[#EFE8DC]">
              <CheckCircle className="w-8 h-8 text-emerald-700 mx-auto" />
              <p className="font-bold text-sm text-[#242321]">Message Received</p>
              <p className="text-xs text-[#766F66]">
                Our concierge will get back to you within 2 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A4636] mb-1">
                  Message / Inquiry
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we make your stay extraordinary?"
                  className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#242321] text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#B79A65] transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="w-3.5 h-3.5 text-[#B79A65]" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
