import { useState, useEffect, useRef } from 'react';

const QUICK = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

const CATEGORIES = {
  'Smileys': ['😀','😃','😄','😁','😅','😂','🤣','😊','😇','🙂','🙃','😉','😍','🥰','😘','😋','😛','😜','🤪','😎','🤩','🥳','😮','😯','😲','😳','🥺','😢','😭','😤','😠','😡'],
  'Gestures': ['👍','👎','👌','✌️','🤞','🤟','🤘','🤙','👋','🤚','✋','🖖','👏','🙌','🤝','🙏','💪','☝️','👆','👇','👉','👈'],
  'Hearts': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','💕','💞','💓','💗','💖','💝','💘'],
  'Objects': ['🎉','🎊','🎈','🎁','🏆','🥇','⭐','🌟','✨','💫','🔥','💥','💯','✅','❌','⚡','🌈','❄️','🎯','🎵','🚀','💡','💎','🎮','📱','💻'],
  'Animals': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐸','🐵','🙈','🙉','🙊','🐔','🦄','🐝','🦋'],
};

export default function EmojiPicker({ onSelect, onClose }) {
  const [expanded, setExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Smileys');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleSelect = (emoji) => {
    onSelect(emoji);
    onClose();
  };

  return (
    <div ref={ref} style={{
      background: '#1E1E1E',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10,
      padding: 8,
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      zIndex: 200,
    }}>
      {/* Quick reactions */}
      <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {QUICK.map(e => (
          <button key={e} onClick={() => handleSelect(e)} style={quickBtn}>
            {e}
          </button>
        ))}
        <button
          onClick={() => setExpanded(prev => !prev)}
          style={{ ...quickBtn, fontSize: 13, color: '#aaa', padding: '4px 6px' }}
        >
          {expanded ? '✕' : '＋'}
        </button>
      </div>

      {/* Full picker */}
      {expanded && (
        <div style={{ marginTop: 8, width: 280 }}>
          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 2, marginBottom: 6, flexWrap: 'wrap' }}>
            {Object.keys(CATEGORIES).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 4, border: 'none',
                  cursor: 'pointer', fontWeight: 500,
                  background: activeCategory === cat ? '#0D9488' : 'rgba(255,255,255,0.08)',
                  color: activeCategory === cat ? '#fff' : '#aaa',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Emoji grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)',
            gap: 2, maxHeight: 180, overflowY: 'auto',
          }}>
            {CATEGORIES[activeCategory].map(e => (
              <button key={e} onClick={() => handleSelect(e)} style={gridBtn}>
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const quickBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 20, padding: '4px', borderRadius: 6,
  lineHeight: 1, transition: 'background 0.1s',
};

const gridBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 18, padding: '4px', borderRadius: 4,
  lineHeight: 1, textAlign: 'center',
};