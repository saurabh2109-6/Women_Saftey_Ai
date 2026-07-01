import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Send, Scale, BookOpen, Phone, MapPin, Star, Trash2 } from 'lucide-react';

interface Professional {
  id: string;
  name: string;
  type: 'lawyer' | 'counselor' | 'doctor';
  specialty: string;
  rating: number;
  location: string;
  phone: string;
  experience: string;
}

const PROFESSIONALS_DB: Professional[] = [
  {
    id: 'p1',
    name: 'Advocate Meera Sharma',
    type: 'lawyer',
    specialty: 'Women Rights & Criminal Law',
    rating: 4.9,
    location: 'New Delhi (2.1 km)',
    phone: '+91 99887 76655',
    experience: '12 yrs exp'
  },
  {
    id: 'p2',
    name: 'Advocate Rohan Mehra',
    type: 'lawyer',
    specialty: 'Cyber Harassment & Stalking',
    rating: 4.8,
    location: 'Connaught Place (3.5 km)',
    phone: '+91 88776 65544',
    experience: '8 yrs exp'
  },
  {
    id: 'p3',
    name: 'Dr. Anjali Malhotra',
    type: 'counselor',
    specialty: 'Crisis Trauma & Psychological Support',
    rating: 4.9,
    location: 'South Ext (4.0 km)',
    phone: '+91 77665 54433',
    experience: '15 yrs exp'
  },
  {
    id: 'p4',
    name: 'Fortis Emergency Unit',
    type: 'doctor',
    specialty: 'Trauma & Emergency Forensic',
    rating: 4.7,
    location: 'Shalimar Bagh (5.2 km)',
    phone: '+91 11 4277 6222',
    experience: '24x7 Open'
  },
  {
    id: 'p5',
    name: 'Safdarjung Forensic Dept',
    type: 'doctor',
    specialty: 'Emergency Medical & Legal Triage',
    rating: 4.6,
    location: 'Ansari Nagar (1.8 km)',
    phone: '+91 11 2616 5060',
    experience: '24x7 Govt Care'
  }
];

