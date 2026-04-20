import { useState } from "react";

export default function MessageInput({ spaceName, onSend }) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <div className="px-4 pb-4 flex-shrink-0">
      <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/5">
        {/* Plus button */}
        <button className="text-gray-500 hover:text-gray-300 transition-colors">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        </button>

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={`Message ${spaceName} space...`}
          className="flex-1 bg-transparent border-none outline-none text-[14px] text-gray-200 placeholder:text-gray-600"
        />

        {/* Emoji button */}
        <button className="text-gray-500 hover:text-gray-300 transition-colors">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        </button>

        {/* Send button — teal */}
        <button
          onClick={handleSend}
          className="w-[30px] h-[30px] bg-teal hover:bg-teal-hover rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
        >
          <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}