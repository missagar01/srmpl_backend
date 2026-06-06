const validateApiKey = (req, res, next) => {
  const expectedApiKey = process.env.API_KEY;
  
  if (!expectedApiKey) {
    console.error('[Auth] API_KEY is not defined in .env');
    return res.status(500).json({ 
      error: 'SERVER_CONFIGURATION_ERROR', 
      details: 'API_KEY is not configured on the server.' 
    });
  }

  // Check in x-api-key header or Authorization header (Bearer token)
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.split(' ')[1];

  if (apiKey && apiKey === expectedApiKey) {
    return next();
  }

  return res.status(401).json({ 
    error: 'UNAUTHORIZED', 
    details: 'Invalid or missing API Key. Please provide a valid key in "x-api-key" or Authorization header.' 
  });
};

module.exports = { validateApiKey };
