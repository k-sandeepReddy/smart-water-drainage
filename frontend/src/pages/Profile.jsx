import React, { useState, useEffect } from 'react';
import { validateProfile } from '../utils/validation.js';
import { UserIcon, ShieldIcon, CheckCircleIcon, AlertTriangleIcon } from '../components/Icons.jsx';

export default function Profile({ api, user, onUpdateUser }) {
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setServerError('');

    if (newPassword && newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'New passwords do not match.' });
      return;
    }

    const payload = {
      full_name: fullName,
      email,
      phone,
      address,
      ...(newPassword ? { current_password: currentPassword, new_password: newPassword } : {})
    };

    const validation = validateProfile(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSaving(true);
    try {
      const updated = await api.updateProfile(payload);
      onUpdateUser(updated);
      setSuccessMsg('Profile and account details updated successfully in SQLite.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    } catch (err) {
      setServerError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-body" style={{ maxWidth: '750px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          Profile & Account Settings
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
          Manage your personal contact details, residential address, and credentials.
        </p>
      </div>

      {successMsg && (
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '14px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircleIcon size={18} color="#059669" />
          <span>{successMsg}</span>
        </div>
      )}

      {serverError && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '14px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangleIcon size={18} color="#dc2626" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="card">
        {/* User Identity Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '20px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 800 }}>
            {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{fullName || user?.username}</h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '0.74rem', backgroundColor: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                Role: {user?.role || 'Resident'}
              </span>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Username: @{user?.username}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              {errors.full_name && <span style={{ color: '#dc2626', fontSize: '0.74rem' }}>{errors.full_name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <span style={{ color: '#dc2626', fontSize: '0.74rem' }}>{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {errors.phone && <span style={{ color: '#dc2626', fontSize: '0.74rem' }}>{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Residential Address (Ramaswami Peta)</label>
              <input
                type="text"
                className="form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '10px', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Change Password (Optional)
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '16px' }}>
              Leave blank if you do not wish to change your local login password.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Required only if changing password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                {errors.current_password && <span style={{ color: '#dc2626', fontSize: '0.74rem' }}>{errors.current_password}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {errors.new_password && <span style={{ color: '#dc2626', fontSize: '0.74rem' }}>{errors.new_password}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {errors.confirmPassword && <span style={{ color: '#dc2626', fontSize: '0.74rem' }}>{errors.confirmPassword}</span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
