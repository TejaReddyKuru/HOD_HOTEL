import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Settings, Save, CheckCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const AdminSettingsPage: React.FC = () => {
  const { refreshSettings } = useSettings();
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.data?.map) {
        setSettingsMap(res.data.map);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, val: string) => {
    setSettingsMap((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      for (const [key, value] of Object.entries(settingsMap)) {
        await api.put(`/settings/${key}`, { value });
      }
      await refreshSettings();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
          Configuration & Policies
        </span>
        <h1 className="font-serif text-2xl font-bold text-[#242321]">
          Global Hotel Operating Settings
        </h1>
        <p className="text-xs text-gray-500">
          Configure corporate contact, branding, GST rates, and desk payment policies.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-700" />
          <span>Hotel settings updated successfully across all branches.</span>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-2 border-[#B79A65] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-lg border border-[#E8E2D7] shadow-sm space-y-6 text-xs">
          
          <div className="space-y-4">
            <h3 className="font-serif text-sm font-bold text-[#242321] border-b pb-2 uppercase tracking-wider text-[11px]">
              Brand & Identity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Hotel Brand Name</label>
                <input
                  type="text"
                  value={settingsMap.hotel_name || 'House of Dreams'}
                  onChange={(e) => handleChange('hotel_name', e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={settingsMap.hotel_tagline || 'Stay. Relax. Dream.'}
                  onChange={(e) => handleChange('hotel_tagline', e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">Brand Philosophy</label>
              <input
                type="text"
                value={settingsMap.hotel_philosophy || 'More Than Just a Stay.'}
                onChange={(e) => handleChange('hotel_philosophy', e.target.value)}
                className="w-full p-2 border rounded focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-serif text-sm font-bold text-[#242321] border-b pb-2 uppercase tracking-wider text-[11px]">
              Central Contacts & Operating Timings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Toll-Free Helpline</label>
                <input
                  type="text"
                  value={settingsMap.contact_phone || '+91 1800 200 4663'}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Inquiries Email</label>
                <input
                  type="email"
                  value={settingsMap.contact_email || 'concierge@houseofdreams.com'}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Default Check-in Time</label>
                <input
                  type="text"
                  value={settingsMap.default_checkin_time || '14:00'}
                  onChange={(e) => handleChange('default_checkin_time', e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Default Check-out Time</label>
                <input
                  type="text"
                  value={settingsMap.default_checkout_time || '11:00'}
                  onChange={(e) => handleChange('default_checkout_time', e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Goods & Services Tax (GST %)</label>
                <input
                  type="number"
                  value={settingsMap.tax_rate_percentage || '12'}
                  onChange={(e) => handleChange('tax_rate_percentage', e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-serif text-sm font-bold text-[#242321] border-b pb-2 uppercase tracking-wider text-[11px]">
              Policies
            </h3>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Cancellation Policy Text</label>
              <textarea
                rows={2}
                value={settingsMap.cancellation_policy || ''}
                onChange={(e) => handleChange('cancellation_policy', e.target.value)}
                className="w-full p-2 border rounded focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Desk Payment Policy Text</label>
              <textarea
                rows={2}
                value={settingsMap.payment_policy || ''}
                onChange={(e) => handleChange('payment_policy', e.target.value)}
                className="w-full p-2 border rounded focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#242321] text-white uppercase tracking-wider font-semibold rounded hover:bg-[#B79A65] transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
