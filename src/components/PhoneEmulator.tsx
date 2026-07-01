import { useApp } from '../context/AppContext';
import { Home, Users, FolderHeart, Settings, Wifi, WifiOff, Battery } from 'lucide-react';
import { AuthScreen } from '../screens/AuthScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ContactsScreen } from '../screens/ContactsScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { EmergencyOverlay } from './EmergencyOverlay';
import { FakeCallOverlay } from './FakeCallOverlay';
import { AudioThreatDetector } from './AudioThreatDetector';
import { MotionSensorHandler } from './MotionSensorHandler';

export const PhoneEmulator: React.FC = () => {
  const {
    currentScreen,
    setCurrentScreen,
    user,
    activeSOS,
    isFakeCallRinging,
    isFakeCallActive,
    networkStatus
  } = useApp();

  const renderScreen = () => {
    if (!user) return <AuthScreen />;

    switch (currentScreen) {
      case 'auth':
        return <AuthScreen />;
      case 'home':
        return <HomeScreen />;
      case 'contacts':
        return <ContactsScreen />;
      case 'dashboard':
        return <DashboardScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'admin':
        return <AdminDashboardScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const showNav = user && !isFakeCallRinging && !isFakeCallActive;
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      style={{
        position: 'relative',
        width: '380px',
        height: '780px',
        borderRadius: '50px',
        background: '#090d16',
        border: '12px solid #1e293b',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 2px rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* Background listeners (Audio & Motion) */}
      <AudioThreatDetector />
      <MotionSensorHandler />

      {/* Screen overlays */}
      {activeSOS && <EmergencyOverlay />}
      {(isFakeCallRinging || isFakeCallActive) && <FakeCallOverlay />}

      {/* Phone Notch & Speaker */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '150px',
          height: '28px',
          background: '#1e293b',
          borderBottomLeftRadius: '18px',
          borderBottomRightRadius: '18px',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {/* Speaker ear piece */}
        <div style={{ width: '45px', height: '4px', background: '#090d16', borderRadius: '4px', marginBottom: '8px' }} />
      </div>

      {/* Top Status Bar */}
      <div
        style={{
          height: '44px',
          padding: '12px 28px 0 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(5, 8, 17, 0.6)',
          zIndex: 999,
          fontSize: '12px',
          fontWeight: '600',
          color: '#f8fafc'
        }}
      >
        <span>{timeStr}</span>
        
        {/* Connection status icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {networkStatus === 'online' ? (
            <Wifi size={14} style={{ color: '#10b981' }} />
          ) : (
            <WifiOff size={14} style={{ color: '#f43f5e' }} />
          )}
          <Battery size={16} />
        </div>
      </div>

      {/* Main Screen Content Frame */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '16px 20px',
          paddingBottom: showNav ? '84px' : '20px',
          background: '#090d16',
          position: 'relative'
        }}
      >
        {renderScreen()}
      </div>

      {/* Navigation Bar */}
      {showNav && (
        <div className="bottom-nav">
          <div className={`nav-item ${currentScreen === 'home' ? 'active' : ''}`} onClick={() => setCurrentScreen('home')}>
            <Home size={20} />
            <span>SOS Home</span>
          </div>
          
          <div className={`nav-item ${currentScreen === 'contacts' ? 'active' : ''}`} onClick={() => setCurrentScreen('contacts')}>
            <Users size={20} />
            <span>Contacts</span>
          </div>
          
          <div className={`nav-item ${currentScreen === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentScreen('dashboard')}>
            <FolderHeart size={20} />
            <span>Evidence</span>
          </div>
          
          <div className={`nav-item ${currentScreen === 'settings' ? 'active' : ''}`} onClick={() => setCurrentScreen('settings')}>
            <Settings size={20} />
            <span>Settings</span>
          </div>
        </div>
      )}

      {/* Home Indicator Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '5px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '4px',
          background: '#475569',
          borderRadius: '2px',
          zIndex: 1000
        }}
      />
    </div>
  );
};
