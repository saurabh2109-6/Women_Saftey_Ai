import { useApp } from '../context/AppContext';
import { MapPreview } from '../components/MapPreview';
import { Eye, ShieldAlert, PhoneIncoming, Compass, BarChart2 } from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    user,
    threatScore,
    threatThreshold,
    triggerSOS,
    signals,
    setCurrentScreen,
    triggerFakeCall
  } = useApp();

  const getThreatLevel = () => {
    if (threatScore >= threatThreshold) return { label: 'CRITICAL DANGER', color: '#f43f5e' };
    if (threatScore > 40) return { label: 'ELEVATED RISK', color: '#f59e0b' };
    return { label: 'SECURE / ARMED', color: '#10b981' };
  };

  const threat = getThreatLevel();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
      
      {/* Home Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src={user?.avatar}
            alt="Avatar"
            style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc' }}>Hello, {user?.name.split(' ')[0]}</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: threat.color }} />
              <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>{threat.label}</span>
            </div>
          </div>
        </div>

        {/* Admin Switch */}
        <button
          onClick={() => setCurrentScreen('admin')}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#f8fafc',
            transition: 'all 0.2s'
          }}
          title="Admin Dashboard"
        >
          <BarChart2 size={16} />
        </button>
      </div>

      {/* Main SOS Trigger Button */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '6px 0 10px 0' }}>
        <button
          className="sos-button"
          onClick={() => triggerSOS('Manual Panic Button')}
        >
          <div className="sos-ripple" />
          <ShieldAlert size={48} style={{ color: 'white', marginBottom: '4px' }} />
          <span style={{ fontSize: '20px', fontWeight: '800', color: 'white', letterSpacing: '0.05em' }}>SOS</span>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', fontWeight: '500', marginTop: '2px' }}>TAP TO ACTIVATE</span>
        </button>
      </div>

      {/* Active Threat Assessment */}
      <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <div>
          <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Risk Assessment
          </span>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc', margin: '2px 0 4px 0' }}>
            Threat Score: <span style={{ color: threat.color }}>{threatScore}%</span>
          </h4>
          
          {/* Active Sensor Badges */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {signals.scream && <span style={{ fontSize: '9px', background: 'rgba(244,63,94,0.15)', color: '#f43f5e', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>🔊 Noise</span>}
            {signals.shake && <span style={{ fontSize: '9px', background: 'rgba(244,63,94,0.15)', color: '#f43f5e', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>📳 Shake</span>}
            {signals.fall && <span style={{ fontSize: '9px', background: 'rgba(244,63,94,0.15)', color: '#f43f5e', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>🚨 Fall</span>}
            {signals.wordMatch && <span style={{ fontSize: '9px', background: 'rgba(244,63,94,0.15)', color: '#f43f5e', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>🗣️ Keyword</span>}
            {signals.nightRisk && <span style={{ fontSize: '9px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>🌙 Night</span>}
            {signals.unsafeLocation && <span style={{ fontSize: '9px', background: 'rgba(244,63,94,0.15)', color: '#f43f5e', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>☣️ Unsafe</span>}
            {!Object.values(signals).some(v => v) && <span style={{ fontSize: '9px', background: 'rgba(16,185,129,0.12)', color: '#10b981', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>🛡️ All Sensors Secure</span>}
          </div>
        </div>

        {/* Small threat gauge circle */}
        <div style={{ position: 'relative', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <circle cx="25" cy="25" r="20" stroke="rgba(255,255,255,0.06)" strokeWidth="4" fill="transparent" />
            <circle
              cx="25"
              cy="25"
              r="20"
              stroke={threat.color}
              strokeWidth="4"
              fill="transparent"
              strokeDasharray="125.6"
              strokeDashoffset={125.6 - (125.6 * threatScore) / 100}
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            />
          </svg>
          <span style={{ position: 'absolute', fontSize: '11px', fontWeight: '800', color: '#f8fafc' }}>
            {threatScore}
          </span>
        </div>
      </div>

      {/* GPS Map Interface */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Compass size={14} style={{ color: '#3b82f6' }} />
            Live Safety Telemetry
          </span>
          <span style={{ fontSize: '10px', color: '#10b981', fontWeight: '700' }}>Sharing Active</span>
        </div>
        <MapPreview />
      </div>

      {/* Quick Action Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        
        {/* Fake Call Button */}
        <button
          className="glass-panel"
          onClick={() => triggerFakeCall(5)} // Schedule after 5 seconds
          style={{
            padding: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            textAlign: 'center',
            color: '#f8fafc'
          }}
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <PhoneIncoming size={18} />
          </div>
          <div>
            <h5 style={{ fontSize: '12px', fontWeight: '700' }}>Schedule Fake Call</h5>
            <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>Triggers ringtone in 5s</p>
          </div>
        </button>

        {/* Safe Walk Simulation widget */}
        <button
          className="glass-panel"
          onClick={() => triggerSOS('Safe Walk Silent Trigger')}
          style={{
            padding: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            textAlign: 'center',
            color: '#f8fafc'
          }}
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e' }}>
            <Eye size={18} />
          </div>
          <div>
            <h5 style={{ fontSize: '12px', fontWeight: '700' }}>Safe Walk Alarm</h5>
            <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>Starts silent countdown</p>
          </div>
        </button>
        
      </div>
      
    </div>
  );
};
