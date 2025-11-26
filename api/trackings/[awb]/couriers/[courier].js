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

    // Check content type before parsing
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
      let errorDetail = response.statusText;

      if (isJson) {
        const errorData = await response.json().catch(() => ({}));
        errorDetail = errorData.message || response.statusText;
      } else {
        // If not JSON, get text response for debugging
        const textResponse = await response.text();
        errorDetail = `API returned non-JSON response: ${textResponse.substring(
          0,
          200
        )}`;
      }

      return res.status(response.status).json({
        error: 'Failed to fetch tracking data',
        detail: errorDetail,
      });
    }

    // Validate JSON response
    if (!isJson) {
      const textResponse = await response.text();
      return res.status(500).json({
        error: 'Invalid API response',
        detail: `Expected JSON but received: ${textResponse.substring(0, 200)}`,
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
