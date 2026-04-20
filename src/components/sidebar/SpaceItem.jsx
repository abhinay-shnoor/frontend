const GroupIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);

export default function SpaceItem({ space, active }) {
  return (
    <div className={`
      flex items-center gap-2.5 px-3.5 py-1.5 cursor-pointer transition-colors
      ${active
        ? "bg-teal/[0.15] text-teal"
        : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
      }
    `}>
      <GroupIcon />
      <span className={`text-[13px] flex-1 ${active ? "text-gray-100 font-medium" : "text-gray-300"}`}>
        {space.name}
      </span>
      {space.unread > 0 && (
        <span className="bg-teal text-white text-[11px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {space.unread}
        </span>
      )}
    </div>
  );
}