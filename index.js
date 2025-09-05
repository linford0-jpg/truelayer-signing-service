const express = require('express');
const cors = require('cors');
const { sign } = require('@truelayer/signing');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'truelayer-signing-service',
    timestamp: new Date().toISOString()
  });
});

// Sign endpoint
app.post('/sign', async (req, res) => {
  try {
    const { 
      method = 'POST', 
      path, 
      headers = {}, 
      body,
      kid,
      privateKey 
    } = req.body;

    // Validate required fields
    if (!path || !kid || !privateKey) {
      return res.status(400).json({
        error: 'Missing required fields: path, kid, privateKey'
      });
    }

    console.log(`🔐 Signing ${method} request to ${path}`);
    console.log(`📝 Body length: ${body ? body.length : 0} characters`);
    console.log(`🔑 Using KID: ${kid}`);

    // Create signature using TrueLayer's official library
    const signature = sign({
      method,
      path,
      headers,
      body: body || '',
      privateKey,
      kid
    });

    console.log(`✅ Signature created successfully`);

    res.json({
      'Tl-Signature': signature,
      'Tl-Kid': kid
    });

  } catch (error) {
    console.error('❌ Signing error:', error);
    res.status(500).json({
      error: 'Failed to create signature',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 TrueLayer Signing Service running on port ${PORT}`);
  console.log(`📍 Sign endpoint: POST /sign`);
});
