import { useApp } from '../context/AppContext';
import { Shield, Volume2, Moon, Navigation, WifiOff, Terminal, CheckCircle2 } from 'lucide-react';

export const SimulationControlPanel: React.FC = () => {
  const {
    signals,
    simulateSignal,
    threatScore,
    threatThreshold,
    gpsCoords,
    updateGpsCoords,
    simulationLogs,
    clearLogs,
    networkStatus,
    setNetworkStatus,
    triggerSOS,
    activeSOS,
    deactivateEmergencyMode,
    addLog
  } = useApp();

  const handleSimulateFall = () => {
    simulateSignal('fall', true);
    triggerSOS('Fall Detection (Simulated)');
    setTimeout(() => simulateSignal('fall', false), 4000);
  };

  const handleSimulateShake = () => {
    simulateSignal('shake', true);
    triggerSOS('Shake-to-SOS (Simulated)');
    setTimeout(() => simulateSignal('shake', false), 4000);
  };

  const handleSimulateKeyword = (phrase: string) => {
    addLog(`Voice keyword simulated: "${phrase}"`);
    simulateSignal('wordMatch', true);
    setTimeout(() => simulateSignal('wordMatch', false), 4000);
  };

  const handleSimulateScream = () => {
    simulateSignal('scream', true);
    setTimeout(() => simulateSignal('scream', false), 4000);
  };

  const setLocation = (type: 'safe' | 'danger') => {
    if (type === 'safe') {
      updateGpsCoords(28.6110, 77.2040); // Safe Shelter Zone
    } else {
      updateGpsCoords(28.6190, 77.2160); // High Crime Zone
    }
  };

  return (
    <div className="glass-panel" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', height: '680px', minWidth: '320px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <Terminal size={22} style={{ color: '#10b981' }} />
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#f8fafc' }}>Simulation Console</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
        
        {/* Threat Score Monitoring */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8', fontWeight: '600' }}>AI Threat score Engine</span>
            <span style={{ color: threatScore >= threatThreshold ? '#f43f5e' : '#10b981', fontWeight: 'bold' }}>
              {threatScore} / 100
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${threatScore}%`,
                height: '100%',
                background: threatScore >= threatThreshold ? 'linear-gradient(90deg, #f43f5e, #be123c)' : 'linear-gradient(90deg, #10b981, #3b82f6)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <p style={{ fontSize: '10px', color: '#64748b', marginTop: '6px' }}>
            Score is calculated dynamically. Auto-SOS triggers when score reaches {threatThreshold}%.
          </p>
        </div>

        {/* Sensor Simulators */}
        <div>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={14} style={{ color: '#f43f5e' }} />
            Sensor & Threat Triggers
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button className="btn-secondary" onClick={handleSimulateFall} style={{ padding: '8px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span>🚨 Fall Spike</span>
            </button>
            <button className="btn-secondary" onClick={handleSimulateShake} style={{ padding: '8px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span>📳 Shake Spike</span>
            </button>
            <button className="btn-secondary" onClick={handleSimulateScream} style={{ padding: '8px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Volume2 size={12} />
              <span>🔊 Scream Vol</span>
            </button>
            <button
              className="btn-secondary"
              onClick={() => simulateSignal('nightRisk', !signals.nightRisk)}
              style={{
                padding: '8px 10px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                borderColor: signals.nightRisk ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                color: signals.nightRisk ? '#f59e0b' : '#f8fafc'
              }}
            >
              <Moon size={12} />
              <span>🌙 Night Mode</span>
            </button>
          </div>
        </div>

        {/* GPS Coordinates Simulation */}
        <div>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Navigation size={14} style={{ color: '#3b82f6' }} />
            Location Coordinates (GPS)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <button className="btn-secondary" onClick={() => setLocation('safe')} style={{ padding: '8px 10px', fontSize: '12px' }}>
              🌳 Enter Safe Zone
            </button>
            <button className="btn-secondary" onClick={() => setLocation('danger')} style={{ padding: '8px 10px', fontSize: '12px', color: '#f43f5e', borderColor: 'rgba(244,63,94,0.2)' }}>
              ☣️ Enter Crime Zone
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
            <span>Lat: {gpsCoords.lat.toFixed(5)}</span>
            <span>Lng: {gpsCoords.lng.toFixed(5)}</span>
          </div>
        </div>

        {/* Keyword Phrase simulation */}
        <div>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '10px' }}>
            Simulate Voice Keywords
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {['"Help me!"', '"Bachao!"', '"Leave me alone!"'].map(kw => (
              <button
                key={kw}
                className="btn-secondary"
                onClick={() => handleSimulateKeyword(kw)}
                style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '20px' }}
              >
                🗣️ {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Environment Operations */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-secondary"
            onClick={() => {
              const nextStatus = networkStatus === 'online' ? 'offline' : 'online';
              setNetworkStatus(nextStatus);
            }}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '12px',
              borderColor: networkStatus === 'offline' ? '#f43f5e' : 'rgba(255,255,255,0.08)',
              color: networkStatus === 'offline' ? '#f43f5e' : '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <WifiOff size={14} />
            <span>{networkStatus === 'online' ? 'Force Offline Mode' : 'Go Back Online'}</span>
          </button>
          
          {activeSOS && (
            <button
              className="btn-primary"
              onClick={deactivateEmergencyMode}
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '12px',
                background: '#10b981',
                boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <CheckCircle2 size={14} />
              <span>Mark Resolved</span>
            </button>
          )}
        </div>

        {/* Backend Logs Console */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '160px', maxHeight: '200px', background: '#050811', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', letterSpacing: '0.05em' }}>SYSTEM BACKEND ACTIVITY LOG</span>
            <button onClick={clearLogs} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '10px', cursor: 'pointer' }}>
              Clear
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'monospace', fontSize: '10.5px' }}>
            {simulationLogs.map((log, idx) => {
              let color = '#94a3b8';
              if (log.includes('EMERGENCY')) color = '#f43f5e';
              else if (log.includes('SMS') || log.includes('Sent')) color = '#3b82f6';
              else if (log.includes('active') || log.includes('granted') || log.includes('accepted')) color = '#10b981';
              else if (log.includes('warning') || log.includes('UNSAFE')) color = '#f59e0b';
              return (
                <div key={idx} style={{ color, wordBreak: 'break-all', lineHeight: '1.4' }}>
                  {log}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
