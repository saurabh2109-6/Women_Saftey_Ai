import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// Interfaces
export interface Contact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  priority: 'High' | 'Medium' | 'Low';
  messageTemplate: string;
}

export interface Recording {
  id: string;
  date: string;
  time: string;
  duration: string;
  src: string;
  title: string;
}

export interface BotMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}


export interface Incident {
  id: string;
  date: string;
  time: string;
  status: 'active' | 'resolved';
  threatScore: number;
  triggerType: string;
  location: string;
}

export interface Volunteer {
  id: string;
  name: string;
  distance: string;
  lat: number;
  lng: number;
  accepted: boolean;
}

export interface GpsPoint {
  lat: number;
  lng: number;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  avatar: string;
  bloodGroup: string;
  medicalConditions: string;
}

export interface SafetySignals {
  scream: boolean;
  shake: boolean;
  fall: boolean;
  nightRisk: boolean;
  unsafeLocation: boolean;
  wordMatch: boolean;
}

interface AppContextType {
  currentScreen: 'auth' | 'home' | 'contacts' | 'dashboard' | 'settings' | 'admin' | 'guard';
  setCurrentScreen: (screen: 'auth' | 'home' | 'contacts' | 'dashboard' | 'settings' | 'admin' | 'guard') => void;

  user: UserProfile | null;
  login: (user: UserProfile) => void;
  logout: () => void;
  
  // Emergency System
  activeSOS: boolean;
  sosCountdown: number;
  triggerSOS: (triggerType?: string) => void;
  cancelSOS: () => void;
  activateEmergencyMode: (triggerType: string) => void;
  deactivateEmergencyMode: () => void;
  
  // Contacts
  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (contact: Contact) => void;
  deleteContact: (id: string) => void;
  
  // Voice & Sensors Configuration
  voiceKeywords: string[];
  setVoiceKeywords: React.Dispatch<React.SetStateAction<string[]>>;
  audioSensitivity: number;
  setAudioSensitivity: (val: number) => void;
  shakeThreshold: number;
  setShakeThreshold: (val: number) => void;
  fallThreshold: number;
  setFallThreshold: (val: number) => void;
  threatThreshold: number;
  setThreatThreshold: (val: number) => void;
  
  // Signals & Threat Engine
  signals: SafetySignals;
  simulateSignal: (signal: keyof SafetySignals, val: boolean) => void;
  threatScore: number;
  
  // Audio recordings (evidence)
  recordings: Recording[];
  addRecording: (recording: Recording) => void;
  
  // Incidents History
  incidents: Incident[];
  resolveIncident: (id: string) => void;
  
  // Volunteers
  volunteers: Volunteer[];
  simulateVolunteerAcceptance: () => void;
  
  // GPS
  gpsCoords: { lat: number; lng: number };
  updateGpsCoords: (lat: number, lng: number) => void;
  gpsHistory: GpsPoint[];
  
  // System Logs
  simulationLogs: string[];
  addLog: (msg: string) => void;
  clearLogs: () => void;
  
  // Settings & Network
  networkStatus: 'online' | 'offline';
  setNetworkStatus: (status: 'online' | 'offline') => void;
  
  // Fake Call
  isFakeCalling: boolean;
  fakeCallTimer: number | null;
  fakeCallContactName: string;
  setFakeCallContactName: (name: string) => void;
  triggerFakeCall: (delaySeconds: number) => void;
  acceptFakeCall: () => void;
  declineFakeCall: () => void;
  isFakeCallRinging: boolean;

  isFakeCallActive: boolean;
  
  // AI Guard Bot
  botMessages: BotMessage[];
  sendBotMessage: (text: string) => Promise<void>;
  clearBotMessages: () => void;
}


const AppContext = createContext<AppContextType | undefined>(undefined);



