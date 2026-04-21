const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export default function RightIconRail({ onNavigateToCalendar }) {
  return (
    <div className="flex flex-col items-center w-[52px] bg-[#f8f9fa] border-l border-gray-200 flex-shrink-0 h-full">
      <div className="flex flex-col items-center gap-1 py-3">
        <button
          onClick={onNavigateToCalendar}
          className="w-10 h-10 flex items-center justify-center rounded-full text-[#5f6368] hover:bg-gray-200/70 transition-colors"
          title="Open Calendar"
        >
          <CalendarIcon />
        </button>
      </div>

      <button
        className="w-10 h-10 flex items-center justify-center rounded-full text-[#5f6368] hover:bg-gray-200/70 transition-colors mt-1"
        title="Add more"
      >
        <PlusIcon />
      </button>

      <div className="flex-1" />

      <div className="pb-3">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full text-[#9aa0a6] hover:bg-gray-200/70 transition-colors"
          title="Collapse"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}