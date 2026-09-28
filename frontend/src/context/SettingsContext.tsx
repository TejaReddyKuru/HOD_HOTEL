import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface SettingsMap {
  hotel_name?: string;
  hotel_tagline?: string;
  hotel_philosophy?: string;
  contact_phone?: string;
  contact_email?: string;
  cancellation_policy?: string;
  payment_policy?: string;
  default_checkin_time?: string;
  default_checkout_time?: string;
  tax_rate_percentage?: string;
  [key: string]: string | undefined;
}

interface SettingsContextType {
  settings: SettingsMap;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: SettingsMap = {
  hotel_name: 'House of Dreams',
  hotel_tagline: 'Stay. Relax. Dream.',
  hotel_philosophy: 'More Than Just a Stay.',
  contact_phone: '+91 1800 200 4663',
  contact_email: 'concierge@houseofdreams.com',
  cancellation_policy: 'Free cancellation up to 48 hours prior to check-in. Cancellations within 48 hours may be subject to a 1-night room charge.',
  payment_policy: 'Desk payment only upon arrival or checkout. We accept Cash, Card, and UPI directly at the reception desk.',
  default_checkin_time: '14:00',
  default_checkout_time: '11:00',
  tax_rate_percentage: '12',
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: false,
  refreshSettings: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsMap>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data?.map) {
        setSettings((prev) => ({ ...prev, ...res.data.map }));
      }
    } catch (err) {
      console.error('Failed to load global hotel settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
