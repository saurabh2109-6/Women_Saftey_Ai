import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import twilio from 'twilio';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { dbQuery, dbGet, dbRun } from './database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

// Check if Twilio credentials are placeholders
const isPlaceholder = (sid, token, phone) => {
  return !sid || !token || !phone ||
         sid === 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' ||
         token === 'your_twilio_auth_token_here' ||
         phone.includes('1XXXXXXXXXX') ||
         phone === '';
};

const hasPlaceholders = isPlaceholder(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER);

if (hasPlaceholders) {
  console.log('\x1b[33m%s\x1b[0m', '⚠️  [WARNING] Twilio credentials not configured in server/.env.');
  console.log('\x1b[33m%s\x1b[0m', '   Running Twilio in SIMULATION MODE.');
} else {
  console.log('\x1b[32m%s\x1b[0m', '✅ Twilio credentials loaded successfully.');
}

// Nodemailer SMTP Transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

// Helper to send OTP email
const sendOtpEmail = async (email, otp) => {
  const hasSmtp = process.env.SMTP_USER && process.env.SMTP_PASS;
  if (hasSmtp) {
    try {
      await transporter.sendMail({
        from: `"SafeShield AI" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your SafeShield AI Registration OTP',
        text: `Hello! Your One-Time Password (OTP) for registering on SafeShield AI is: ${otp}. It will expire in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #0b0f19; color: #f8fafc;">
            <h2 style="color: #f43f5e; text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 10px;">SafeShield AI Bodyguard</h2>
            <p style="font-size: 14px; color: #94a3b8; line-height: 1.5;">Hello! To complete your registration and arm your safety dashboard, please verify your email using this 6-digit One-Time Password (OTP):</p>
            <div style="text-align: center; margin: 24px 0;">
              <span style="display: inline-block; font-size: 32px; font-weight: 800; color: #f43f5e; background-color: rgba(244,63,94,0.08); border: 1px dashed rgba(244,63,94,0.3); padding: 12px 24px; letter-spacing: 4px; border-radius: 8px;">${otp}</span>
            </div>
            <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 20px;">This code will expire in 10 minutes. If you did not make this request, you can safely ignore this email.</p>
          </div>
        `
      });
      console.log(`[SMTP] Real OTP Email dispatched to ${email}`);
      return true;
    } catch (err) {
      console.error('[SMTP ERROR] Nodemailer failed, falling back to local simulation:', err.message);
    }
  }

  // Fallback simulator print
  console.log(`\n--------------------------------------------`);
  console.log(`✉️  [MOCK EMAIL SERVICE] Sending OTP to: ${email}`);
  console.log(`🔑 OTP Code: ${otp}`);
  console.log(`--------------------------------------------\n`);
  return false;
};


/* ==================== AUTHENTICATION ROUTES ==================== */

// 1. Register User & Dispatch OTP
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ success: false, error: 'All fields (name, email, password, phone) are required.' });
  }

  try {
    // Check if user already exists
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'User with this email already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expires = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;

    // Save user to DB (unverified)
    await dbRun(
      `INSERT INTO users (name, email, password_hash, phone, otp_code, otp_expires, is_verified, avatar) 
       VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
      [name, email, password_hash, phone, otp, otp_expires, avatar]
    );

    // Send OTP via email (actual or simulated)
    const sentRealEmail = await sendOtpEmail(email, otp);

    return res.status(201).json({
      success: true,
      message: 'Registration initiated. OTP sent to your email.',
      simulated: !sentRealEmail,
      otp: !sentRealEmail ? otp : undefined // Return OTP only in simulation mode for developer convenience
    });

  } catch (err) {
    console.error('Registration failed:', err);
    return res.status(500).json({ success: false, error: 'Internal server error during registration.' });
  }
});

// 2. Verify OTP Code
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, error: 'Email and OTP code are required.' });
  }

  try {
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User registration not found.' });
    }

    if (user.otp_code !== code) {
      return res.status(400).json({ success: false, error: 'Invalid verification OTP code.' });
    }

    if (Date.now() > user.otp_expires) {
      return res.status(400).json({ success: false, error: 'OTP code has expired. Please register again.' });
    }

    // Verify user and clear OTP
    await dbRun('UPDATE users SET is_verified = 1, otp_code = NULL, otp_expires = NULL WHERE email = ?', [email]);

    // Initialize mock contacts for new user in database
    await dbRun(
      `INSERT OR IGNORE INTO contacts (id, user_email, name, phone, relation, priority, message_template) VALUES 
       (?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?)`,
      [
        'c1_' + Date.now(), email, 'Mom (Sarah)', '+91 98765 43210', 'Parent', 'High', 'SafeShield ALERT! I am in danger, my current location is: {loc}. Please help me!',
        'c2_' + Date.now(), email, 'Dad (Robert)', '+91 98765 43211', 'Parent', 'High', 'Emergency! SafeShield detected abnormal movement. Tracker link: {loc}',
        'c3_' + Date.now(), email, 'Inspector Verma (Local SOS)', '112', 'Police', 'High', 'SOS Beacon: SafeShield emergency alert broadcast at {loc}. User needs assistance.'
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Account verified successfully.',
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        bloodGroup: user.blood_group,
        medicalConditions: user.medical_conditions
      }
    });

  } catch (err) {
    console.error('OTP Verification failed:', err);
    return res.status(500).json({ success: false, error: 'Internal server error during verification.' });
  }
});

