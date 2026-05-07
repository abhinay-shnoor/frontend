import { useState, useRef, useEffect } from 'react';
import Avatar from './Avatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { updateMyProfile, uploadAvatarToCloud } from '../../api/users.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function ProfileSettingsModal({ onClose }) {
  const { user, setUser } = useAuth();
  const { showToast }     = useToast();

  const [displayName,    setDisplayName]    = useState(user?.name || '');
  const [profileImage,   setProfileImage]   = useState(user?.avatar_url || null);
  const [pendingFile,    setPendingFile]    = useState(null); // the actual File object
  const [contactNo,      setContactNo]      = useState(user?.contact_no || '');
  const [alternateEmail, setAlternateEmail] = useState(user?.alternate_email || '');
  const [department,     setDepartment]     = useState(user?.department || '');
  const [designation,    setDesignation]    = useState(user?.designation || '');
  const [saving,         setSaving]         = useState(false);
  const [imgError,       setImgError]       = useState(false);

  const fileInputRef = useRef(null);
  const modalRef     = useRef(null);

  const initials     = (user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const hasNameChange  = displayName.trim() !== (user?.name || '');
  const hasAvatarChange = pendingFile !== null;
  const hasContactNoChange = contactNo.trim() !== (user?.contact_no || '');
  const hasAlternateEmailChange = alternateEmail.trim() !== (user?.alternate_email || '');
  const hasDepartmentChange = department.trim() !== (user?.department || '');
  const hasDesignationChange = designation.trim() !== (user?.designation || '');

  const hasChanges = hasNameChange || hasAvatarChange || hasContactNoChange || hasAlternateEmailChange || hasDepartmentChange || hasDesignationChange;

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
    setImgError(false); // Reset image error state on new photo select
    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!displayName.trim()) return showToast('Name is required', 'error');
    if (displayName.trim().length < 2) return showToast('Name must be at least 2 characters', 'error');
    if (alternateEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alternateEmail.trim())) {
      return showToast('Please enter a valid alternate email', 'error');
    }

    setSaving(true);
    try {
      let updatedUser = { ...user };
      const hasTextChanges = hasNameChange || hasContactNoChange || hasAlternateEmailChange || hasDepartmentChange || hasDesignationChange;
      
      if (hasTextChanges) {
        const result = await updateMyProfile({
          name: displayName.trim(),
          contact_no: contactNo.trim() || null,
          alternate_email: alternateEmail.trim() || null,
          department: department.trim() || null,
          designation: designation.trim() || null
        });
        updatedUser = { 
          ...updatedUser, 
          name: result.name,
          contact_no: result.contact_no,
          alternate_email: result.alternate_email,
          department: result.department,
          designation: result.designation
        };
      }
      
      if (hasAvatarChange) {
        // Upload to Cloudinary or Local storage via the backend endpoint
        const result = await uploadAvatarToCloud(pendingFile);
        updatedUser = { ...updatedUser, avatar_url: result.avatar_url };
      }
      
      setUser(updatedUser);
      showToast('Profile saved successfully', 'success');
      onClose();
    } catch (err) {
      console.error('Failed to save profile:', err);
      showToast('Failed to save profile. Please try again.', 'error');
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

        <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: 20, maxHeight: '65vh', overflowY: 'auto' }}>
          {/* Photo */}
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--ws-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Profile Photo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div onClick={() => fileInputRef.current?.click()} style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                {profileImage && !imgError ? (
                  <img src={profileImage} alt="Profile" onError={() => setImgError(true)} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--ws-border)' }} />
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
                <p style={{ fontSize: 11, color: 'var(--ws-text-muted)', margin: 0 }}>Uploaded dynamically. Max 5MB.</p>
                {hasAvatarChange && (
                  <button onClick={() => { setPendingFile(null); setProfileImage(user?.avatar_url || null); setImgError(false); }} style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
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

          {/* Contact number */}
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--ws-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Contact Number</label>
            <input type="text" value={contactNo} onChange={e => setContactNo(e.target.value)}
              placeholder="+1 (555) 000-0000"
              style={{ width: '100%', padding: '10px 12px', border: '0.5px solid var(--ws-border)', borderRadius: 9, fontSize: 14, color: 'var(--ws-text)', outline: 'none', boxSizing: 'border-box', background: 'var(--ws-bg)' }}
              onFocus={e => e.target.style.borderColor = '#0D9488'}
              onBlur={e => e.target.style.borderColor = 'var(--ws-border)'}
            />
          </div>

          {/* Alternate email */}
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--ws-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Alternate Email</label>
            <input type="email" value={alternateEmail} onChange={e => setAlternateEmail(e.target.value)}
              placeholder="alternate@email.com"
              style={{ width: '100%', padding: '10px 12px', border: '0.5px solid var(--ws-border)', borderRadius: 9, fontSize: 14, color: 'var(--ws-text)', outline: 'none', boxSizing: 'border-box', background: 'var(--ws-bg)' }}
              onFocus={e => e.target.style.borderColor = '#0D9488'}
              onBlur={e => e.target.style.borderColor = 'var(--ws-border)'}
            />
          </div>

          {/* Department */}
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--ws-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Department</label>
            <input type="text" value={department} onChange={e => setDepartment(e.target.value)}
              placeholder="Engineering, Design, Operations, etc."
              style={{ width: '100%', padding: '10px 12px', border: '0.5px solid var(--ws-border)', borderRadius: 9, fontSize: 14, color: 'var(--ws-text)', outline: 'none', boxSizing: 'border-box', background: 'var(--ws-bg)' }}
              onFocus={e => e.target.style.borderColor = '#0D9488'}
              onBlur={e => e.target.style.borderColor = 'var(--ws-border)'}
            />
          </div>

          {/* Designation */}
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--ws-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Designation</label>
            <input type="text" value={designation} onChange={e => setDesignation(e.target.value)}
              placeholder="Lead Engineer, Product Manager, etc."
              style={{ width: '100%', padding: '10px 12px', border: '0.5px solid var(--ws-border)', borderRadius: 9, fontSize: 14, color: 'var(--ws-text)', outline: 'none', boxSizing: 'border-box', background: 'var(--ws-bg)' }}
              onFocus={e => e.target.style.borderColor = '#0D9488'}
              onBlur={e => e.target.style.borderColor = 'var(--ws-border)'}
            />
          </div>

          {/* Email (readonly) */}
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--ws-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Primary Email Address</label>
            <input type="email" value={user?.email || ''} readOnly
              style={{ width: '100%', padding: '10px 12px', border: '0.5px solid var(--ws-border)', borderRadius: 9, fontSize: 14, color: 'var(--ws-text-muted)', background: 'var(--ws-surface)', cursor: 'default', boxSizing: 'border-box' }}
            />
            <p style={{ fontSize: 11, color: 'var(--ws-text-muted)', margin: '5px 0 0' }}>Primary login email (cannot be modified).</p>
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