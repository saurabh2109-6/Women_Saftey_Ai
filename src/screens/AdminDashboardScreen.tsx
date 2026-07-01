import { useApp } from '../context/AppContext';
import { ArrowLeft, ShieldCheck, Activity, Users, ShieldAlert, CheckSquare } from 'lucide-react';

export const AdminDashboardScreen: React.FC = () => {
  const { incidents, resolveIncident, setCurrentScreen } = useApp();

  const activeIncidents = incidents.filter(i => i.status === 'active');
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '14px', overflowY: 'auto', maxHeight: '680px', paddingRight: '4px' }}>
      
      {/* Screen Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
        <button
          onClick={() => setCurrentScreen('home')}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <ArrowLeft size={18} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc' }}>
          Admin Dashboard
        </h2>
      </div>

      {/* Analytical Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        
        {/* Card 1 */}
        <div className="glass-panel" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Active Alerts</span>
            <ShieldAlert size={14} style={{ color: activeIncidents.length > 0 ? '#f43f5e' : '#64748b' }} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: activeIncidents.length > 0 ? '#f43f5e' : '#f8fafc' }}>
            {activeIncidents.length}
          </span>
          <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>Requires dispatch</p>
        </div>

        {/* Card 2 */}
        <div className="glass-panel" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Volunteers</span>
            <Users size={14} style={{ color: '#10b981' }} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#f8fafc' }}>158</span>
          <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>Online in area</p>
        </div>

        {/* Card 3 */}
        <div className="glass-panel" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Average Response</span>
            <Activity size={14} style={{ color: '#3b82f6' }} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#f8fafc' }}>2.4 min</span>
          <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>SMS & dispatch speed</p>
        </div>

        {/* Card 4 */}
        <div className="glass-panel" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Total Solved</span>
            <ShieldCheck size={14} style={{ color: '#10b981' }} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#f8fafc' }}>
            {resolvedIncidents.length + 24}
          </span>
          <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>Cases completed</p>
        </div>

      </div>

      {/* SVG Analytics Chart */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
          Incidents Rate by Time of Day
        </h3>
        
        {/* Simple inline SVG chart */}
        <div style={{ width: '100%', height: '80px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '0 4px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { hour: '04 AM', rate: 10, label: 'Quiet' },
            { hour: '08 AM', rate: 25, label: '' },
            { hour: '12 PM', rate: 35, label: '' },
            { hour: '04 PM', rate: 45, label: '' },
            { hour: '08 PM', rate: 85, label: 'Peak' },
            { hour: '12 AM', rate: 95, label: 'Peak' }
          ].map((bar, idx) => (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              {bar.label && (
                <span style={{ fontSize: '8px', color: bar.rate > 80 ? '#f43f5e' : '#64748b', fontWeight: 'bold', marginBottom: '2px' }}>
                  {bar.label}
                </span>
              )}
              <div
                style={{
                  width: '100%',
                  height: `${bar.rate}%`,
                  background: bar.rate > 80 ? 'linear-gradient(0deg, #f43f5e, #be123c)' : 'rgba(59, 130, 246, 0.4)',
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 0.3s ease'
                }}
              />
              <span style={{ fontSize: '8px', color: '#64748b', marginTop: '4px', whiteSpace: 'nowrap' }}>{bar.hour}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Operations Incident Monitor list */}
      <div>
        <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
          Incident Log & Resolutions
        </h3>

        {incidents.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
            No incident logs to display. Try triggering an SOS.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {incidents.map(inc => (
              <div
                key={inc.id}
                className="glass-panel"
                style={{
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: '10px'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc' }}>
                    {inc.triggerType}
                  </h4>
                  <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
                    {inc.date} • {inc.time} • Pos: {inc.location}
                  </div>
                </div>
                <div>
                  {inc.status === 'active' ? (
                    <button
                      onClick={() => resolveIncident(inc.id)}
                      style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        color: '#10b981',
                        fontSize: '10px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <CheckSquare size={12} /> Resolve
                    </button>
                  ) : (
                    <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>Resolved</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
