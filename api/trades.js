export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const response = await fetch(
      'https://api.upstox.com/v2/order/retrieve-all',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Upstox API error: ${response.statusText}`
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Trades error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to fetch trades'
    });
  }
}
