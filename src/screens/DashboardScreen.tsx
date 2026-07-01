import React, { useState } from 'react';
import { useApp, type Recording } from '../context/AppContext';
import { Play, Pause, FolderHeart, Calendar, Clock, Volume2, ShieldAlert, Award } from 'lucide-react';

export const DashboardScreen: React.FC = () => {
  const { recordings, incidents, volunteers, activeSOS } = useApp();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handlePlayPause = (rec: Recording) => {
    if (playingId === rec.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(rec.src);
      audio.onended = () => setPlayingId(null);
      audio.play();
      audioRef.current = audio;
      setPlayingId(rec.id);
    }
  };

  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '16px' }}>
      
      {/* Screen Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FolderHeart size={20} style={{ color: '#f43f5e' }} />
          Evidence & Incidents
        </h2>
      </div>

      {/* Community Responders Card */}
      <div className="glass-panel" style={{ padding: '14px', border: '1px solid rgba(16,185,129,0.15)', background: 'rgba(16,185,129,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Award size={16} style={{ color: '#10b981' }} />
          <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            SafeShield Community Network
          </h4>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {volunteers.map(v => (
            <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '6px' }}>
              <span style={{ color: '#f8fafc', fontWeight: '500' }}>{v.name}</span>
              <span style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: '600',
                background: v.accepted && activeSOS ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                color: v.accepted && activeSOS ? '#10b981' : '#94a3b8'
              }}>
                {v.accepted && activeSOS ? '🚨 Navigating to you' : '🟢 Standing By'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Audio Evidence Records */}
      <div>
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Secure Audio Logs
        </h3>
        
        {recordings.length === 0 ? (
          <div style={{ padding: '24px 14px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
            <Volume2 size={20} style={{ margin: '0 auto 6px auto', display: 'block' }} />
            <span style={{ fontSize: '11px' }}>No emergency recordings captured yet.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
            {recordings.map(rec => (
              <div
                key={rec.id}
                className="glass-panel"
                style={{
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => handlePlayPause(rec)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: playingId === rec.id ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: playingId === rec.id ? '#f43f5e' : '#10b981',
                      cursor: 'pointer'
                    }}
                  >
                    {playingId === rec.id ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <div>
                    <h5 style={{ fontSize: '12px', fontWeight: '700', color: '#f8fafc' }}>{rec.title}</h5>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Calendar size={10} />{rec.date}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Clock size={10} />{rec.time}</span>
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>{rec.duration}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incident History Timeline */}
      <div>
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Safety Incident Log
        </h3>

        {incidents.length === 0 ? (
          <div style={{ padding: '24px 14px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
            <ShieldAlert size={20} style={{ margin: '0 auto 6px auto', display: 'block' }} />
            <span style={{ fontSize: '11px' }}>No security events logged.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
            {incidents.map(inc => (
              <div
                key={inc.id}
                className="glass-panel"
                style={{
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: '10px',
                  borderLeft: `3px solid ${inc.status === 'active' ? '#f43f5e' : '#10b981'}`
                }}
              >
                <div>
                  <h5 style={{ fontSize: '12px', fontWeight: '700', color: '#f8fafc' }}>
                    {inc.triggerType}
                  </h5>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
                    <span>{inc.date}</span>
                    <span>{inc.time}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '9px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    background: inc.status === 'active' ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.12)',
                    color: inc.status === 'active' ? '#f43f5e' : '#10b981'
                  }}>
                    {inc.status.toUpperCase()}
                  </span>
                  <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>
                    Threat: {inc.threatScore}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
