import { useState } from "react";

const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
);

const MailIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 4l-10 8L2 4" />
  </svg>
);

const ChatIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
  </svg>
);

const MeetIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

export default function IconRail({ onToggleHamburger, isHamburgerOpen }) {
  const [activeIcon, setActiveIcon] = useState("chat");

  const navItems = [
    { id: "mail", Icon: MailIcon, label: "Mail", badge: 0 },
    { id: "chat", Icon: ChatIcon, label: "Chat", badge: 0 },
    { id: "meet", Icon: MeetIcon, label: "Meet", badge: 0 },
  ];

  return (
    <div className="flex flex-col items-center w-[68px] bg-[#f8f9fa] border-r border-gray-200 py-3 flex-shrink-0 h-full">
      {/* Hamburger menu */}
      <button
        onClick={onToggleHamburger}
        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all mb-5 ${isHamburgerOpen
          ? "bg-gray-200 text-gray-800"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
          }`}
        title="Menu"
      >
        <HamburgerIcon />
      </button>

      {/* Nav icons */}
      <div className="flex flex-col items-center gap-1 flex-1">
        {navItems.map(({ id, Icon, label, badge }) => (
          <button
            key={id}
            onClick={() => setActiveIcon(id)}
            title={label}
            className="flex flex-col items-center gap-0.5 relative"
          >
            <div
              className={`
                w-10 h-10 flex items-center justify-center rounded-lg transition-all relative
                ${activeIcon === id
                  ? "bg-[#e8f0fe] text-[#1a73e8]"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                }
              `}
            >
              <Icon />
              {badge > 0 && (
                <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-[#c5221f] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-medium ${activeIcon === id ? "text-[#1a73e8]" : "text-gray-600"
              }`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}