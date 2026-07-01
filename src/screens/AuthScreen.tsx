import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Mail, Phone, ArrowRight } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login } = useApp();
  const [method, setMethod] = useState<'options' | 'email' | 'phone'>('options');
  const [name, setName] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!inputValue.trim()) {
      setError(`Please enter your ${method === 'email' ? 'email' : 'phone number'}`);
      return;
    }

    login(
      name,
      method === 'phone' ? inputValue : '+91 99887 76655',
      method === 'email' ? inputValue : 'user@safeshield.ai'
    );
  };

  const handleGoogleLogin = () => {
    login('Riya Sharma', '+91 91234 56789', 'riya.sharma@gmail.com');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', padding: '10px 0' }}>
      
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(244, 63, 94, 0.4)',
          marginBottom: '16px'
        }}>
          <Shield size={36} style={{ color: 'white' }} />
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.02em', marginBottom: '6px' }}>
          SafeShield AI
        </h1>
        <p style={{ fontSize: '13px', color: '#94a3b8', padding: '0 20px', lineHeight: '1.5' }}>
          Intelligent Safety & Emergency Response Assistant
        </p>
      </div>

      {method === 'options' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <button
            className="btn-primary"
            onClick={() => setMethod('email')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <Mail size={18} />
            <span>Continue with Email</span>
          </button>

          <button
            className="btn-secondary"
            onClick={() => setMethod('phone')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <Phone size={18} style={{ color: '#10b981' }} />
            <span>Use Phone Number</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ padding: '0 10px', fontSize: '11px', color: '#64748b', fontWeight: '600' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <button
            className="btn-secondary"
            onClick={handleGoogleLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.58 15.01 1 12 1 7.24 1 3.2 3.8 1.25 7.91l3.87 3C6.07 7.74 8.78 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.9c2.18-2.01 3.7-4.99 3.7-8.63z"
              />
              <path
                fill="#FBBC05"
                d="M5.12 14.59c-.25-.74-.39-1.53-.39-2.35s.14-1.61.39-2.35L1.25 6.9C.45 8.52 0 10.32 0 12s.45 3.48 1.25 5.1l3.87-3.01z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.9c-1.1.74-2.52 1.18-4.23 1.18-3.22 0-5.93-2.7-6.88-5.87l-3.87 3A11.96 11.96 0 0012 23z"
              />
            </svg>
            <span style={{ color: '#f8fafc' }}>Sign In with Google</span>
          </button>

          <p style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', marginTop: '20px', lineHeight: '1.4' }}>
            By continuing, you agree to allow SafeShield to access necessary device safety sensors for automated threat detection.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>
              Your Full Name
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Priyanjali Sen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>
              {method === 'email' ? 'Email Address' : 'Phone Number'}
            </label>
            <input
              type={method === 'email' ? 'email' : 'tel'}
              className="form-input"
              placeholder={method === 'email' ? 'you@example.com' : 'e.g. +91 98765 43210'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>

          {error && (
            <p style={{ fontSize: '12px', color: '#f43f5e', fontWeight: '500', textAlign: 'center' }}>
              ⚠️ {error}
            </p>
          )}

          <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '6px' }}>
            <span>Sign In</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setMethod('options');
              setError('');
            }}
            style={{ border: 'none', background: 'none', color: '#94a3b8', fontSize: '12px', textDecoration: 'underline' }}
          >
            Back to options
          </button>
        </form>
      )}
    </div>
  );
};
