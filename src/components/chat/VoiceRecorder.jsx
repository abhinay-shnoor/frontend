import { useState, useRef, useEffect, useCallback } from 'react';
import { uploadFile } from '../../api/messages.js';

const MAX_DURATION = 300; // 5 minutes

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VoiceRecorder({ onSend, disabled }) {
  const [state, setState] = useState('idle'); // idle | recording | uploading
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Pick best supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4'; // Safari fallback

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        // handled in finishRecording
      };

      recorder.start(250); // collect data every 250ms
      startTimeRef.current = Date.now();
      setState('recording');
      setDuration(0);

      // Timer to update duration display
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setDuration(elapsed);
        if (elapsed >= MAX_DURATION) {
          finishRecording();
        }
      }, 200);
    } catch (err) {
      console.error('Microphone access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone permission denied. Please allow access in your browser settings.');
      } else {
        setError('Could not access microphone. Please check your device.');
      }
      setState('idle');
    }
  };

  const finishRecording = useCallback(async () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') { setState('idle'); return; }

    setState('uploading');

    // Stop the recorder and wait for final data
    await new Promise((resolve) => {
      recorder.onstop = resolve;
      recorder.stop();
    });

    stopStream();

    const chunks = chunksRef.current;
    if (!chunks.length) { setState('idle'); return; }

    const mimeType = recorder.mimeType || 'audio/webm';
    const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
    const blob = new Blob(chunks, { type: mimeType });

    // Discard recordings under 0.5s
    if (blob.size < 1000) { setState('idle'); return; }

    const file = new File([blob], `voice-message-${Date.now()}.${ext}`, { type: mimeType });

    try {
      const uploaded = await uploadFile(file);
      // Send as a message with the voice attachment
      onSend('', null, [{ ...uploaded, isVoice: true }]);
    } catch (err) {
      console.error('Voice upload error:', err);
      setError('Failed to send voice message. Please try again.');
    }

    setState('idle');
    setDuration(0);
    chunksRef.current = [];
  }, [onSend]);

  const cancelRecording = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = () => {}; // prevent finishRecording handler
      recorder.stop();
    }
    stopStream();
    chunksRef.current = [];
    setState('idle');
    setDuration(0);
  };

  // ─── Idle state: show mic button ──────────────────────────────
  if (state === 'idle') {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={startRecording}
          disabled={disabled}
          title="Record voice message"
          style={{
            width: 32, height: 32, borderRadius: 8, border: 'none',
            background: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
            color: 'var(--ws-text-muted)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s',
            padding: 0,
          }}
          onMouseEnter={e => { if (!disabled) e.currentTarget.style.color = '#0D9488'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--ws-text-muted)'; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>
        {error && (
          <div style={{
            position: 'absolute', bottom: '100%', right: 0, marginBottom: 8,
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
            padding: '8px 12px', fontSize: 12, color: '#dc2626', whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, maxWidth: 280,
          }}>
            {error}
            <button
              onClick={() => setError(null)}
              style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 700, fontSize: 12 }}
            >✕</button>
          </div>
        )}
      </div>
    );
  }

  // ─── Uploading state ──────────────────────────────────────────
  if (state === 'uploading') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <span style={{ fontSize: 12, color: 'var(--ws-text-muted)', fontWeight: 500 }}>Sending...</span>
      </div>
    );
  }

  // ─── Recording state ──────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, flex: 1,
      animation: 'voiceRecorderEntry 0.2s ease-out',
    }}>
      <style>{`
        @keyframes voiceRecorderEntry {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes voicePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
        @keyframes waveBar {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
      `}</style>

      {/* Cancel button */}
      <button
        onClick={cancelRecording}
        title="Cancel recording"
        style={{
          width: 32, height: 32, borderRadius: '50%', border: 'none',
          background: 'rgba(239, 68, 68, 0.1)', cursor: 'pointer',
          color: '#ef4444', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>

      {/* Recording indicator + waveform */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        {/* Pulsing red dot */}
        <div style={{
          width: 10, height: 10, borderRadius: '50%', background: '#ef4444',
          animation: 'voicePulse 1.2s ease-in-out infinite', flexShrink: 0,
        }} />

        {/* Animated waveform bars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 24, flex: 1, maxWidth: 200 }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} style={{
              width: 3, height: '100%', borderRadius: 2,
              background: 'linear-gradient(to top, #0D9488, #14b8a6)',
              animation: `waveBar ${0.6 + Math.random() * 0.6}s ease-in-out ${i * 0.05}s infinite`,
              transformOrigin: 'center',
              opacity: 0.7 + Math.random() * 0.3,
            }} />
          ))}
        </div>

        {/* Timer */}
        <span style={{
          fontSize: 13, fontWeight: 600, color: '#ef4444',
          fontVariantNumeric: 'tabular-nums', minWidth: 36, flexShrink: 0,
        }}>
          {formatTime(duration)}
        </span>
      </div>

      {/* Send button */}
      <button
        onClick={finishRecording}
        title="Send voice message"
        style={{
          width: 36, height: 36, borderRadius: '50%', border: 'none',
          background: '#0D9488', cursor: 'pointer', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'all 0.15s',
          boxShadow: '0 2px 8px rgba(13,148,136,0.4)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#0f766e'}
        onMouseLeave={e => e.currentTarget.style.background = '#0D9488'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </div>
  );
}