// 3. User Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  try {
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    if (user.is_verified === 0) {
      return res.status(403).json({ success: false, error: 'Account not verified. Please register again.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    return res.status(200).json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        bloodGroup: user.blood_group,
        medicalConditions: user.medical_conditions
      }
    });

  } catch (err) {
    console.error('Login failed:', err);
    return res.status(500).json({ success: false, error: 'Internal server error during login.' });
  }
});


/* ==================== DATA SYNC ENDPOINTS ==================== */

// Contacts CRUD
app.get('/api/contacts', async (req, res) => {
  const { email } = req.query;
  try {
    const rows = await dbQuery('SELECT * FROM contacts WHERE user_email = ?', [email]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contacts', async (req, res) => {
  const { id, user_email, name, phone, relation, priority, message_template } = req.body;
  try {
    await dbRun(
      `INSERT INTO contacts (id, user_email, name, phone, relation, priority, message_template)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name=excluded.name,
         phone=excluded.phone,
         relation=excluded.relation,
         priority=excluded.priority,
         message_template=excluded.message_template`,
      [id || 'c_' + Date.now(), user_email, name, phone, relation, priority, message_template]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;
  const { email } = req.query;
  try {
    await dbRun('DELETE FROM contacts WHERE id = ? AND user_email = ?', [id, email]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recordings Sync
app.get('/api/recordings', async (req, res) => {
  const { email } = req.query;
  try {
    const rows = await dbQuery('SELECT * FROM recordings WHERE user_email = ? ORDER BY id DESC', [email]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/recordings', async (req, res) => {
  const { id, user_email, date, time, duration, title, src } = req.body;
  try {
    await dbRun(
      `INSERT INTO recordings (id, user_email, date, time, duration, title, src)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id || 'r_' + Date.now(), user_email, date, time, duration, title, src]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Incidents Sync
app.get('/api/incidents', async (req, res) => {
  const { email } = req.query;
  try {
    const rows = await dbQuery('SELECT * FROM incidents WHERE user_email = ? ORDER BY id DESC', [email]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/incidents', async (req, res) => {
  const { id, user_email, date, time, status, threat_score, trigger_type, location } = req.body;
  try {
    await dbRun(
      `INSERT INTO incidents (id, user_email, date, time, status, threat_score, trigger_type, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id || 'i_' + Date.now(), user_email, date, time, status, threat_score, trigger_type, location]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/incidents/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await dbRun('UPDATE incidents SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ==================== CORE SAFETY SERVICES ==================== */

// Endpoint to send SOS SMS
app.post('/api/send-sos', async (req, res) => {
  const { alerts } = req.body;

  if (!alerts || !Array.isArray(alerts)) {
    return res.status(400).json({ success: false, error: 'Invalid payload: "alerts" array is required.' });
  }

  const results = [];
  
  if (hasPlaceholders) {
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
        if (err.code === 21608) {
          errorHint = `Twilio Trial restrictions: Number ${alert.phone} is not verified.`;
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
    console.error('Twilio failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint for AI Personal Guard & Legal Advisor Chat Bot
app.post('/api/chat-bot', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: 'Parameter "message" is required.' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a real-life, highly trained personal safety bodyguard and legal companion. Your tone must be extremely empathetic, protective, warm, reassuring, and human-like—not robotic, clinical, or encyclopedic. Talk directly to the user as a protective friend who is there to keep them safe in real-time.
- If they are in immediate danger, guide them to trigger the SOS or call emergency services, and try to keep them calm.
- Speak in simple, conversational sentences. You can mix conversational English and simple Hindi phrases (Hinglish) when appropriate to feel like a local companion.
- Gently suggest practical safety actions first, and only introduce legal details (like IPC or BNS sections) naturally when relevant to their situation.
- Answer the user's message directly: ${message}`
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
