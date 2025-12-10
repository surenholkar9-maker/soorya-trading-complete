export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { code } = req.query;
  const {
    UPSTOX_CLIENT_ID,
    UPSTOX_CLIENT_SECRET,
    REDIRECT_URI,
    FRONTEND_URL
  } = process.env;

  try {
    // If no code, return the OAuth URL for frontend to redirect to
    if (!code) {
      const authUrl = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${UPSTOX_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
      return res.status(200).json({ authUrl });
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      'https://api.upstox.com/v2/login/authorization/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: UPSTOX_CLIENT_ID,
          client_secret: UPSTOX_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code'
        }).toString()
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      const errorMsg = tokenData.error || 'Token exchange failed';
      return res.redirect(
        302,
        `${FRONTEND_URL}?error=${encodeURIComponent(errorMsg)}`
      );
    }

    // Redirect to frontend with access token
    return res.redirect(
      302,
      `${FRONTEND_URL}?access_token=${encodeURIComponent(tokenData.access_token)}&status=success`
    );
  } catch (error) {
    console.error('Auth error:', error);
    return res.redirect(
      302,
      `${FRONTEND_URL}?error=${encodeURIComponent(error.message)}`
    );
  }
}
