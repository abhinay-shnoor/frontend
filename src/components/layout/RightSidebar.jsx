
export default function RightSidebar() {
  return (
    <div className="flex flex-col items-center w-[52px] bg-[#f8f9fa] border-l border-gray-200 py-3 flex-shrink-0 h-full gap-2">
      <button
        className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all"
        title="Calendar"
      >
        <CalendarIcon />
      </button>
      <button
        className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all"
        title="Keep"
      >
        <KeepIcon />
      </button>
      <button
        className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all"
        title="Add"
      >
        <PlusIcon />
      </button>
    </div>
  );
}
