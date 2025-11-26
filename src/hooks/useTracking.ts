import { useState, useEffect, useCallback } from 'react';

export interface TrackingHistory {
  date: string;
  description: string;
  location?: string;
}

export interface TrackingData {
  awb: string;
  courier: string;
  status: string;
  history: TrackingHistory[];
  receiver?: string;
  origin?: string;
  destination?: string;
}

interface UseTrackingReturn {
  trackingData: TrackingData | null;
  loading: boolean;
  error: string | null;
  trackPackage: (awb: string, courier: string) => Promise<void>;
  lastAwb: string;
  lastCourier: string;
}

const STORAGE_KEY_AWB = 'lastAwb';
const STORAGE_KEY_COURIER = 'lastCourier';

export function useTracking(): UseTrackingReturn {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAwb, setLastAwb] = useState('');
  const [lastCourier, setLastCourier] = useState('');

  // Load last values from localStorage on mount
  useEffect(() => {
    const savedAwb = localStorage.getItem(STORAGE_KEY_AWB) || '';
    const savedCourier = localStorage.getItem(STORAGE_KEY_COURIER) || '';
    setLastAwb(savedAwb);
    setLastCourier(savedCourier);
  }, []);

  const trackPackage = useCallback(async (awb: string, courier: string) => {
    setLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      const apiKey = import.meta.env.VITE_KLIKRESI_API_KEY;

      // In dev: API key is required for Vite proxy
      // In production: Serverless function uses its own env var, but we can still send it
      const headers: HeadersInit = {};
      if (apiKey && apiKey !== 'your_api_key_here') {
        headers['x-api-key'] = apiKey;
      }

      // Dev: Vite proxy forwards /api to https://klikresi.com
      // Production: Vercel serverless function handles /api/trackings/...
      const response = await fetch(
        `/api/trackings/${encodeURIComponent(
          awb
        )}/couriers/${encodeURIComponent(courier)}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to track package: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Transform API response to our format
      interface HistoryItem {
        status?: string;
        message?: string;
        date?: string;
      }

      const transformedData: TrackingData = {
        awb: awb,
        courier: courier.toUpperCase(),
        status: data.data?.status || 'Unknown',
        history:
          data.data?.histories?.map((item: HistoryItem) => ({
            date: item.date || '',
            description: item.message || item.status || '',
            location: '',
          })) || [],
        receiver: data.data?.destination?.contact_name,
        origin: data.data?.origin?.contact_name || data.data?.origin?.address,
        destination: data.data?.destination?.address,
      };

      setTrackingData(transformedData);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY_AWB, awb);
      localStorage.setItem(STORAGE_KEY_COURIER, courier);
      setLastAwb(awb);
      setLastCourier(courier);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to track package';
      setError(errorMessage);
      console.error('Tracking error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    trackingData,
    loading,
    error,
    trackPackage,
    lastAwb,
    lastCourier,
  };
}
