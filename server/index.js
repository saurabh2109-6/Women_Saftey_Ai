import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

// Check if credentials are using default placeholder values
const isPlaceholder = (sid, token, phone) => {
  return !sid || !token || !phone ||
         sid === 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' ||
         token === 'your_twilio_auth_token_here' ||
         phone.includes('1XXXXXXXXXX') ||
         phone === '';
};

const hasPlaceholders = isPlaceholder(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER);

if (hasPlaceholders) {
  console.log('\x1b[33m%s\x1b[0m', '⚠️  [WARNING] Twilio credentials are not fully configured in server/.env (using default placeholders).');
  console.log('\x1b[33m%s\x1b[0m', '   The server will run in SIMULATION MODE and mock SMS dispatch logs instead of calling the real Twilio API.');
} else {
  console.log('\x1b[32m%s\x1b[0m', '✅ [SUCCESS] Twilio credentials detected. Real SMS alerts will be sent.');
}

// Endpoint to send SOS SMS
app.post('/api/send-sos', async (req, res) => {
  const { alerts } = req.body;

  if (!alerts || !Array.isArray(alerts)) {
    return res.status(400).json({ success: false, error: 'Invalid payload: "alerts" array is required.' });
  }

  const results = [];
  
  if (hasPlaceholders) {
    // Simulation Mode: just mock sending SMS
    console.log(`\n--- [SIMULATION MODE] Dispatching SOS Alerts ---`);
    alerts.forEach(alert => {
      console.log(`Mock SMS sent from ${TWILIO_PHONE_NUMBER} to ${alert.name} (${alert.phone}): "${alert.message}"`);
      results.push({
        phone: alert.phone,
        name: alert.name,
        status: 'simulated',
        success: true
      });
    });
    return res.status(200).json({ success: true, mode: 'simulated', results });
  }

  // Real Mode: Send SMS using Twilio Client
  try {
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    
    for (const alert of alerts) {
      try {
        console.log(`Sending real SMS to ${alert.name} (${alert.phone})...`);
        const message = await client.messages.create({
          body: alert.message,
          from: TWILIO_PHONE_NUMBER,
          to: alert.phone
        });
        
        console.log(`SMS successfully sent to ${alert.name}. SID: ${message.sid}`);
        results.push({
          phone: alert.phone,
          name: alert.name,
          status: 'sent',
          sid: message.sid,
          success: true
        });
      } catch (err) {
        console.error(`Failed to send SMS to ${alert.name} (${alert.phone}):`, err.message);
        
        let errorHint = err.message;
        // User-friendly error message for unverified numbers in trial account (Twilio Error 21608)
        if (err.code === 21608) {
          errorHint = `Twilio Trial Account restrictions: The number ${alert.phone} is not verified. Please verify it in your Twilio Console under 'Verified Caller IDs' to receive messages.`;
        }
        
        results.push({
          phone: alert.phone,
          name: alert.name,
          status: 'failed',
          success: false,
          error: errorHint,
          code: err.code
        });
      }
    }
    
    const allSuccessful = results.every(r => r.success);
    return res.status(allSuccessful ? 200 : 207).json({
      success: allSuccessful,
      mode: 'live',
      results
    });

  } catch (err) {
    console.error('Twilio Client Initialization failed:', err);
    return res.status(500).json({
      success: false,
      error: 'Twilio Client Initialization failed. Verify your Account SID and Auth Token.',
      details: err.message
    });
  }
});

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    mode: hasPlaceholders ? 'simulation' : 'live',
    twilioConfigured: !hasPlaceholders
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SafeShield Backend running on http://localhost:${PORT}`);
});
