import { useState, useRef, useEffect, useCallback } from 'react';

function formatTime(seconds) {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Generate consistent pseudo-random waveform bars from a seed string (the URL)
function generateWaveform(seed, count = 40) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const bars = [];
  for (let i = 0; i < count; i++) {
    hash = ((hash << 5) - hash + i * 7) | 0;
    const val = (Math.abs(hash) % 100) / 100;
    // Shape it more like a real waveform — louder in the middle
    const center = Math.abs(i - count / 2) / (count / 2);
    const height = 0.2 + val * 0.8 * (1 - center * 0.4);
    bars.push(height);
  }
  return bars;
}

export default function VoiceMessagePlayer({ url, isOwn }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const audioRef = useRef(null);
  const animFrameRef = useRef(null);
  const progressBarRef = useRef(null);
  const waveform = useRef(generateWaveform(url || '', 40)).current;

  useEffect(() => {
    const audio = new Audio(url);
    audio.preload = 'metadata';
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
      setLoaded(true);
    });

    audio.addEventListener('ended', () => {
      setPlaying(false);
      setCurrentTime(0);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    });

    // Handle cases where duration loads late (common with streamed audio)
    audio.addEventListener('durationchange', () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    });

    return () => {
      audio.pause();
      audio.src = '';
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [url]);

  const updateProgress = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
    animFrameRef.current = requestAnimationFrame(updateProgress);
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setPlaying(false);
    } else {
      audio.play().then(() => {
        setPlaying(true);
        animFrameRef.current = requestAnimationFrame(updateProgress);
      }).catch(err => {
        console.error('Audio play error:', err);
      });
    }
  };

  const handleSeek = (e) => {
    const bar = progressBarRef.current;
    if (!bar || !audioRef.current || !duration) return;
    const rect = bar.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = x / rect.width;
    audioRef.current.currentTime = pct * duration;
    setCurrentTime(pct * duration);
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '6px 4px', minWidth: 220, maxWidth: 320,
    }}>
      <style>{`
        @keyframes playerPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(13,148,136,0.3); }
          50% { box-shadow: 0 0 0 6px rgba(13,148,136,0); }
        }
      `}</style>

      {/* Play/Pause button */}
      <button
        onClick={togglePlay}
        style={{
          width: 36, height: 36, borderRadius: '50%', border: 'none',
          background: isOwn ? 'rgba(255,255,255,0.2)' : '#0D9488',
          cursor: 'pointer', color: '#fff', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          transition: 'all 0.15s',
          animation: playing ? 'playerPulse 2s ease-in-out infinite' : 'none',
        }}
      >
        {playing ? (
          // Pause icon
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          // Play icon
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>

      {/* Waveform + progress */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div
          ref={progressBarRef}
          onClick={handleSeek}
          style={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            height: 28, cursor: 'pointer', position: 'relative',
          }}
        >
          {waveform.map((h, i) => {
            const barProgress = i / waveform.length;
            const isPlayed = barProgress <= progress;
            return (
              <div key={i} style={{
                width: 3, borderRadius: 2, flexShrink: 0,
                height: `${h * 100}%`,
                background: isPlayed
                  ? (isOwn ? 'rgba(255,255,255,0.9)' : '#0D9488')
                  : (isOwn ? 'rgba(255,255,255,0.3)' : 'var(--ws-border)'),
                transition: 'background 0.15s',
              }} />
            );
          })}
        </div>

        {/* Time display */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{
            fontSize: 11, fontWeight: 500,
            color: isOwn ? 'rgba(255,255,255,0.7)' : 'var(--ws-text-muted)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {playing || currentTime > 0 ? formatTime(currentTime) : formatTime(duration)}
          </span>
          {/* Voice message icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke={isOwn ? 'rgba(255,255,255,0.5)' : 'var(--ws-text-muted)'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
