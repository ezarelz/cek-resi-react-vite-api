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
    // Use realistic browser headers to bypass Cloudflare protection
    const response = await fetch(
      `https://klikresi.com/api/trackings/${encodeURIComponent(
        awb
      )}/couriers/${encodeURIComponent(courier)}`,
      {
        headers: {
          'x-api-key': API_KEY,
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          Referer: 'https://klikresi.com/',
          Origin: 'https://klikresi.com',
          Connection: 'keep-alive',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
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

        // Check if it's a Cloudflare challenge page
        if (
          textResponse.includes('Just a moment') ||
          textResponse.includes('cf-browser-verification') ||
          textResponse.includes('challenge-platform')
        ) {
          return res.status(503).json({
            error: 'Cloudflare protection detected',
            detail:
              'The API is protected by Cloudflare and is blocking automated requests. This may require manual verification or a different approach to access the API.',
            suggestion:
              'Try using the API directly with curl or Postman, or contact the API provider for server-to-server access.',
          });
        }

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

      // Check if it's a Cloudflare challenge page
      if (
        textResponse.includes('Just a moment') ||
        textResponse.includes('cf-browser-verification') ||
        textResponse.includes('challenge-platform')
      ) {
        return res.status(503).json({
          error: 'Cloudflare protection detected',
          detail:
            'The API is protected by Cloudflare and is blocking automated requests. This may require manual verification or a different approach to access the API.',
          suggestion:
            'Try using the API directly with curl or Postman, or contact the API provider for server-to-server access.',
        });
      }

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
