import React, { useState, useRef, useEffect } from 'react';
import { setPin } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function PinSetupModal({ onClose }) {
  const { refreshUser } = useAuth();
  const { showToast } = useToast();
  
  const [step, setStep] = useState(1); // 1 = Enter PIN, 2 = Confirm PIN
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [confirmDigits, setConfirmDigits] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const pinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const confirmRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Focus first input on mount or step change
  useEffect(() => {
    setTimeout(() => {
      if (step === 1) {
        pinRefs[0].current?.focus();
      } else {
        confirmRefs[0].current?.focus();
      }
    }, 100);
  }, [step]);

  const handleDigitChange = (index, value, isConfirm) => {
    // Only allow numeric digits
    if (value && !/^\d$/.test(value)) return;

    const currentDigits = isConfirm ? confirmDigits : pinDigits;
    const currentRefs = isConfirm ? confirmRefs : pinRefs;
    const setDigits = isConfirm ? setConfirmDigits : setPinDigits;

    const updated = [...currentDigits];
    updated[index] = value;
    setDigits(updated);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      currentRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e, isConfirm) => {
    const currentDigits = isConfirm ? confirmDigits : pinDigits;
    const currentRefs = isConfirm ? confirmRefs : pinRefs;
    const setDigits = isConfirm ? setConfirmDigits : setPinDigits;

    // Handle backspace to clear and focus previous
    if (e.key === 'Backspace') {
      const updated = [...currentDigits];
      if (updated[index] === '') {
        if (index > 0) {
          updated[index - 1] = '';
          setDigits(updated);
          currentRefs[index - 1].current?.focus();
        }
      } else {
        updated[index] = '';
        setDigits(updated);
      }
      setError('');
    }
  };

  const handleMaybeLater = () => {
    sessionStorage.setItem('pin_prompt_dismissed', 'true');
    onClose();
  };

  const handleContinue = () => {
    const enteredPin = pinDigits.join('');
    if (enteredPin.length < 4) {
      setError('Please enter a full 4-digit PIN');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    const enteredPin = pinDigits.join('');
    const confirmedPin = confirmDigits.join('');

    if (confirmedPin.length < 4) {
      setError('Please enter the full confirmation PIN');
      return;
    }

    if (enteredPin !== confirmedPin) {
      setError('PINs do not match. Please try again.');
      setConfirmDigits(['', '', '', '']);
      confirmRefs[0].current?.focus();
      return;
    }

    setLoading(false);
    try {
      setLoading(true);
      await setPin(enteredPin);
      showToast('PIN created successfully!', 'success');
      await refreshUser();
      onClose();
    } catch (err) {
      console.error('Failed to create PIN:', err);
      setError(err.response?.data?.message || 'Failed to set PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentDigits = step === 1 ? pinDigits : confirmDigits;
  const currentRefs = step === 1 ? pinRefs : confirmRefs;
  const isConfirm = step === 2;

  return (
    <div style={styles.overlay}>
      <div style={styles.backdrop} onClick={handleMaybeLater} />
      
      <div style={styles.modal}>
        <div style={styles.decorBar} />
        
        <div style={styles.content}>
          <div style={styles.iconContainer}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          <h2 style={styles.title}>
            {step === 1 ? 'Secure Your Workspace' : 'Confirm Your PIN'}
          </h2>
          
          <p style={styles.description}>
            {step === 1 
              ? 'Create a 4-digit PIN to lock and protect confidential chats and spaces from unauthorized access.' 
              : 'Please enter your 4-digit PIN again to confirm and secure your account.'
            }
          </p>

          <div style={styles.pinGrid}>
            {currentDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={currentRefs[idx]}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value, isConfirm)}
                onKeyDown={(e) => handleKeyDown(idx, e, isConfirm)}
                style={{
                  ...styles.pinInput,
                  borderColor: error ? '#ef4444' : (digit ? '#0D9488' : 'var(--ws-border)'),
                  boxShadow: digit ? '0 0 0 2px rgba(13, 148, 136, 0.15)' : 'none'
                }}
              />
            ))}
          </div>

          {error && <p style={styles.errorText}>{error}</p>}

          <div style={styles.buttonGroup}>
            {step === 1 ? (
              <>
                <button 
                  onClick={handleContinue} 
                  disabled={pinDigits.some(d => d === '')}
                  style={{
                    ...styles.primaryBtn,
                    opacity: pinDigits.some(d => d === '') ? 0.6 : 1,
                    cursor: pinDigits.some(d => d === '') ? 'not-allowed' : 'pointer'
                  }}
                >
                  Continue
                </button>
                <button onClick={handleMaybeLater} style={styles.secondaryBtn}>
                  Maybe Later
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleSubmit} 
                  disabled={loading || confirmDigits.some(d => d === '')}
                  style={{
                    ...styles.primaryBtn,
                    opacity: (loading || confirmDigits.some(d => d === '')) ? 0.6 : 1,
                    cursor: (loading || confirmDigits.some(d => d === '')) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Securing...' : 'Set PIN'}
                </button>
                <button onClick={() => setStep(1)} disabled={loading} style={styles.secondaryBtn}>
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
  },
  modal: {
    position: 'relative',
    background: 'var(--ws-bg, #ffffff)',
    color: 'var(--ws-text, #111827)',
    borderRadius: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    width: '100%',
    maxWidth: '400px',
    overflow: 'hidden',
    animation: 'fadeSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    border: '1px solid var(--ws-border, #e5e7eb)',
  },
  decorBar: {
    height: '6px',
    background: '#0D9488',
    width: '100%',
  },
  content: {
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  iconContainer: {
    padding: '16px',
    background: 'rgba(13, 148, 136, 0.08)',
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
    gap: '10px',
  },
  primaryBtn: {
    width: '100%',
    padding: '12px',
    background: '#0D9488',
    color: '#ffffff',
    border: 'none',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.15s',
  },
  secondaryBtn: {
    width: '100%',
    padding: '12px',
    background: 'none',
    border: 'none',
    color: 'var(--ws-text-muted, #4b5563)',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  }
};
