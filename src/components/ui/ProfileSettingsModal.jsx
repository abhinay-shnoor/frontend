import { useState, useRef, useEffect } from 'react';
import Avatar from './Avatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { updateMyProfile, uploadAvatarToCloud } from '../../api/users.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function ProfileSettingsModal({ onClose }) {
  const { user, setUser } = useAuth();
  const { showToast }     = useToast();

  const [displayName,   setDisplayName]   = useState(user?.name || '');
  const [profileImage,  setProfileImage]  = useState(user?.avatar_url || null);
  const [pendingFile,   setPendingFile]   = useState(null); // the actual File object
  const [saving,        setSaving]        = useState(false);
  const fileInputRef = useRef(null);
  const modalRef     = useRef(null);

  const initials     = (user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const hasNameChange  = displayName.trim() !== user?.name;
  const hasAvatarChange = pendingFile !== null;
  const hasChanges     = hasNameChange || hasAvatarChange;

  useEffect(() => {
    const onKey     = (e) => { if (e.key === 'Escape') onClose(); };
    const onOutside = (e) => { if (modalRef.current && !modalRef.current.contains(e.target)) onClose(); };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onOutside);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onOutside); };
  }, [onClose]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB', 'error'); return; }
    setPendingFile(file);
    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!displayName.trim()) return showToast('Name is required', 'error');
    if (displayName.trim().length < 2) return showToast('Name must be at least 2 characters', 'error');
    setSaving(true);
    try {
      let updatedUser = { ...user };
      if (hasNameChange) {
        const result = await updateMyProfile(displayName.trim());
        updatedUser = { ...updatedUser, name: result.name };
      }
      if (hasAvatarChange) {
        // Upload to Cloudinary via the backend endpoint
        const result = await uploadAvatarToCloud(pendingFile);
        updatedUser = { ...updatedUser, avatar_url: result.avatar_url };
      }
      setUser(updatedUser);
      showToast('Profile saved', 'success');
      onClose();
    } catch (err) {
      showToast('Failed to save profile. Check Cloudinary credentials in .env if changing photo.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const overlay = { position: 'fixed', inset: 0, zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' };
  const card    = { background: 'var(--ws-bg)', borderRadius: 14, width: 480, maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden', border: '0.5px solid var(--ws-border)' };

  return (
    <div style={overlay}>
      <div ref={modalRef} style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderBottom: '0.5px solid var(--ws-border)', background: 'var(--ws-surface)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ws-text)', margin: 0 }}>Profile Settings</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ws-text-muted)', fontSize: 18 }}>✕</button>
        </div>

        <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Photo */}
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--ws-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Profile Photo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div onClick={() => fileInputRef.current?.click()} style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                {profileImage ? (
                  <img src={profileImage} alt="Profile" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--ws-border)' }} />
                ) : (
                  <Avatar initials={initials} color="#0D9488" size={64} />
                )}
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                >
                  <span style={{ fontSize: 10, color: '#fff', fontWeight: 500 }}>Edit</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button onClick={() => fileInputRef.current?.click()} style={{ padding: '7px 14px', border: '0.5px solid var(--ws-border)', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: 'var(--ws-bg)', color: 'var(--ws-text)' }}>
                  Change Photo
                </button>
                <p style={{ fontSize: 11, color: 'var(--ws-text-muted)', margin: 0 }}>Uploaded to Cloudinary. Max 5MB.</p>
                {hasAvatarChange && (
                  <button onClick={() => { setPendingFile(null); setProfileImage(user?.avatar_url || null); }} style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                    Remove change
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: 'none' }} />
            </div>
          </div>

          {/* Display name */}
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--ws-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Display Name</label>
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '0.5px solid var(--ws-border)', borderRadius: 9, fontSize: 14, color: 'var(--ws-text)', outline: 'none', boxSizing: 'border-box', background: 'var(--ws-bg)' }}
              onFocus={e => e.target.style.borderColor = '#0D9488'}
              onBlur={e => e.target.style.borderColor = 'var(--ws-border)'}
            />
            <p style={{ fontSize: 11, color: 'var(--ws-text-muted)', margin: '5px 0 0' }}>Visible to everyone in the workspace.</p>
          </div>

          {/* Email (readonly) */}
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--ws-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Email Address</label>
            <input type="email" value={user?.email || ''} readOnly
              style={{ width: '100%', padding: '10px 12px', border: '0.5px solid var(--ws-border)', borderRadius: 9, fontSize: 14, color: 'var(--ws-text-muted)', background: 'var(--ws-surface)', cursor: 'default', boxSizing: 'border-box' }}
            />
            <p style={{ fontSize: 11, color: 'var(--ws-text-muted)', margin: '5px 0 0' }}>Contact your admin to change this.</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '14px 22px', background: 'var(--ws-surface)', borderTop: '0.5px solid var(--ws-border)' }}>
          <button onClick={onClose} style={{ padding: '9px 16px', fontSize: 13, color: 'var(--ws-text-muted)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 7 }}>Cancel</button>
          <button onClick={handleSave} disabled={!hasChanges || saving} style={{ padding: '9px 18px', fontSize: 13, fontWeight: 500, color: '#fff', background: hasChanges && !saving ? '#0D9488' : 'var(--ws-border)', border: 'none', borderRadius: 7, cursor: hasChanges && !saving ? 'pointer' : 'not-allowed' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}