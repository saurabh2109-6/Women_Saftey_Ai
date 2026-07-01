import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Mail, Phone, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, setCurrentScreen } = useApp();
  const [view, setView] = useState<'login' | 'register' | 'otp'>('login');
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  // Notification states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);

  const API_BASE = `http://${window.location.hostname}:5000`;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      });
      const data = await res.json();
      
      if (data.success) {
        setView('otp');
        if (data.simulated && data.otp) {
          setSimulatedOtp(data.otp);
        }
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Connection error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      setError('Please enter the OTP verification code.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode })
      });
      const data = await res.json();

      if (data.success) {
        // Automatically log in on successful verification
        login(data.user);
        setCurrentScreen('home');
      } else {
        setError(data.error || 'Invalid OTP code.');
      }
    } catch (err) {
      setError('Verification connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        login(data.user);
        setCurrentScreen('home');
      } else {
        setError(data.error || 'Invalid credentials.');
      }
    } catch (err) {
      setError('Connection failed. Verify server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', padding: '10px 0' }}>
      
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(244, 63, 94, 0.35)',
          marginBottom: '12px'
        }}>
          <Shield size={32} style={{ color: 'white' }} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          SafeShield AI
        </h1>
        <p style={{ fontSize: '12px', color: '#94a3b8', padding: '0 10px', lineHeight: '1.4' }}>
          Intelligent Guard, OTP Security & Professional Help
        </p>
      </div>

      {/* VIEW 1: Login Form */}
      {view === 'login' && (
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', marginBottom: '2px', textAlign: 'center' }}>
            Sign In to your Safeguard
          </h3>
          
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
              <input
                type="email"
                className="form-input"
                placeholder="riya@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '36px', fontSize: '12px' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '36px', fontSize: '12px' }}
                required
              />
            </div>
          </div>

          {error && <p style={{ fontSize: '11px', color: '#f43f5e', fontWeight: '600', textAlign: 'center' }}>⚠️ {error}</p>}

          <button type="submit" disabled={loading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
            <span>{loading ? 'Signing In...' : 'Login'}</span>
            <ArrowRight size={16} />
          </button>

          <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '6px' }}>
            New user?{' '}
            <span 
              onClick={() => { setView('register'); setError(''); }} 
              style={{ color: '#f43f5e', cursor: 'pointer', fontWeight: '700', textDecoration: 'underline' }}
            >
              Create Account
            </span>
          </p>
        </form>
      )}

      {/* VIEW 2: Register Form */}
      {view === 'register' && (
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc', marginBottom: '2px', textAlign: 'center' }}>
            Register Safety Account
          </h3>
          
          <div>
            <label style={{ display: 'block', fontSize: '10.5px', fontWeight: '600', color: '#94a3b8', marginBottom: '3px' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={13} style={{ position: 'absolute', left: '12px', top: '11px', color: '#64748b' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Riya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '36px', fontSize: '11.5px', padding: '8px 12px 8px 36px' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '10.5px', fontWeight: '600', color: '#94a3b8', marginBottom: '3px' }}>
              Email Address (For OTP Verification)
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={13} style={{ position: 'absolute', left: '12px', top: '11px', color: '#64748b' }} />
              <input
                type="email"
                className="form-input"
                placeholder="riya.sharma@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '36px', fontSize: '11.5px', padding: '8px 12px 8px 36px' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '10.5px', fontWeight: '600', color: '#94a3b8', marginBottom: '3px' }}>
              Mobile Phone
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={13} style={{ position: 'absolute', left: '12px', top: '11px', color: '#64748b' }} />
              <input
                type="tel"
                className="form-input"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ paddingLeft: '36px', fontSize: '11.5px', padding: '8px 12px 8px 36px' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '10.5px', fontWeight: '600', color: '#94a3b8', marginBottom: '3px' }}>
              Create Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={13} style={{ position: 'absolute', left: '12px', top: '11px', color: '#64748b' }} />
              <input
                type="password"
                className="form-input"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '36px', fontSize: '11.5px', padding: '8px 12px 8px 36px' }}
                required
              />
            </div>
          </div>

          {error && <p style={{ fontSize: '11px', color: '#f43f5e', fontWeight: '600', textAlign: 'center' }}>⚠️ {error}</p>}

          <button type="submit" disabled={loading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px', padding: '10px' }}>
            <span>{loading ? 'Sending OTP...' : 'Register & Send OTP'}</span>
            <ArrowRight size={15} />
          </button>

          <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '4px' }}>
            Already registered?{' '}
            <span 
              onClick={() => { setView('login'); setError(''); }} 
              style={{ color: '#f43f5e', cursor: 'pointer', fontWeight: '700', textDecoration: 'underline' }}
            >
              Sign In
            </span>
          </p>
        </form>
      )}

      {/* VIEW 3: OTP Verification Form */}
      {view === 'otp' && (
        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ textAlign: 'center', marginBottom: '4px' }}>
            <CheckCircle size={32} style={{ color: '#10b981', display: 'inline-block', marginBottom: '8px' }} />
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc' }}>Verify your Email</h3>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
              We sent a 6-digit OTP code to <strong>{email}</strong>.
            </p>
          </div>

          {simulatedOtp && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px dashed rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '10px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold', display: 'block' }}>SIMULATED OTP CODE:</span>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#10b981', letterSpacing: '4px' }}>{simulatedOtp}</span>
              <span style={{ fontSize: '9px', color: '#64748b', display: 'block', marginTop: '2px' }}>Copy this code to verify instantly!</span>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#94a3b8', marginBottom: '4px', textAlign: 'center' }}>
              Enter 6-Digit OTP
            </label>
            <input
              type="text"
              maxLength={6}
              className="form-input"
              placeholder="000000"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              style={{
                textAlign: 'center',
                fontSize: '22px',
                letterSpacing: '8px',
                fontWeight: '800',
                padding: '8px 12px'
              }}
              required
            />
          </div>

          {error && <p style={{ fontSize: '11px', color: '#f43f5e', fontWeight: '600', textAlign: 'center' }}>⚠️ {error}</p>}

          <button type="submit" disabled={loading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
            <span>{loading ? 'Verifying...' : 'Verify & Setup Dashboard'}</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setView('register');
              setError('');
              setSimulatedOtp(null);
            }}
            style={{ border: 'none', background: 'none', color: '#94a3b8', fontSize: '11px', textDecoration: 'underline' }}
          >
            Back to registration
          </button>
        </form>
      )}

    </div>
  );
};
