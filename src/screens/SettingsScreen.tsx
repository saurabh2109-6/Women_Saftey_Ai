import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, LogOut } from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const {
    user,
    logout,
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
    addLog
  } = useApp();

  const [newKeyword, setNewKeyword] = useState('');
  const [micPerm, setMicPerm] = useState(true);
  const [gpsPerm, setGpsPerm] = useState(true);
  const [sensorPerm, setSensorPerm] = useState(true);

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    const kw = newKeyword.trim().toLowerCase();
    if (!voiceKeywords.includes(kw)) {
      setVoiceKeywords(prev => [...prev, kw]);
      addLog(`Settings: Custom safety phrase '${kw}' registered.`);
    }
    setNewKeyword('');
  };

  const handleRemoveKeyword = (kw: string) => {
    setVoiceKeywords(prev => prev.filter(k => k !== kw));
    addLog(`Settings: Custom safety phrase '${kw}' removed.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '14px', overflowY: 'auto', maxHeight: '680px', paddingRight: '4px' }}>
      
      {/* Screen Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={20} style={{ color: '#f43f5e' }} />
          Safety Settings
        </h2>
      </div>

      {/* Sensitivities */}
      <div className="glass-panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Sensors & Thresholds
        </h4>

        {/* Audio Sensitivity */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#f8fafc', marginBottom: '4px' }}>
            <span>Scream Sensitivity</span>
            <span style={{ fontWeight: 'bold' }}>{audioSensitivity}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="95"
            value={audioSensitivity}
            onChange={e => setAudioSensitivity(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#f43f5e' }}
          />
        </div>

        {/* Fall Sensitivity */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#f8fafc', marginBottom: '4px' }}>
            <span>Fall Detection sensitivity</span>
            <span style={{ fontWeight: 'bold' }}>{fallThreshold}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="90"
            value={fallThreshold}
            onChange={e => setFallThreshold(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#f43f5e' }}
          />
        </div>

        {/* Shake Sensitivity */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#f8fafc', marginBottom: '4px' }}>
            <span>Shake-to-SOS sensitivity</span>
            <span style={{ fontWeight: 'bold' }}>{shakeThreshold}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="90"
            value={shakeThreshold}
            onChange={e => setShakeThreshold(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#f43f5e' }}
          />
        </div>

        {/* Threat Score Threshold */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#f8fafc', marginBottom: '4px' }}>
            <span>Auto SOS trigger limit</span>
            <span style={{ fontWeight: 'bold', color: '#f43f5e' }}>{threatThreshold}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="95"
            value={threatThreshold}
            onChange={e => setThreatThreshold(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#f43f5e' }}
          />
        </div>
      </div>

      {/* Voice Keywords */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
          Distress Voice Phrases
        </h4>
        <form onSubmit={handleAddKeyword} style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Add phrase (e.g. Save me)"
            value={newKeyword}
            onChange={e => setNewKeyword(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          />
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}>
            Add
          </button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {voiceKeywords.map(kw => (
            <span
              key={kw}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '4px 10px',
                borderRadius: '20px',
                color: '#f8fafc'
              }}
            >
              <span>{kw}</span>
              <button
                type="button"
                onClick={() => handleRemoveKeyword(kw)}
                style={{ background: 'none', border: 'none', color: '#f43f5e', fontWeight: 'bold', cursor: 'pointer', fontSize: '10px' }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Permissions Control */}
      <div className="glass-panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          User Controlled Permissions
        </h4>
        
        {[
          { name: 'Microphone access (AI Ear)', state: micPerm, set: setMicPerm },
          { name: 'Live GPS location access', state: gpsPerm, set: setGpsPerm },
          { name: 'Device Accelerometer sensors', state: sensorPerm, set: setSensorPerm }
        ].map((perm, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
            <span style={{ color: '#f8fafc' }}>{perm.name}</span>
            <button
              onClick={() => {
                perm.set(!perm.state);
                addLog(`Permission: '${perm.name}' status updated to ${(!perm.state).toString().toUpperCase()}`);
              }}
              style={{
                background: perm.state ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                border: 'none',
                color: perm.state ? '#10b981' : '#f43f5e',
                fontSize: '10px',
                fontWeight: 'bold',
                padding: '3px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {perm.state ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        ))}
      </div>

      {/* Profile Card */}
      <div className="glass-panel" style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc' }}>{user?.name}</h4>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Blood Group: {user?.bloodGroup}</span>
        </div>
        <button
          onClick={logout}
          style={{
            background: 'rgba(244,63,94,0.1)',
            border: '1px solid rgba(244,63,94,0.2)',
            borderRadius: '8px',
            padding: '6px 12px',
            color: '#f43f5e',
            fontSize: '11px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <LogOut size={12} />
          Log Out
        </button>
      </div>

    </div>
  );
};
