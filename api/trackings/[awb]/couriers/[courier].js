export default async function handler(req, res) {
  // In Vercel, dynamic route parameters are available in req.query
  const { awb, courier } = req.query;

  if (!awb || !courier) {
    return res.status(400).json({ error: 'awb & courier required' });
  }

  const API_KEY = process.env.VITE_KLIKRESI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({
      error: 'API key not configured',
      detail:
        'Please set VITE_KLIKRESI_API_KEY in Vercel environment variables',
    });
  }

  try {
    const response = await fetch(
      `https://klikresi.com/api/trackings/${encodeURIComponent(
        awb
      )}/couriers/${encodeURIComponent(courier)}`,
      {
        headers: {
          'x-api-key': API_KEY,
          'User-Agent': 'curl/8.0',
          Accept: '*/*',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: 'Failed to fetch tracking data',
        detail: errorData.message || response.statusText,
      });
    }

    const data = await response.json();

    // Set CORS headers for production
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({
      error: 'Proxy failed',
      detail: e.message,
    });
  }
}
