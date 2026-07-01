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

// Endpoint for AI Personal Guard & Legal Advisor Chat Bot
app.post('/api/chat-bot', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: 'Parameter "message" is required.' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  // If Gemini API Key is configured, use the real Gemini API
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
      console.log(`Calling Gemini API for safety threat analysis...`);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `System Instruction: Act as a compassionate, highly competent AI Legal Advisor & Personal Bodyguard for women's safety. Limit your response to 2-3 short, highly readable paragraphs or bullet points. Provide legal guidelines (e.g. IPC sections on stalking or harassment) and safety advice. Keep responses practical and structured.

User question: ${message}`
            }]
          }]
        })
      });

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (reply) {
        return res.status(200).json({ success: true, reply });
      } else {
        throw new Error('Invalid response structure from Gemini API');
      }
    } catch (err) {
      console.error('Gemini API call failed, falling back to simulator:', err.message);
    }
  }

  // Smart Rule-based local fallback responses
  const text = message.toLowerCase();
  let reply = '';

  if (text.includes('stalk') || text.includes('follow') || text.includes('picha') || text.includes('rasta')) {
    reply = `🚨 **Stalking / Tracking Threat (IPC Section 354D / BNS Section 78):**\nIf someone is repeatedly following you, watching your home/workplace, or tracking you online against your consent, it constitutes criminal stalking.\n\n**Legal Options:**\n1. **Register FIR:** Go to the nearest police station. Under Zero FIR rules, they cannot refuse filing it.\n2. **Report Online:** You can file a cyber complaint anonymously at [cybercrime.gov.in](https://cybercrime.gov.in) (if cyberstalked).\n3. **Quick Help:** Contact **Advocate Rohan Mehra** (+91 88776 65544) from our Help Directory for immediate counsel.`;
  } else if (text.includes('harass') || text.includes('abuse') || text.includes('gali') || text.includes('workplace') || text.includes('office')) {
    reply = `⚖️ **Harassment / Abuse & POSH Act:**\nIf you face harassment at the workplace, the POSH Act requires every organization with >10 employees to have an Internal Complaints Committee (ICC). If it happens in a public space, it falls under **IPC Section 354A**.\n\n**Your Options:**\n1. Submit a formal written complaint to your company's ICC within 3 months.\n2. File a criminal complaint under IPC 354A (verbal/sexual harassment).\n3. Check our Help Directory to get in touch with **Advocate Meera Sharma** (+91 99887 76655) specializing in women's safety laws.`;
  } else if (text.includes('doctor') || text.includes('hospital') || text.includes('hurt') || text.includes('chot') || text.includes('injury')) {
    reply = `🏥 **Medical Support & Forensic Guidelines:**\nIf you have been physically hurt or need medical/forensic assistance:\n\n1. **Free Treatment:** Under Section 357C of CrPC, all public & private hospitals must provide immediate free medical care to emergency victims.\n2. **Forensic Evidence:** Do not wash or change clothes before a medical examination to ensure critical forensic evidence is preserved.\n3. **Contacts:** Call **Fortis Emergency Unit** (+91 11 4277 6222) or **Safdarjung Forensic Dept** (+91 11 2616 5060) from our directory.`;
  } else if (text.includes('lawyer') || text.includes('court') || text.includes('police') || text.includes('fir')) {
    reply = `⚖️ **Legal Remedies & Counsel:**\nHaving qualified legal counsel makes a big difference in safety issues. You have the right to:\n\n1. Request a free legal aid advocate if you cannot afford one (through National Legal Services Authority - NALSA).\n2. Consult one of the verified advocates in our **Help Directory** for immediate support.\n3. Demand a copy of your FIR from the police station for free.`;
  } else if (text.includes('counselor') || text.includes('depress') || text.includes('scared') || text.includes('darr') || text.includes('sad')) {
    reply = `🧠 **Crisis Support & Mental Health Counseling:**\nSafety issues can cause significant psychological distress. You do not have to go through this alone.\n\n**Resources:**\n1. Reach out to **Dr. Anjali Malhotra** (+91 77665 54433) from our counseling panel for trauma-informed crisis support.\n2. You can also call national helpline services like Vandrevala Foundation or KIRAN for 24/7 free counseling.`;
  } else {
    reply = `🛡️ **AI Personal Bodyguard & Legal Advisor Active:**\nI am standing by to assist you. If you are experiencing a legal or safety crisis, please tell me. \n\nI can:\n* Help you understand relevant **Indian Penal Code / BNS sections** (stalking, harassment, cyber threats).\n* Detail the exact roadmap to file a **Police Complaint / FIR**.\n* Recommend verified **Lawyers, Counselors, and Doctors** near you.`;
  }

  return res.status(200).json({ success: true, reply });
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
