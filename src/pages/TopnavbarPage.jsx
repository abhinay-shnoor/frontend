import { useState, useRef, useEffect } from "react";
import { currentUser as defaultUser } from "../../data/mockData.js";
import Avatar from "../ui/Avatar.jsx";

const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#5f6368">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#9aa0a6">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

const QuestionIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const AppsGridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#5f6368">
    <circle cx="5" cy="5" r="2" />
    <circle cx="12" cy="5" r="2" />
    <circle cx="19" cy="5" r="2" />
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
    <circle cx="5" cy="19" r="2" />
    <circle cx="12" cy="19" r="2" />
    <circle cx="19" cy="19" r="2" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const AddAccountIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const SignOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const SettingsGearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const STATUS_OPTIONS = [
  { id: "active", label: "Automatic", description: "Based on chat activity", dotColor: "#34A853", icon: "●" },
  { id: "dnd", label: "Do not disturb", description: "Mute chat notifications", dotColor: "#EA4335", icon: "⊘" },
  { id: "away", label: "Set as away", description: null, dotColor: null, icon: "○" },
  { id: "custom", label: "Add a status", description: null, dotColor: null, icon: "✎" },
];

function StatusDropdown({ currentStatus, onSelect, onClose }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="absolute top-12 right-0 w-[260px] bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50"
      style={{ animation: "fadeSlideDown 0.15s ease-out" }}
    >
      {STATUS_OPTIONS.map((option) => (
        <div key={option.id}>
          {option.id === "custom" && <div className="border-t border-gray-100 my-1" />}
          <button
            onClick={() => { onSelect(option.id); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
          >
            <span className="w-5 flex items-center justify-center text-[16px]" style={{ color: option.dotColor || "#5f6368" }}>
              {option.icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-gray-800">{option.label}</p>
              {option.description && (
                <p className="text-[11px] text-gray-400">{option.description}</p>
              )}
            </div>
            {currentStatus === option.id && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}

function AppsDropdown({ onClose }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="absolute top-12 right-0 w-[200px] bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
      style={{ animation: "fadeSlideDown 0.15s ease-out" }}
    >
      <p className="px-4 py-1.5 text-[11px] font-semibold text-[#5f6368] uppercase tracking-wider">Google Apps</p>
      <div className="w-full flex items-center gap-3 px-4 py-2.5">
        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#f0f7ff] text-[#1a73e8]">
          <CalendarIcon />
        </div>
        <span className="text-[13px] font-medium text-gray-700">Calendar</span>
      </div>
    </div>
  );
}

function ProfileDropdown({ onClose, onOpenSettings }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const menuItems = [
    { id: "add-account", icon: <AddAccountIcon />, label: "Add Account", action: () => { alert("Add Account clicked"); onClose(); } },
    { id: "settings", icon: <SettingsGearIcon />, label: "Settings", action: () => { onOpenSettings(); onClose(); } },
    { id: "sign-out", icon: <SignOutIcon />, label: "Sign Out", action: () => { onClose(); if (onSignOut) onSignOut(); } },
  ];

  return (
    <div
      ref={dropdownRef}
      className="absolute top-12 right-0 w-[280px] bg-white rounded-2xl shadow-xl border border-gray-200 py-3 z-50"
      style={{ animation: "fadeSlideDown 0.15s ease-out" }}
    >
      {/* User card */}
      <div className="px-5 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Avatar initials={currentUser.initials} color={currentUser.color} size={40} />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-gray-900 truncate">{currentUser.name}</p>
            <p className="text-[12px] text-gray-500 truncate">{currentUser.email}</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1 mt-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={item.action}
            className="w-full flex items-center gap-3 px-5 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            <span className="text-gray-500">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function TopNavbar({ currentStatus, onStatusChange, onOpenSettings, onToggleSidebar, navSearchQuery, onNavSearchChange, onSignOut, currentUser: propUser }) {
  const currentUser = propUser || defaultUser;
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAppsMenu, setShowAppsMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const statusDisplay = STATUS_OPTIONS.find(s => s.id === currentStatus);

  return (
    <div className="flex items-center h-[64px] px-4 border-b border-gray-200 bg-[#f8f9fa] flex-shrink-0 z-20">
      {/* Left: hamburger + logo */}
      <div className="flex items-center gap-3 min-w-[200px]">
        <button
          onClick={onToggleSidebar}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200/70 transition-colors"
          title="Menu"
        >
          <HamburgerIcon />
        </button>
        <div className="flex items-center gap-2.5">
          <img
            src="/shnoor-logo.png"
            alt="SHNOOR"
            className="w-8 h-8 rounded-lg object-contain"
          />
          <span className="text-[20px] font-normal text-[#5f6368] tracking-tight">Chat</span>
        </div>
      </div>

      {/* Center: search bar */}
      <div className="flex-1 flex justify-center px-8">
        <div
          className={`flex items-center gap-3 w-full max-w-[680px] rounded-full px-5 py-2.5 transition-all duration-200 ${
            searchFocused
              ? "bg-white shadow-md border border-gray-300"
              : "bg-[#edf2fc] hover:bg-[#e3e8f0]"
          }`}
        >
          <SearchIcon />
          <input
            value={navSearchQuery || ""}
            onChange={e => onNavSearchChange && onNavSearchChange(e.target.value)}
            placeholder="Search chat"
            className="bg-transparent border-none outline-none text-[15px] text-gray-800 placeholder:text-[#5f6368] w-full font-normal"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {navSearchQuery && (
            <button
              onClick={() => onNavSearchChange && onNavSearchChange("")}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Right: status, icons, profile */}
      <div className="flex items-center gap-1 min-w-[260px] justify-end">
        {/* Status */}
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 hover:bg-white hover:shadow-sm transition-all"
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: statusDisplay?.dotColor || "#34A853" }}
            />
            <span className="text-[13px] font-medium text-[#3c4043]">
              {currentStatus === "active" ? "Active" : currentStatus === "dnd" ? "DND" : currentStatus === "away" ? "Away" : "Status"}
            </span>
            <ChevronDownIcon />
          </button>
          {showStatusMenu && (
            <StatusDropdown
              currentStatus={currentStatus}
              onSelect={onStatusChange}
              onClose={() => setShowStatusMenu(false)}
            />
          )}
        </div>

        {/* Help */}
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200/70 transition-colors" title="Help">
          <QuestionIcon />
        </button>

        {/* Settings */}
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200/70 transition-colors" title="Settings">
          <SettingsIcon />
        </button>

        {/* Apps grid (9 dots) — with Calendar dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAppsMenu(!showAppsMenu)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200/70 transition-colors"
            title="Apps"
          >
            <AppsGridIcon />
          </button>
          {showAppsMenu && (
            <AppsDropdown onClose={() => setShowAppsMenu(false)} />
          )}
        </div>

        {/* Profile with org name + status indicator */}
        <div className="relative ml-2">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-gray-200/50 transition-colors"
          >
            <div className="text-right hidden lg:block">
              <p className="text-[12px] font-medium text-[#3c4043] leading-tight">SHNOOR</p>
              <p className="text-[10px] text-gray-500 leading-tight">International</p>
            </div>
            <div className="relative">
              <Avatar initials={currentUser.initials} color={currentUser.color} size={32} />
              {/* Status indicator on avatar */}
              {currentStatus === "active" && (
                <div className="absolute -bottom-0.5 -right-0.5 w-[12px] h-[12px] bg-[#34A853] rounded-full border-2 border-[#f8f9fa]" />
              )}
              {currentStatus === "dnd" && (
                <div className="absolute -bottom-0.5 -right-0.5 w-[12px] h-[12px] bg-[#EA4335] rounded-full border-2 border-[#f8f9fa] flex items-center justify-center">
                  <div className="w-[6px] h-[1.5px] bg-white rounded-full" />
                </div>
              )}
              {currentStatus === "away" && (
                <div className="absolute -bottom-0.5 -right-0.5 w-[12px] h-[12px] bg-[#FBBC04] rounded-full border-2 border-[#f8f9fa]" />
              )}
              {currentStatus === "custom" && (
                <div className="absolute -bottom-0.5 -right-0.5 w-[12px] h-[12px] bg-[#9AA0A6] rounded-full border-2 border-[#f8f9fa]" />
              )}
            </div>
          </button>
          {showProfileMenu && (
            <ProfileDropdown
              onClose={() => setShowProfileMenu(false)}
              onOpenSettings={onOpenSettings}
            />
          )}
        </div>
      </div>
    </div>
  );
}