import React, { useState } from 'react';
import { WaterDropIcon, UserIcon, ShieldIcon, EyeIcon, EyeOffIcon, AlertTriangleIcon } from '../components/Icons.jsx';
import { validateLogin } from '../utils/validation.js';

export default function Login({ onLoginSuccess, api }) {
  const [role, setRole] = useState('resident'); // 'resident' or 'admin'
  const [usernameOrEmail, setUsernameOrEmail] = useState('resident');
  const [password, setPassword] = useState('resident123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Autofill demo accounts
  const setDemoCredentials = (selectedRole) => {
    setRole(selectedRole);
    setServerError('');
    setErrors({});
    if (selectedRole === 'resident') {
      setUsernameOrEmail('resident');
      setPassword('resident123');
    } else {
      setUsernameOrEmail('admin');
      setPassword('admin123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validation = validateLogin(usernameOrEmail, password);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.login(usernameOrEmail, password, role);
      onLoginSuccess(response.user);
    } catch (err) {
      setServerError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        backgroundImage: 'radial-gradient(circle at 50% 20%, #1e3a8a 0%, #0f172a 70%)',
        padding: '24px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid #334155'
        }}
      >
        {/* Header Banner */}
        <div
          style={{
            backgroundColor: '#1e3a8a',
            padding: '28px 32px 24px',
            color: '#ffffff',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '14px',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
            }}
          >
            <WaterDropIcon size={30} color="#ffffff" />
          </div>

          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            Smart Water & Drainage Management System
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#93c5fd', marginTop: '4px', fontWeight: 600 }}>
            Ramaswami Peta, Rajanagaram Mandal
          </p>
          <p style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: '8px', lineHeight: 1.4 }}>
            Community Service Project (CSP) on Water Scarcity and Drainage Problems
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <button
            type="button"
            onClick={() => setDemoCredentials('resident')}
            style={{
              flex: 1,
              padding: '14px',
              border: 'none',
              backgroundColor: role === 'resident' ? '#ffffff' : 'transparent',
              color: role === 'resident' ? '#1e3a8a' : '#64748b',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              borderBottom: role === 'resident' ? '2px solid #2563eb' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <UserIcon size={16} /> Resident Portal
          </button>

          <button
            type="button"
            onClick={() => setDemoCredentials('admin')}
            style={{
              flex: 1,
              padding: '14px',
              border: 'none',
              backgroundColor: role === 'admin' ? '#ffffff' : 'transparent',
              color: role === 'admin' ? '#1e3a8a' : '#64748b',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              borderBottom: role === 'admin' ? '2px solid #2563eb' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <ShieldIcon size={16} /> Admin Division
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '28px 32px' }}>
          {/* Quick Demo Credentials Banner */}
          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '20px',
              fontSize: '0.78rem'
            }}
          >
            <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '4px' }}>
              ⚡ DEMO CREDENTIALS (CLICK TO FILL)
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setDemoCredentials('resident')}
                style={{ fontSize: '0.72rem', padding: '4px 8px' }}
              >
                Resident: resident / resident123
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setDemoCredentials('admin')}
                style={{ fontSize: '0.72rem', padding: '4px 8px' }}
              >
                Admin: admin / admin123
              </button>
            </div>
          </div>

          {/* Error Message */}
          {serverError && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertTriangleIcon size={18} color="#dc2626" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username or Email</label>
              <input
                type="text"
                className="form-input"
                placeholder={role === 'resident' ? 'e.g. resident' : 'e.g. admin'}
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                autoComplete="username"
              />
              {errors.username_or_email && (
                <span style={{ color: '#dc2626', fontSize: '0.74rem', marginTop: '3px' }}>
                  {errors.username_or_email}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingRight: '40px' }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
              {errors.password && (
                <span style={{ color: '#dc2626', fontSize: '0.74rem', marginTop: '3px' }}>
                  {errors.password}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', fontSize: '0.82rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#475569' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember Me</span>
              </label>
              <span style={{ color: '#0284c7', fontSize: '0.78rem', fontWeight: 600 }}>
                100% Offline SQLite Auth
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', fontWeight: 700 }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : `LOGIN AS ${role.toUpperCase()}`}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ backgroundColor: '#f8fafc', padding: '16px 32px', textAlign: 'center', borderTop: '1px solid #e2e8f0', fontSize: '0.74rem', color: '#64748b' }}>
          East Godavari District Civic Service Platform • Pure Localhost
        </div>
      </div>
    </div>
  );
}
