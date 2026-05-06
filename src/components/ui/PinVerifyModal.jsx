import React, { useState, useRef, useEffect } from 'react';
import { verifyPin } from '../../api/users';
import { useToast } from '../../context/ToastContext';

export default function PinVerifyModal({ onSuccess, onClose, chatName = 'Private Chat' }) {
  const { showToast } = useToast();
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const refs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    // Focus first input on mount
    setTimeout(() => {
      refs[0].current?.focus();
    }, 100);
  }, []);

  // Watch digits for complete input
  useEffect(() => {
    if (digits.every(d => d !== '')) {
      handleVerification(digits.join(''));
    }
  }, [digits]);

  const handleDigitChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const updated = [...digits];
    updated[index] = value;
    setDigits(updated);
    setError('');

    if (value && index < 3) {
      refs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const updated = [...digits];
      if (updated[index] === '') {
        if (index > 0) {
          updated[index - 1] = '';
          setDigits(updated);
          refs[index - 1].current?.focus();
        }
      } else {
        updated[index] = '';
        setDigits(updated);
      }
      setError('');
    }
  };

  const handleVerification = async (enteredPin) => {
    setLoading(true);
    try {
      const res = await verifyPin(enteredPin);
      if (res.success) {
        onSuccess();
      } else {
        triggerError('Incorrect PIN. Please try again.');
      }
    } catch (err) {
      console.error('Verify PIN error:', err);
      triggerError(err.response?.data?.message || 'Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const triggerError = (msg) => {
    setError(msg);
    setDigits(['', '', '', '']);
    setShake(true);
    setTimeout(() => setShake(false), 500);
    refs[0].current?.focus();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.backdrop} onClick={onClose} />
      
      <div style={{
        ...styles.modal,
        animation: shake 
          ? 'shake 0.4s ease-in-out' 
          : 'fadeSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        <div style={styles.decorBar} />
        
        <div style={styles.content}>
          <div style={styles.iconContainer}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ea4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              <circle cx="12" cy="16" r="1"/>
            </svg>
          </div>

          <h2 style={styles.title}>Unlock Chat</h2>
          <p style={styles.description}>
            <strong>{chatName}</strong> is locked and secure. Enter your 4-digit security PIN to gain access.
          </p>

          <div style={styles.pinGrid}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={refs[idx]}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={loading}
                style={{
                  ...styles.pinInput,
                  borderColor: error ? '#ef4444' : (digit ? '#ea4335' : 'var(--ws-border)'),
                  boxShadow: digit ? '0 0 0 2px rgba(234, 67, 53, 0.15)' : 'none'
                }}
              />
            ))}
          </div>

          {error && <p style={styles.errorText}>{error}</p>}

          <div style={styles.buttonGroup}>
            <button onClick={onClose} disabled={loading} style={styles.secondaryBtn}>
              Cancel
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
      `}} />
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1010,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(8px)',
  },
  modal: {
    position: 'relative',
    background: 'var(--ws-bg, #ffffff)',
    color: 'var(--ws-text, #111827)',
    borderRadius: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    width: '100%',
    maxWidth: '380px',
    overflow: 'hidden',
    border: '1px solid var(--ws-border, #e5e7eb)',
  },
  decorBar: {
    height: '6px',
    background: '#ea4335',
    width: '100%',
  },
  content: {
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  iconContainer: {
    padding: '16px',
    background: 'rgba(234, 67, 53, 0.08)',
    borderRadius: '50%',
    marginBottom: '20px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    margin: '0 0 8px',
  },
  description: {
    fontSize: '13.5px',
    color: 'var(--ws-text-muted, #4b5563)',
    lineHeight: 1.5,
    margin: '0 0 24px',
  },
  pinGrid: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  pinInput: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    border: '1.5px solid',
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: '700',
    outline: 'none',
    background: 'var(--ws-surface, #f9fafb)',
    color: 'var(--ws-text, #111827)',
    transition: 'all 0.15s ease',
  },
  errorText: {
    color: '#ef4444',
    fontSize: '12.5px',
    fontWeight: '500',
    margin: '0 0 16px',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  secondaryBtn: {
    width: '100%',
    padding: '12px',
    background: 'none',
    border: '1px solid var(--ws-border)',
    color: 'var(--ws-text-muted, #4b5563)',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  }
};
