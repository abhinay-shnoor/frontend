import { useState, useMemo } from "react";

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default function CalendarSidebar({ isOpen, onAddTask, currentDate, setCurrentDate, indianHolidays }) {
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    let days = Array.from({ length: firstDay }, () => null);
    for (let i = 1; i <= numDays; i++) {
      days.push(i);
    }
    return days;
  }, [currentDate]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

  if (!isOpen) return null;

  return (
    <div className="w-[280px] bg-white border-r border-gray-200 h-full flex flex-col pt-4 overflow-y-auto flex-shrink-0">
      
      {/* Add Task */}
      <div className="px-4 mb-6 mt-2">
        <button 
          onClick={onAddTask}
          className="flex items-center gap-3 w-full px-4 py-3 bg-[#e8f0fe] text-[#1a73e8] hover:bg-[#d2e3fc] rounded-lg transition-colors text-[14px] font-medium shadow-sm"
        >
          <PlusIcon />
          <span>Add task</span>
        </button>
      </div>

      {/* Mini Calendar */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[14px] font-medium text-[#3c4043] ml-1">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft /></button>
            <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight /></button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center">
          {dayNames.map((day, i) => (
            <div key={i} className="text-[10px] h-6 flex items-center justify-center font-medium text-[#70757a]">
              {day}
            </div>
          ))}
          {daysInMonth.map((date, i) => {
            const isToday = isCurrentMonth && date === today.getDate();
            const holidayKey = date ? `${currentDate.getMonth() + 1}-${date}` : null;
            const holiday = indianHolidays[holidayKey];
            
            return (
              <div 
                key={i} 
                title={holiday || ""}
                onClick={() => date && setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), date))}
                className={`w-7 h-7 flex flex-col items-center justify-center text-[12px] relative rounded-full hover:bg-gray-100 cursor-pointer ${
                  isToday ? "bg-[#1a73e8] text-white font-bold hover:bg-[#1557b0]" : "text-[#3c4043]"
                } ${holiday && !isToday ? "font-bold text-[#ea4335]" : ""}`}
              >
                <span>{date || ""}</span>
                {holiday && <div className={`w-1 h-1 rounded-full absolute bottom-0.5 ${isToday ? "bg-white" : "bg-[#ea4335]"}`} />}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Holidays List below calendar */}
      <div className="px-6">
        <h4 className="text-[11px] font-semibold text-[#70757a] uppercase mb-2">Upcoming IT Holidays</h4>
        <div className="flex flex-col gap-2">
          {Object.entries(indianHolidays)
            .filter(([key]) => {
              const [m, d] = key.split('-');
              return parseInt(m) > currentDate.getMonth() || (parseInt(m) === currentDate.getMonth() + 1 && parseInt(d) >= currentDate.getDate());
            })
            .slice(0, 3)
            .map(([key, name]) => {
              const [m, d] = key.split('-');
              return (
                <div key={key} className="flex items-center gap-2 text-[12px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#34A853]"></div>
                  <span className="text-[#3c4043] font-medium">{d} {monthNames[parseInt(m)-1]}</span>
                  <span className="text-[#70757a] ml-auto truncate max-w-[100px]" title={name}>{name}</span>
                </div>
              );
            })}
        </div>
      </div>

    </div>
  );
}
