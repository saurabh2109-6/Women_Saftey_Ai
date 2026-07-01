import React, { useEffect, useRef, useState } from 'react';
import { useApp, type Recording } from '../context/AppContext';
import { ShieldAlert, AlertOctagon, MapPin, Radio, Volume2, ShieldCheck } from 'lucide-react';

export const EmergencyOverlay: React.FC = () => {
  const {
    sosCountdown,
    cancelSOS,
    deactivateEmergencyMode,
    gpsCoords,
    networkStatus,
    addRecording
  } = useApp();

  const [secsLeft, setSecsLeft] = useState(5);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  // Synchronize countdown display
  useEffect(() => {
    setSecsLeft(sosCountdown);
  }, [sosCountdown]);

  const isCountdown = secsLeft > 0;

  // Setup Media Recorder when emergency activates (secsLeft reaches 0)
  useEffect(() => {
    if (!isCountdown) {
      startRecording();
    }

    return () => {
      stopRecordingAndSave();
    };
  }, [isCountdown]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000);
        
        // Convert Blob to Base64 to store in localStorage
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const newRec: Recording = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            duration: `${durationSec}s`,
            src: base64data,
            title: `Emergency Audio Log #${Math.floor(100 + Math.random() * 900)}`
          };
          addRecording(newRec);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio track elements
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
    } catch (e) {
      console.warn('Cannot record audio: mic permission not granted or unsupported media formats.');
    }
  };

  const stopRecordingAndSave = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        // ignore errors
      }
    }
  };

  return (
    <div
      className="animate-slide-up"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5000,
        background: isCountdown ? '#0f0c1b' : 'rgba(5, 4, 10, 0.98)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        borderBottomLeftRadius: '40px',
        borderBottomRightRadius: '40px'
      }}
    >
      {/* Red and Blue flasher background for emergency active phase */}
      {!isCountdown && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
          animation: 'pulse 1.2s infinite alternate',
          pointerEvents: 'none',
          zIndex: -1
        }} />
      )}

      {isCountdown ? (
        /* Countdown Mode */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '2px dashed #f43f5e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'spin 12s linear infinite'
          }}>
            <ShieldAlert size={40} style={{ color: '#f43f5e' }} />
          </div>

          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#f8fafc', marginBottom: '8px' }}>
              SOS Trigger Pending
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', padding: '0 20px', lineHeight: '1.5' }}>
              Confirm emergency. Sending GPS coordinates & distress alerts to emergency services in:
            </p>
          </div>

          <div style={{
            fontSize: '92px',
            fontWeight: '900',
            color: '#f43f5e',
            lineHeight: '1',
            margin: '10px 0',
            textShadow: '0 4px 20px rgba(244, 63, 94, 0.5)',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {secsLeft}
          </div>

          {/* Large Hold/Tap to Cancel Button */}
          <button
            onClick={cancelSOS}
            style={{
              padding: '16px 40px',
              borderRadius: '30px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              color: '#f8fafc',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              letterSpacing: '0.05em',
              transition: 'all 0.15s ease',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
            }}
          >
            CANCEL ALERT (FALSE ALARM)
          </button>
        </div>
      ) : (
        /* Emergency Activated Mode */
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', width: '100%', padding: '20px 0 10px 0' }}>
          
          {/* Header Warning */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div className="animate-blink" style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#f43f5e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(244, 63, 94, 0.8)'
            }}>
              <AlertOctagon size={32} style={{ color: 'white' }} />
            </div>
            
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#f43f5e', letterSpacing: '0.05em' }}>
              EMERGENCY ACTIVE
            </h2>
            <span style={{ fontSize: '11px', color: '#94a3b8', background: 'rgba(255,255,255,0.04)', padding: '3px 10px', borderRadius: '4px' }}>
              Dispatching SOS & Tracking Live Location
            </span>
          </div>

          {/* Live Telemetry Progress Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '20px 0', textAlign: 'left' }}>
            {[
              { icon: <MapPin size={14} />, text: `GPS: ${gpsCoords.lat.toFixed(5)}, ${gpsCoords.lng.toFixed(5)}`, status: 'active', label: 'Broadcasting' },
              { icon: <Radio size={14} />, text: 'Cloud upload: SafeShield secure db', status: networkStatus === 'online' ? 'active' : 'fallback', label: networkStatus === 'online' ? 'Uploading' : 'Offline Mode' },
              { icon: <Volume2 size={14} />, text: 'Evidence: Recording audio logs', status: 'active', label: 'Mic Recording' }
            ].map((item, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#f8fafc' }}>
                  <div style={{ color: item.status === 'active' ? '#f43f5e' : '#f59e0b' }}>{item.icon}</div>
                  <span>{item.text}</span>
                </div>
                <span className="animate-blink" style={{
                  fontSize: '9px',
                  fontWeight: '700',
                  color: item.status === 'active' ? '#f43f5e' : '#f59e0b',
                  background: item.status === 'active' ? 'rgba(244,63,94,0.1)' : 'rgba(245,158,11,0.1)',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  {item.label.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          {/* I am Safe resolution button */}
          <button
            onClick={() => {
              stopRecordingAndSave();
              deactivateEmergencyMode();
            }}
            style={{
              padding: '14px',
              borderRadius: '16px',
              background: '#10b981',
              border: 'none',
              color: 'white',
              fontSize: '14px',
              fontWeight: '800',
              cursor: 'pointer',
              letterSpacing: '0.05em',
              transition: 'all 0.15s ease',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <ShieldCheck size={18} />
            <span>I AM SAFE - CANCEL SOS</span>
          </button>
          
        </div>
      )}
    </div>
  );
};
