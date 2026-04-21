import { useState } from "react";
import { directMessages, spaces } from "../../data/mockData.js";
import Avatar from "../ui/Avatar.jsx";

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const HashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const GoogleDriveIcon = () => (
  <svg width="18" height="16" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066DA" />
    <path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L3.45 44.7c-.8 1.4-1.2 2.95-1.2 4.5h27.5L43.65 25z" fill="#00AC47" />
    <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.85L73.55 76.8z" fill="#EA4335" />
    <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2L43.65 25z" fill="#00832D" />
    <path d="M59.85 53H27.5l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.4c1.6 0 3.15-.45 4.5-1.2L59.85 53z" fill="#2684FC" />
    <path d="M73.4 26.5l-12.7-22C59.35 3.1 58.2 2 56.85 1.2L43.65 25l16.2 28h27.45c0-1.55-.4-3.1-1.2-4.5l-12.7-22z" fill="#FFBA00" />
  </svg>
);

export default function Sidebar({ activeSpace, activeDM, onSelectSpace, onSelectDM, isOpen, currentUser }) {
  const [search, setSearch] = useState("");

  const filteredDMs = directMessages.filter(dm =>
    dm.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredSpaces = spaces.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className={`flex flex-col bg-white border-r border-gray-200 flex-shrink-0 h-full transition-all duration-300 overflow-hidden ${isOpen ? "w-[260px]" : "w-0"
        }`}
    >
      <div className="w-[260px] flex flex-col h-full">
        {/* Organization header */}
        <div className="px-4 pt-4 pb-3 flex items-center gap-3 border-b border-gray-100">
          <img
            src="/shnoor-logo.png"
            alt="SHNOOR"
            className="w-9 h-9 rounded-lg object-contain"
          />
          <div className="min-w-0">
            <h1 className="text-[15px] font-bold text-gray-900 leading-tight truncate">SHNOOR</h1>
            <p className="text-[11px] text-gray-500 leading-tight">International LLC</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-3 py-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-[7px] transition-all focus-within:ring-2 focus-within:ring-teal/30 focus-within:bg-white focus-within:border-teal border border-transparent">
            <SearchIcon />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search in SHNOOR..."
              className="bg-transparent border-none outline-none text-[13px] text-gray-800 placeholder:text-gray-400 w-full"
            />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-1">
          {/* Direct Messages section */}
          <div className="mb-2">
            <div className="px-3 py-2">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Direct Messages</span>
            </div>
            {filteredDMs.map(dm => (
              <button
                key={dm.id}
                onClick={() => onSelectDM(dm)}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-[6px] rounded-lg transition-all text-left mx-1
                  ${activeDM?.id === dm.id
                    ? "bg-teal/10 text-teal"
                    : "text-gray-700 hover:bg-gray-50"
                  }
                `}
                style={{ width: "calc(100% - 8px)" }}
              >
                <Avatar initials={dm.initials} color={dm.color} size={28} />
                <span className={`text-[13px] truncate ${activeDM?.id === dm.id ? "font-semibold" : "font-medium"}`}>
                  {dm.name}
                </span>
              </button>
            ))}
          </div>

          {/* Spaces section */}
          <div className="mb-2">
            <div className="px-3 py-2">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Spaces</span>
            </div>
            {filteredSpaces.map(space => (
              <button
                key={space.id}
                onClick={() => onSelectSpace(space)}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-[6px] rounded-lg transition-all text-left mx-1
                  ${activeSpace?.id === space.id
                    ? "bg-teal/10 text-teal"
                    : "text-gray-600 hover:bg-gray-50"
                  }
                `}
                style={{ width: "calc(100% - 8px)" }}
              >
                <HashIcon />
                <span className={`text-[13px] flex-1 truncate ${activeSpace?.id === space.id ? "font-semibold text-teal" : "font-medium text-gray-700"}`}>
                  {space.name}
                </span>
                {space.unread > 0 && (
                  <span className="bg-teal text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                    {space.unread}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Google Drive link */}
          <div className="mb-2 mt-1">
            <button
              className="w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg transition-all text-left mx-1 text-gray-600 hover:bg-gray-50"
              style={{ width: "calc(100% - 8px)" }}
              title="Shnoor Drive"
            >
              <GoogleDriveIcon />
              <span className="text-[13px] font-medium text-gray-700">Shnoor Drive</span>
            </button>
          </div>
        </div>

        {/* Current user profile at bottom */}
        <div className="px-3 py-3 border-t border-gray-100 flex items-center gap-2.5">
          <Avatar initials={currentUser?.initials || "??"} color={currentUser?.color || "#94a3b8"} size={32} />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-800 truncate">{currentUser?.name || "Guest"}</p>
            <p className="text-[11px] text-gray-400 truncate">{currentUser?.email || "guest@shnoor.com"}</p>
          </div>
          <button className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" title="Settings">
            <SettingsIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
