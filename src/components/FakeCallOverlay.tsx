import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Phone, PhoneOff, Mic, Grid, Volume2, User, HelpCircle } from 'lucide-react';

export const FakeCallOverlay: React.FC = () => {
  const {
    fakeCallContactName,
    acceptFakeCall,
    declineFakeCall,
    isFakeCallRinging,
    isFakeCallActive,
    addLog
  } = useApp();

  const [callDuration, setCallDuration] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<any>(null);
  const speakTimeoutRef = useRef<any>(null);

  // 1. Synthetic Telephone Ringer (Web Audio API)
  useEffect(() => {
    if (isFakeCallRinging) {
      // Start Ringing Tone
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const playRing = () => {
        if (ctx.state === 'closed') return;
        
        // Bell frequencies: U.S. Ringback tone is 440Hz + 480Hz mixed
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.frequency.value = 440;
        osc2.frequency.value = 480;
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start();
        osc2.start();

        // Stop ringing after 1.8 seconds
        setTimeout(() => {
          try {
            osc1.stop();
            osc2.stop();
          } catch (e) {}
        }, 1800);
      };

      // Play immediately then every 4 seconds
      playRing();
      ringIntervalRef.current = setInterval(playRing, 4000);
    }

    return () => {
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isFakeCallRinging]);

  // 2. Active Call Timer & Deterrent Speech Synthesis
  useEffect(() => {
    let timer: any;
    if (isFakeCallActive) {
      // Start timer
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      // Play automated safety voice agent to scare off potential attackers
      triggerDeterrentSpeech();
    }

    return () => {
      clearInterval(timer);
      if (speakTimeoutRef.current) clearTimeout(speakTimeoutRef.current);
      window.speechSynthesis.cancel();
    };
  }, [isFakeCallActive]);

  const triggerDeterrentSpeech = () => {
    // Stop any running speech
    window.speechSynthesis.cancel();

    const textScript = `SafeShield Dispatch Agent 409. We have established secure connection and live GPS tracking is broadcast. Our team has recorded a potential sensor spike at your location. Officers are in route. If everything is fine, please reply with your safe PIN, otherwise, standby for police assistance.`;
    
    // Short delay to mimic answering
    speakTimeoutRef.current = setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(textScript);
      utterance.rate = 0.95; // Slightly slower, calm/authoritative
      utterance.pitch = 1.0;
      
      // Select an English voice if available
      const voices = window.speechSynthesis.getVoices();
      const engVoice = voices.find(v => v.lang.startsWith('en'));
      if (engVoice) utterance.voice = engVoice;

      window.speechSynthesis.speak(utterance);
      addLog('Fake Call deterrent agent voice activated.');
    }, 1500);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="animate-slide-up"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5000,
        background: '#090e17',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '50px 30px',
        color: '#f8fafc',
        borderBottomLeftRadius: '40px',
        borderBottomRightRadius: '40px'
      }}
    >
      
      {/* Caller Info */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '18px'
        }}>
          <User size={44} style={{ color: '#94a3b8' }} />
        </div>
        
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px' }}>
          {fakeCallContactName}
        </h2>
        <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500', display: 'block' }}>
          {isFakeCallRinging ? 'SafeShield Protected Line' : 'Connected'}
        </span>
        {isFakeCallActive && (
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981', marginTop: '10px', display: 'block', fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(callDuration)}
          </span>
        )}
      </div>

      {isFakeCallRinging ? (
        /* RINGING STATE INTERACTIVE CONTROLS */
        <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', marginBottom: '40px' }}>
          
          {/* Decline button */}
          <button
            onClick={declineFakeCall}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#ef4444',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(239,68,68,0.4)'
            }}
          >
            <PhoneOff size={24} />
          </button>

          {/* Accept button */}
          <button
            onClick={acceptFakeCall}
            className="animate-pulse-ring-green"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#10b981',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(16,185,129,0.4)'
            }}
          >
            <Phone size={24} />
          </button>
          
        </div>
      ) : (
        /* ACTIVE CALL STATE INTERACTIVE CONTROLS */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', marginBottom: '30px' }}>
          
          {/* Call Screen keypad grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '220px' }}>
            {[
              { icon: <Mic size={18} />, label: 'mute' },
              { icon: <Grid size={18} />, label: 'keypad' },
              { icon: <Volume2 size={18} />, label: 'speaker' },
              { icon: <User size={18} />, label: 'contacts' },
              { icon: <HelpCircle size={18} />, label: 'info' }
            ].map((btn, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f8fafc',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  {btn.icon}
                </div>
                <span style={{ fontSize: '10px', color: '#64748b' }}>{btn.label}</span>
              </div>
            ))}
          </div>

          {/* Decline/Disconnect call */}
          <button
            onClick={declineFakeCall}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#ef4444',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(239,68,68,0.4)'
            }}
          >
            <PhoneOff size={24} />
          </button>

        </div>
      )}
      
    </div>
  );
};