export const GuardBotScreen: React.FC = () => {
  const { botMessages, sendBotMessage, clearBotMessages } = useApp();
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'directory' | 'roadmap'>('chat');
  const [filterType, setFilterType] = useState<'all' | 'lawyer' | 'counselor' | 'doctor'>('all');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [botMessages, activeTab]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendBotMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickPrompt = (phrase: string) => {
    sendBotMessage(phrase);
  };

  const filteredProfessionals = PROFESSIONALS_DB.filter(
    p => filterType === 'all' || p.type === filterType
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
      
      {/* Tab Navigation header */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px', gap: '8px' }}>
        <button 
          onClick={() => setActiveTab('chat')} 
          style={{
            flex: 1,
            padding: '6px',
            borderRadius: '8px',
            background: activeTab === 'chat' ? 'rgba(244,63,94,0.1)' : 'transparent',
            border: 'none',
            color: activeTab === 'chat' ? '#f43f5e' : '#94a3b8',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🛡️ AI Bodyguard
        </button>
        <button 
          onClick={() => setActiveTab('directory')} 
          style={{
            flex: 1,
            padding: '6px',
            borderRadius: '8px',
            background: activeTab === 'directory' ? 'rgba(244,63,94,0.1)' : 'transparent',
            border: 'none',
            color: activeTab === 'directory' ? '#f43f5e' : '#94a3b8',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          ⚖️ Help Directory
        </button>
        <button 
          onClick={() => setActiveTab('roadmap')} 
          style={{
            flex: 1,
            padding: '6px',
            borderRadius: '8px',
            background: activeTab === 'roadmap' ? 'rgba(244,63,94,0.1)' : 'transparent',
            border: 'none',
            color: activeTab === 'roadmap' ? '#f43f5e' : '#94a3b8',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          📖 Legal Guides
        </button>
      </div>

      {/* Content Rendering based on Active Tab */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Tab 1: AI Chat Bot */}
        {activeTab === 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 4px' }}>
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>
                Secure Bot Session
              </span>
              <button 
                onClick={clearBotMessages} 
                style={{ background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', cursor: 'pointer' }}
                title="Clear conversation"
              >
                <Trash2 size={12} /> Clear
              </button>
            </div>

            {/* Chat Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              paddingRight: '4px',
              marginBottom: '10px',
              maxHeight: '440px'
            }}>
              {botMessages.map((msg, idx) => (
                <div 
                  key={idx}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: msg.sender === 'user' ? '#f43f5e' : 'rgba(26, 36, 57, 0.75)',
                    border: msg.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                    padding: '10px 12px',
                    borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    color: '#f8fafc',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  <p style={{ 
                    fontSize: '12px', 
                    lineHeight: '1.4', 
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {msg.text}
                  </p>
                  <span style={{ 
                    display: 'block', 
                    fontSize: '8.5px', 
                    color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : '#64748b', 
                    marginTop: '4px',
                    textAlign: msg.sender === 'user' ? 'right' : 'left'
                  }}>
                    {msg.timestamp}
                  </span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompts */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '6px' }}>
              <button 
                onClick={() => handleQuickPrompt("Someone is following me, what should I do?")}
                style={{ 
                  flexShrink: 0,
                  background: 'rgba(255,255,255,0.04)', 
                  border: '1px solid rgba(255,255,255,0.06)', 
                  borderRadius: '20px', 
                  padding: '4px 10px', 
                  color: '#94a3b8', 
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                🚶‍♂️ Being Followed
              </button>
              <button 
                onClick={() => handleQuickPrompt("What are the laws for online harassment in India?")}
                style={{ 
                  flexShrink: 0,
                  background: 'rgba(255,255,255,0.04)', 
                  border: '1px solid rgba(255,255,255,0.06)', 
                  borderRadius: '20px', 
                  padding: '4px 10px', 
                  color: '#94a3b8', 
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                💻 Online Harassment Law
              </button>
              <button 
                onClick={() => handleQuickPrompt("How to register an FIR online?")}
                style={{ 
                  flexShrink: 0,
                  background: 'rgba(255,255,255,0.04)', 
                  border: '1px solid rgba(255,255,255,0.06)', 
                  borderRadius: '20px', 
                  padding: '4px 10px', 
                  color: '#94a3b8', 
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                📝 File online FIR
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '6px' }}>
              <input 
                type="text"
                className="form-input"
                placeholder="Ask bodyguard legal or safety advice..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  fontSize: '12px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(26, 36, 57, 0.4)',
                  color: '#f8fafc'
                }}
              />
              <button 
                type="submit" 
                className="btn-primary" 
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Help Directory */}
        {activeTab === 'directory' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            {/* Directory Filters */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
              {(['all', 'lawyer', 'counselor', 'doctor'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: filterType === type ? '#f43f5e' : 'rgba(255,255,255,0.08)',
                    background: filterType === type ? 'rgba(244,63,94,0.1)' : 'transparent',
                    color: filterType === type ? '#f43f5e' : '#94a3b8',
                    fontSize: '9.5px',
                    textTransform: 'capitalize',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* List of professionals */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
              {filteredProfessionals.map(p => (
                <div 
                  key={p.id}
                  className="glass-panel"
                  style={{
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc' }}>{p.name}</h4>
                      <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: '4px', color: '#f43f5e', fontWeight: '700', marginTop: '2px', display: 'inline-block' }}>
                        {p.specialty}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b', fontSize: '11px', fontWeight: 'bold' }}>
                      <Star size={12} fill="#f59e0b" />
                      <span>{p.rating}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10.5px', color: '#94a3b8', marginTop: '2px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={11} /> {p.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Scale size={11} /> {p.experience}
                    </span>
                  </div>

                  <a 
                    href={`tel:${p.phone}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: 'rgba(16,185,129,0.12)',
                      border: '1px solid rgba(16,185,129,0.2)',
                      borderRadius: '8px',
                      color: '#10b981',
                      fontSize: '11px',
                      fontWeight: '700',
                      textDecoration: 'none',
                      padding: '6px',
                      marginTop: '4px',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Phone size={12} /> Contact Professional ({p.phone})
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Legal Roadmap Guides */}
        {activeTab === 'roadmap' && (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
            <div className="glass-panel" style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={14} style={{ color: '#f43f5e' }} />
                Roadmap: Filing a police complaint (FIR)
              </h3>
              <ol style={{ fontSize: '11px', color: '#94a3b8', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px', lineHeight: '1.4' }}>
                <li><strong>Collect Evidence:</strong> Keep screenshots, audio recordings, or logs of timestamps of the harassment incidents.</li>
                <li><strong>Locate Jurisdiction:</strong> FIR can be filed at any police station (under 'Zero FIR' laws) regardless of location.</li>
                <li><strong>Drafting Statement:</strong> Clearly dictate what happened, who is the perpetrator (if known), and dates.</li>
                <li><strong>Get Copy:</strong> It is your legal right to receive a copy of the registered FIR completely free of charge.</li>
              </ol>
            </div>

            <div className="glass-panel" style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Scale size={14} style={{ color: '#3b82f6' }} />
                Your Rights & Indian Penal Codes
              </h3>
              <ul style={{ fontSize: '11.5px', color: '#94a3b8', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px', lineHeight: '1.4' }}>
                <li><strong>Section 354D (Stalking):</strong> Criminalizes physical or digital tracking of women. Max sentence: 3 to 5 years.</li>
                <li><strong>Section 354A (Harassment):</strong> Coercive verbal, physical, or sexual advances.</li>
                <li><strong>Section 509 (Insulting Modesty):</strong> Verbal abuse, gestures, or exhibitionism. Max sentence: 3 years.</li>
                <li><strong>Zero FIR Rights:</strong> Police stations cannot refuse filing an FIR by citing location jurisdiction.</li>
              </ul>
            </div>

            <div className="glass-panel" style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(59,130,246,0.03)' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#3b82f6', marginBottom: '4px' }}>
                Need Help Immediately?
              </h3>
              <p style={{ fontSize: '10.5px', color: '#94a3b8', lineHeight: '1.4' }}>
                If you are currently under danger, do not wait. Trigger our SOS button to broadcast details to your emergency circle or call 112 immediately.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
