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
      // Determine API endpoint
      // If VITE_API_BASE_URL is set (Railway proxy), use it
      // Otherwise, use /api (Vercel serverless function or Vite proxy for dev)
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

      let apiUrl: string;
      const headers: HeadersInit = {};

      if (apiBaseUrl) {
        // Use Railway proxy server
        // Endpoint: /track?awb=XXX&courier=YYY
        apiUrl = `${apiBaseUrl}/track?awb=${encodeURIComponent(
          awb
        )}&courier=${encodeURIComponent(courier)}`;
      } else {
        // Use Vercel serverless function or Vite proxy
        // Endpoint: /api/trackings/XXX/couriers/YYY
        const apiKey = import.meta.env.VITE_KLIKRESI_API_KEY;
        if (apiKey && apiKey !== 'your_api_key_here') {
          headers['x-api-key'] = apiKey;
        }
        apiUrl = `/api/trackings/${encodeURIComponent(
          awb
        )}/couriers/${encodeURIComponent(courier)}`;
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
      });

      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        let errorMessage = `Failed to track package: ${response.statusText}`;

        if (isJson) {
          const errorData = await response.json().catch(() => ({}));
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } else {
          const textResponse = await response.text();
          errorMessage = `Server error: ${textResponse.substring(0, 200)}`;
        }

        throw new Error(errorMessage);
      }

      // Validate JSON response
      if (!isJson) {
        const textResponse = await response.text();
        throw new Error(
          `Invalid response format. Expected JSON but received: ${textResponse.substring(
            0,
            200
          )}`
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