const INITIAL_VOLUNTEERS: Volunteer[] = [
  { id: 'v1', name: 'Aman (150m away)', distance: '150m', lat: 28.6145, lng: 77.2095, accepted: false },
  { id: 'v2', name: 'Dr. Priya (340m away)', distance: '340m', lat: 28.6125, lng: 77.2080, accepted: false },
  { id: 'v3', name: 'Kabir (450m away)', distance: '450m', lat: 28.6150, lng: 77.2065, accepted: false },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<'auth' | 'home' | 'contacts' | 'dashboard' | 'settings' | 'admin' | 'guard'>('auth');
  const API_BASE = `http://${window.location.hostname}:5000`;


  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('safeshield_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Emergency triggers
  const [activeSOS, setActiveSOS] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(0);
  const [sosTriggerSource, setSosTriggerSource] = useState('Manual Button');

  // Configuration
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [voiceKeywords, setVoiceKeywords] = useState<string[]>(['help me', 'safeshield', 'bachao', 'save me', 'leave me alone']);
  const [audioSensitivity, setAudioSensitivity] = useState(65);
  const [shakeThreshold, setShakeThreshold] = useState(50);
  const [fallThreshold, setFallThreshold] = useState(40);
  const [threatThreshold, setThreatThreshold] = useState(75);

  // Safety Signals
  const [signals, setSignals] = useState<SafetySignals>({
    scream: false,
    shake: false,
    fall: false,
    nightRisk: false,
    unsafeLocation: false,
    wordMatch: false,
  });

  const [threatScore, setThreatScore] = useState(0);

  // Lists
  const [recordings, setRecordings] = useState<Recording[]>([]);
  
  const [incidents, setIncidents] = useState<Incident[]>([]);
  
  const [volunteers, setVolunteers] = useState<Volunteer[]>(INITIAL_VOLUNTEERS);

  // GPS (New Delhi center as default)
  const [gpsCoords, setGpsCoords] = useState({ lat: 28.6139, lng: 77.2090 });
  const [gpsHistory, setGpsHistory] = useState<GpsPoint[]>([]);

  // Logger & Network
  const [simulationLogs, setSimulationLogs] = useState<string[]>(['SafeShield AI core initialized. Standing by.']);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');

  // Fake Call State
  const [isFakeCalling, setIsFakeCalling] = useState(false);
  const [fakeCallTimer, setFakeCallTimer] = useState<number | null>(null);
  const [fakeCallContactName, setFakeCallContactName] = useState('Mom');
  const [isFakeCallRinging, setIsFakeCallRinging] = useState(false);
  const [isFakeCallActive, setIsFakeCallActive] = useState(false);


  // AI Guard Bot State
  const [botMessages, setBotMessages] = useState<BotMessage[]>(() => {
    const saved = localStorage.getItem('safeshield_bot_messages');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'welcome',
        sender: 'bot',
        text: 'Hello! I am your AI Bodyguard & Legal Advisor. How can I help you today? You can describe any safety threat, stalker issue, or legal concern, and I will outline your options, laws, and professional help contacts.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });


  // Refs for timers
  const countdownIntervalRef = useRef<any>(null);
  const fakeCallIntervalRef = useRef<any>(null);

  // Persist items
  useEffect(() => {
    if (user) localStorage.setItem('safeshield_user', JSON.stringify(user));
    else localStorage.removeItem('safeshield_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('safeshield_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    if (!user) {
      setContacts([]);
      setRecordings([]);
      setIncidents([]);
      return;
    }

    const syncFromDatabase = async () => {
      try {
        // 1. Sync Contacts
        const contactsRes = await fetch(`${API_BASE}/api/contacts?email=${encodeURIComponent(user.email)}`);
        const contactsData = await contactsRes.json();
        if (Array.isArray(contactsData)) {
          const formatted = contactsData.map((c: any) => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            relation: c.relation,
            priority: c.priority,
            messageTemplate: c.message_template
          }));
          setContacts(formatted);
        }

        // 2. Sync Recordings
        const recordingsRes = await fetch(`${API_BASE}/api/recordings?email=${encodeURIComponent(user.email)}`);
        const recordingsData = await recordingsRes.json();
        if (Array.isArray(recordingsData)) {
          setRecordings(recordingsData);
        }

        // 3. Sync Incidents
        const incidentsRes = await fetch(`${API_BASE}/api/incidents?email=${encodeURIComponent(user.email)}`);
        const incidentsData = await incidentsRes.json();
        if (Array.isArray(incidentsData)) {
          const formatted = incidentsData.map((i: any) => ({
            id: i.id,
            date: i.date,
            time: i.time,
            status: i.status,
            threatScore: i.threat_score,
            triggerType: i.trigger_type,
            location: i.location
          }));
          setIncidents(formatted);
        }
        addLog(`Database: Loaded profile and synced all safety records.`);
      } catch (err) {
        addLog(`Database connection offline. Using local backup.`);
      }
    };

    syncFromDatabase();
  }, [user]);


  useEffect(() => {
    localStorage.setItem('safeshield_bot_messages', JSON.stringify(botMessages));
  }, [botMessages]);


  useEffect(() => {
    localStorage.setItem('safeshield_recordings', JSON.stringify(recordings));
  }, [recordings]);

  useEffect(() => {
    localStorage.setItem('safeshield_incidents', JSON.stringify(incidents));
  }, [incidents]);

  // System Log Helper
  const addLog = (msg: string) => {
    const timeStr = new Date().toLocaleTimeString();
    setSimulationLogs(prev => [`[${timeStr}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const clearLogs = () => {
    setSimulationLogs(['Logs cleared.']);
  };

  // Auth Operations
  const login = (userData: UserProfile) => {
    setUser(userData);
    addLog(`User '${userData.name}' logged in successfully.`);
  };

  const logout = () => {
    setUser(null);
    setCurrentScreen('auth');
    addLog('User logged out.');
  };

  // Contacts CRUD
  const addContact = async (newContact: Omit<Contact, 'id'>) => {
    const contact: Contact = {
      ...newContact,
      id: 'c_' + Date.now().toString(),
    };
    setContacts(prev => [...prev, contact]);
    addLog(`Contact '${contact.name}' added locally.`);

    if (user) {
      try {
        await fetch(`${API_BASE}/api/contacts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: contact.id,
            user_email: user.email,
            name: contact.name,
            phone: contact.phone,
            relation: contact.relation,
            priority: contact.priority,
            message_template: contact.messageTemplate
          })
        });
        addLog(`Database: Saved contact '${contact.name}'.`);
      } catch (err) {
        console.error('Failed to sync added contact to DB:', err);
      }
    }
  };

  const updateContact = async (updatedContact: Contact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
    addLog(`Contact '${updatedContact.name}' updated locally.`);

    if (user) {
      try {
        await fetch(`${API_BASE}/api/contacts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: updatedContact.id,
            user_email: user.email,
            name: updatedContact.name,
            phone: updatedContact.phone,
            relation: updatedContact.relation,
            priority: updatedContact.priority,
            message_template: updatedContact.messageTemplate
          })
        });
        addLog(`Database: Updated contact '${updatedContact.name}'.`);
      } catch (err) {
        console.error('Failed to sync updated contact to DB:', err);
      }
    }
  };

  const deleteContact = async (id: string) => {
    const contact = contacts.find(c => c.id === id);
    setContacts(prev => prev.filter(c => c.id !== id));
    if (contact) addLog(`Contact '${contact.name}' deleted.`);

    if (user) {
      try {
        await fetch(`${API_BASE}/api/contacts/${id}?email=${encodeURIComponent(user.email)}`, {
          method: 'DELETE'
        });
        addLog(`Database: Removed contact.`);
      } catch (err) {
        console.error('Failed to sync deleted contact to DB:', err);
      }
    }
  };


  // Threat Engine Score calculation
  useEffect(() => {
    let score = 0;
    if (signals.scream) score += 35;
    if (signals.shake) score += 25;
    if (signals.fall) score += 30;
    if (signals.wordMatch) score += 40;
    if (signals.nightRisk) score += 15;
    if (signals.unsafeLocation) score += 20;

    score = Math.min(score, 100);
    setThreatScore(score);

    // If threat score exceeds threshold, trigger automatic SOS
    if (score >= threatThreshold && !activeSOS && user) {
      const triggers = [];
      if (signals.scream) triggers.push('Scream');
      if (signals.shake) triggers.push('Shake');
      if (signals.fall) triggers.push('Fall');
      if (signals.wordMatch) triggers.push('Keyword');
      const triggerDesc = `AI Engine: ${triggers.join('/') || 'Threat Score'} (${score}%)`;
      triggerSOS(triggerDesc);
    }
  }, [signals, threatThreshold, activeSOS, user]);

  // SOS Countdown Timer
  useEffect(() => {
    if (sosCountdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setSosCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current!);
            activateEmergencyMode(sosTriggerSource);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [sosCountdown, sosTriggerSource]);

  // Fake Call Scheduler Timer
  useEffect(() => {
    if (fakeCallTimer !== null && fakeCallTimer > 0) {
      fakeCallIntervalRef.current = setInterval(() => {
        setFakeCallTimer(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(fakeCallIntervalRef.current!);
            setIsFakeCallRinging(true);
            addLog(`Fake Call: Device is ringing from '${fakeCallContactName}'.`);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (fakeCallIntervalRef.current) clearInterval(fakeCallIntervalRef.current);
    };
  }, [fakeCallTimer, fakeCallContactName]);

  // SOS actions
  const triggerSOS = (triggerSource = 'Manual Button') => {
    if (activeSOS) return;
    setSosTriggerSource(triggerSource);
    setSosCountdown(5);
    setActiveSOS(true);
    addLog(`SOS countdown started via: ${triggerSource}.`);
  };

  const cancelSOS = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setSosCountdown(0);
    setActiveSOS(false);
    addLog('SOS canceled by user during countdown (False Alarm avoided).');
  };

  const activateEmergencyMode = async (triggerType: string) => {
    addLog(`EMERGENCY MODE ACTIVE (Trigger: ${triggerType})`);
    
    const mapLink = `https://maps.google.com/?q=${gpsCoords.lat.toFixed(5)},${gpsCoords.lng.toFixed(5)}`;
    
    // Prepare alerts payload for Twilio backend
    const alerts = contacts.map(contact => ({
      name: contact.name,
      phone: contact.phone,
      message: contact.messageTemplate.replace('{loc}', mapLink)
    }));

    // Perform network call if online, otherwise fall back to offline simulation log
    if (networkStatus === 'online') {
      addLog(`Twilio Gateway: Contacting server to dispatch SMS alerts...`);
      try {
        const response = await fetch(`${API_BASE}/api/send-sos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ alerts })
        });
        
        const data = await response.json();
        
        if (data.success) {
          if (data.mode === 'simulated') {
            addLog(`Twilio SMS (SIMULATOR): Successful dispatch simulation log generated.`);
          } else {
            addLog(`Twilio SMS (LIVE): All emergency SMS alerts dispatched successfully!`);
          }
        } else {
          // Some messages failed or general error
          if (data.results) {
            data.results.forEach((res: any) => {
              if (!res.success) {
                addLog(`Twilio ERROR: Failed to send SMS to ${res.name}: ${res.error || 'Unknown error'}`);
              } else {
                addLog(`Twilio: SMS successfully dispatched to ${res.name}.`);
              }
            });
          } else {
            addLog(`Twilio ERROR: ${data.error || 'Server error while sending SOS alerts.'}`);
          }
        }
      } catch (err: any) {
        addLog(`Twilio connection error: Could not reach backend server at ${API_BASE}. Make sure your server is running.`);
        // Fallback logs so simulation doesn't stall
        alerts.forEach(alert => {
          addLog(`Offline fallback logs: SMS simulated to ${alert.name} (${alert.phone})`);
        });
      }
    } else {
      // Offline mode logs
      alerts.forEach(alert => {
        addLog(`OFFLINE Fallback SMS: Sent via local cellular to ${alert.name} (${alert.phone}): "${alert.message}"`);
      });
    }

    // Create a new incident entry
    const newIncident: Incident = {
      id: 'i_' + Date.now().toString(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: 'active',
      threatScore: threatScore || 90,
      triggerType,
      location: `${gpsCoords.lat.toFixed(4)}, ${gpsCoords.lng.toFixed(4)}`,
    };

    setIncidents(prev => [newIncident, ...prev]);

    if (user) {
      try {
        await fetch(`${API_BASE}/api/incidents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newIncident.id,
            user_email: user.email,
            date: newIncident.date,
            time: newIncident.time,
            status: newIncident.status,
            threat_score: newIncident.threatScore,
            trigger_type: newIncident.triggerType,
            location: newIncident.location
          })
        });
        addLog(`Database: Logged active SOS incident.`);
      } catch (err) {
        console.error('Failed to sync incident to DB:', err);
      }
    }


    // Simulate real-time volunteer notifications nearby
    addLog(`Community Alert: Broadcasting SOS to local SafeShield network (Radius: 500m)...`);
    
    // Mock volunteer acceptance after a short delay
    setTimeout(() => {
      simulateVolunteerAcceptance();
    }, 4000);
  };

  const deactivateEmergencyMode = () => {
    setActiveSOS(false);
    setSosCountdown(0);
    
    // Mark active incident as resolved
    setIncidents(prev => prev.map(inc => inc.status === 'active' ? { ...inc, status: 'resolved' } : inc));
    
    // Reset volunteers
    setVolunteers(INITIAL_VOLUNTEERS);
    
    addLog('Emergency resolved. System back to normal armed mode.');
  };

  const resolveIncident = async (id: string) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'resolved' } : inc));
    addLog(`Incident #${id.substring(id.length - 4)} marked resolved.`);

    try {
      await fetch(`${API_BASE}/api/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' })
      });
      addLog(`Database: Marked incident #${id.substring(id.length - 4)} resolved.`);
    } catch (err) {
      console.error('Failed to sync resolved incident to DB:', err);
    }
  };


  const simulateSignal = (signal: keyof SafetySignals, val: boolean) => {
    setSignals(prev => ({ ...prev, [signal]: val }));
    addLog(`Signal override: ${signal} set to ${val.toString().toUpperCase()}`);
  };

  const simulateVolunteerAcceptance = () => {
    setVolunteers(prev => {
      // Pick Aman (v1) to accept
      const updated = prev.map(v => v.id === 'v1' ? { ...v, accepted: true } : v);
      addLog(`Community Alert Response: Volunteer '${updated[0].name}' has accepted the SOS and is navigating to your location.`);
      return updated;
    });
  };

  const updateGpsCoords = (lat: number, lng: number) => {
    setGpsCoords({ lat, lng });
    const timeStr = new Date().toLocaleTimeString();
    setGpsHistory(prev => [...prev, { lat, lng, timestamp: timeStr }]);
    
    // Check if location is unsafe
    const inDangerZone = (lat > 28.6180 || lat < 28.6100 || lng > 77.2150 || lng < 77.2020);
    if (inDangerZone !== signals.unsafeLocation) {
      setSignals(prev => ({ ...prev, unsafeLocation: inDangerZone }));
      addLog(`GPS: Crossed boundary. Safety status changed: ${inDangerZone ? 'UNSAFE AREA DETECTED' : 'SAFE ZONE'}`);
    }
  };

  const addRecording = async (rec: Recording) => {
    setRecordings(prev => [rec, ...prev]);
    addLog(`Secure Audio Backup: Saved audio backup locally.`);

    if (user) {
      try {
        await fetch(`${API_BASE}/api/recordings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: rec.id,
            user_email: user.email,
            date: rec.date,
            time: rec.time,
            duration: rec.duration,
            title: rec.title,
            src: rec.src
          })
        });
        addLog(`Database: Uploaded secure recording '${rec.title}'.`);
      } catch (err) {
        console.error('Failed to sync recording to DB:', err);
      }
    }
  };


  // Fake Call handlers
  const triggerFakeCall = (delay: number) => {
    setIsFakeCalling(true);
    setFakeCallTimer(delay);
    addLog(`Fake Call scheduled in ${delay} seconds.`);
  };

  const acceptFakeCall = () => {
    setIsFakeCallRinging(false);
    setIsFakeCallActive(true);
    addLog(`Fake Call answered. Playing automated deterrent defense conversation.`);
  };

  const declineFakeCall = () => {
    setIsFakeCalling(false);
    setFakeCallTimer(null);
    setIsFakeCallRinging(false);
    setIsFakeCallActive(false);
    addLog(`Fake Call dismissed.`);
  };

  const sendBotMessage = async (text: string) => {
    const userMsg: BotMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setBotMessages(prev => [...prev, userMsg]);
    addLog(`AI Bot: User sent query about safety/legal concerns.`);

    const typingId = 'typing-' + Date.now();
    const typingMsg: BotMessage = {
      id: typingId,
      sender: 'bot',
      text: 'Thinking...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setBotMessages(prev => [...prev, typingMsg]);

    try {
      const response = await fetch(`${API_BASE}/api/chat-bot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text })
      });
      
      const data = await response.json();
      
      setBotMessages(prev => prev.filter(m => m.id !== typingId).concat({
        id: Date.now().toString(),
        sender: 'bot',
        text: data.reply || 'Sorry, I am having trouble connecting to my cognitive models.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
    } catch (err) {
      // Offline mock response depending on common keywords
      const lower = text.toLowerCase();
      let mockReply = '';
      if (lower.includes('stalk') || lower.includes('follow') || lower.includes('picha')) {
        mockReply = `🚨 **Stalking / Harassment Warning (Indian Penal Code Section 354D):**\nIf someone is repeatedly following or contacting you online/offline against your will:\n\n1. **Take Legal Action:** You can file a physical FIR or an online complaint at [cybercrime.gov.in](https://cybercrime.gov.in) (if online stalking).\n2. **Immediate Help:** Call the **Women's Helpline (1091)** or **Emergency Services (112)**.\n3. **Safety Advice:** Inform family/friends, change your routes, and check our Legal/Help Directory to contact a recommended **harassment lawyer** immediately.`;
      } else if (lower.includes('lawyer') || lower.includes('advocate') || lower.includes('vakeel')) {
        mockReply = `⚖️ **Legal Assistance Available:**\nI can recommend verified lawyers specializing in women's rights and criminal defense. Please visit the **Directory Tab** to browse lawyers, or let me know if you'd like tips on how to prepare for your first lawyer consultation.`;
      } else if (lower.includes('doctor') || lower.includes('hospital') || lower.includes('chot') || lower.includes('hurt')) {
        mockReply = `🏥 **Medical Support:**\nIf you have been physically hurt or need medical/forensic assistance:\n\n1. Go to the nearest government hospital (they are legally mandated to treat emergency victims immediately).\n2. Reach out to one of the verified **Doctors / Medical Centers** listed in our Help Directory.\n3. Call **108** for ambulance services.`;
      } else {
        mockReply = `🛡️ **AI Personal Bodyguard active:**\nI'm listening. If you are experiencing a legal or safety problem, please tell me. I can:\n* Provide details of relevant **laws and rights** (stalking, domestic threat, etc.).\n* Outline options for **filing a police complaint / FIR**.\n* Recommend local **Lawyers, Counselors, and Doctors** to support your case.`;
      }

      setBotMessages(prev => prev.filter(m => m.id !== typingId).concat({
        id: Date.now().toString(),
        sender: 'bot',
        text: mockReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
    }
  };

  const clearBotMessages = () => {
    setBotMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: 'Hello! I am your AI Bodyguard & Legal Advisor. How can I help you today? You can describe any safety threat, stalker issue, or legal concern, and I will outline your options, laws, and professional help contacts.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };


  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        user,
        login,
        logout,
        activeSOS,
        sosCountdown,
        triggerSOS,
        cancelSOS,
        activateEmergencyMode,
        deactivateEmergencyMode,
        contacts,
        addContact,
        updateContact,
        deleteContact,
        voiceKeywords,
        setVoiceKeywords,
        audioSensitivity,
        setAudioSensitivity,
        shakeThreshold,
        setShakeThreshold,
        fallThreshold,
        setFallThreshold,
        threatThreshold,
        setThreatThreshold,
        signals,
        simulateSignal,
        threatScore,
        recordings,
        addRecording,
        incidents,
        resolveIncident,
        volunteers,
        simulateVolunteerAcceptance,
        gpsCoords,
        updateGpsCoords,
        gpsHistory,
        simulationLogs,
        addLog,
        clearLogs,
        networkStatus,
        setNetworkStatus,
        isFakeCalling,
        fakeCallTimer,
        fakeCallContactName,
        setFakeCallContactName,
        triggerFakeCall,
        acceptFakeCall,
        declineFakeCall,
        isFakeCallRinging,

        isFakeCallActive,
        botMessages,
        sendBotMessage,
        clearBotMessages,
      }}
    >

      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
