import { useState, useEffect } from "react";

export default function CalendarMain({ viewMode, onViewModeChange, currentDate, setCurrentDate, tasks, indianHolidays, isMobile, onAddTask }) {

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "Day") newDate.setDate(newDate.getDate() - 1);
    if (viewMode === "Week") newDate.setDate(newDate.getDate() - 7);
    if (viewMode === "Month") newDate.setMonth(newDate.getMonth() - 1);
    if (viewMode === "Year") newDate.setFullYear(newDate.getFullYear() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "Day") newDate.setDate(newDate.getDate() + 1);
    if (viewMode === "Week") newDate.setDate(newDate.getDate() + 7);
    if (viewMode === "Month") newDate.setMonth(newDate.getMonth() + 1);
    if (viewMode === "Year") newDate.setFullYear(newDate.getFullYear() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const hours = Array.from({ length: 24 }, (_, i) => {
    if (i === 0) return "";
    const ampm = i < 12 ? "AM" : "PM";
    const hr = i % 12 || 12;
    return `${hr} ${ampm}`;
  });

  const getMonthName = (date) => ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][date.getMonth()];
  const getDayName = (date) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Timezone-safe: always format a Date as local YYYY-MM-DD
  const toLocalDateStr = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Normalise a task date string to YYYY-MM-DD (handles full ISO timestamps too)
  const normDate = (s) => (s ? String(s).slice(0, 10) : '');

  const calculateTop = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h * 60) + m;
  };

  const CurrentTimeLine = () => {
    const top = (currentTime.getHours() * 60) + currentTime.getMinutes();
    return (
      <div className="absolute w-full flex items-center z-30 pointer-events-none" style={{ top: `${top}px` }}>
        <div className="w-3 h-3 rounded-full bg-[#ea4335] -ml-1.5 shadow-sm" />
        <div className="h-[2px] w-full bg-[#ea4335]" />
      </div>
    );
  };

  // Render Day View
  const renderDayView = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex border-b border-gray-200">
        <div className="w-[60px] border-r border-gray-200 flex-shrink-0" />
        <div className="flex-1 text-center py-3 border-r border-gray-200 min-w-0">
          <div className="text-[11px] font-medium text-[#70757a] uppercase mb-1">{getDayName(currentDate)}</div>
          <div className="w-12 h-12 rounded-full bg-[#1a73e8] text-white text-[24px] flex items-center justify-center mx-auto">
            {currentDate.getDate()}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <div className="flex">
          <div className="w-[60px] flex-shrink-0 flex flex-col">
            {hours.map((hour, i) => (
              <div key={i} className="h-[60px] relative">
                <span className="absolute -top-3 right-2 text-[10px] text-[#70757a]">{hour}</span>
              </div>
            ))}
          </div>
          <div className="flex-1 relative border-l border-gray-200 min-w-0">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="h-[60px] border-b border-gray-100 last:border-b-0 w-full" />
            ))}
            {currentDate.toDateString() === new Date().toDateString() && <CurrentTimeLine />}
            
            {/* Dynamic Tasks */}
            {tasks.filter(t => normDate(t.date) === toLocalDateStr(currentDate)).map((task, idx) => {
              const topPos = calculateTop(task.time);
              return (
                <div
                  key={idx}
                  style={{ top: `${topPos}px` }}
                  className="absolute left-2 right-4 h-[3.5rem] bg-[#e8f0fe] border-l-4 border-[#1a73e8] rounded-md p-2 overflow-hidden hover:shadow-lg transition-all cursor-pointer z-20"
                >
                  <span className="text-[12px] font-semibold text-[#1a73e8] block truncate">{task.title}</span>
                  <span className="text-[10px] text-[#1a73e8] font-medium opacity-80">{task.time ? task.time.slice(0,5) : ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Week View
  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      return date;
    });

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex border-b border-gray-200">
          <div className="w-[60px] border-r border-gray-200 flex-shrink-0" />
          {weekDays.map((date, i) => (
            <div key={i} className="flex-1 text-center py-3 border-r border-gray-200 min-w-0">
              <div className="text-[11px] font-medium text-[#70757a] uppercase mb-1">{getDayName(date).substring(0, 3)}</div>
              <div className={`w-10 h-10 rounded-full text-[20px] mx-auto flex items-center justify-center ${date.toDateString() === new Date().toDateString() ? 'bg-[#1a73e8] text-white' : 'text-[#3c4043]'}`}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <div className="flex">
            <div className="w-[60px] flex-shrink-0 flex flex-col">
              {hours.map((hour, i) => (
                <div key={i} className="h-[60px] relative">
                  <span className="absolute -top-3 right-2 text-[10px] text-[#70757a]">{hour}</span>
                </div>
              ))}
            </div>
            {weekDays.map((date, dayIdx) => (
              <div key={dayIdx} className="flex-1 relative border-l border-gray-200 min-w-0">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="h-[60px] border-b border-gray-100 last:border-b-0 w-full hover:bg-gray-50/30 cursor-pointer" />
                ))}
                
                {date.toDateString() === new Date().toDateString() && <CurrentTimeLine />}
                
                {/* Dynamic Tasks for Week View */}
                {tasks.filter(t => normDate(t.date) === toLocalDateStr(date)).map((task, idx) => {
                  const topPos = calculateTop(task.time);
                  return (
                    <div
                      key={idx}
                      style={{ top: `${topPos}px` }}
                      className="absolute left-1 right-1 h-[2.5rem] bg-[#e8f0fe] border-l-4 border-[#1a73e8] rounded-sm p-1 overflow-hidden hover:shadow-md transition-shadow cursor-pointer z-20"
                    >
                      <span className="text-[10px] font-semibold text-[#1a73e8] block truncate">{task.title}</span>
                      <span className="text-[9px] text-[#1a73e8] opacity-70">{task.time ? task.time.slice(0,5) : ''}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render Month View
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    let days = Array.from({ length: firstDay }, () => null);
    for (let i = 1; i <= numDays; i++) days.push(i);
    // Pad to multiple of 7
    while (days.length % 7 !== 0) days.push(null);

    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="grid grid-cols-7 border-b border-gray-200 bg-white">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="py-2 text-center text-[11px] font-medium text-[#70757a] uppercase border-r border-gray-200 last:border-none">
              {day}
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-hidden">
          {days.map((day, i) => {
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            return (
              <div key={i} className="border-r border-b border-gray-200 p-1 min-h-[80px] hover:bg-gray-50 transition-colors cursor-pointer flex flex-col">
                <div className="flex justify-center">
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full text-[12px] font-medium mt-1 ${isToday ? 'bg-[#1a73e8] text-white' : 'text-[#3c4043]'}`}>
                    {day || ""}
                  </div>
                </div>
                
                {/* Dynamic Content for Month View */}
                {day && (
                  <div className="flex flex-col gap-1 overflow-hidden mt-1 px-1">
                    {/* Holiday */}
                    {(() => {
                      const holiday = indianHolidays[`${month + 1}-${day}`];
                      return holiday && (
                        <div className="bg-[#fce8e6] text-[#ea4335] text-[10px] px-1.5 py-0.5 rounded truncate font-medium" title={holiday}>
                          {holiday}
                        </div>
                      );
                    })()}

                    {/* Tasks */}
                    {tasks.filter(t => {
                      const d = new Date(t.date);
                      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
                    }).map((task, idx) => (
                      <div key={idx} className="flex items-center gap-1 bg-[#e8f0fe] text-[#1a73e8] px-1.5 py-0.5 rounded truncate transition-all hover:bg-[#d2e3fc]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1a73e8] flex-shrink-0"></div>
                        <span className="text-[10px] truncate font-medium">{task.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Year View
  const renderYearView = () => {
    const year = currentDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

    return (
      <div className="flex-1 overflow-y-auto p-8 bg-white grid grid-cols-3 lg:grid-cols-4 gap-8">
        {months.map((monthDate, i) => (
          <div key={i} className="flex flex-col">
            <h3 className="text-[16px] font-semibold text-[#1a73e8] mb-4 text-center">{getMonthName(monthDate)}</h3>
            <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, j) => (
                <div key={j} className="text-[11px] font-medium text-[#70757a] mb-1">{d}</div>
              ))}
              {(() => {
                const numDays = new Date(year, i + 1, 0).getDate();
                const firstDay = new Date(year, i, 1).getDay();
                let days = Array.from({ length: firstDay }, () => null);
                for (let k = 1; k <= numDays; k++) days.push(k);

                return days.map((date, idx) => {
                  const isToday = date === new Date().getDate() && i === new Date().getMonth() && year === new Date().getFullYear();
                  // Check if any task falls on this day
                  const hasTask = date && tasks.some(t => {
                    const d = new Date(normDate(t.date) + 'T00:00:00');
                    return d.getDate() === date && d.getMonth() === i && d.getFullYear() === year;
                  });
                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <div className={`w-6 h-6 flex items-center justify-center rounded-full text-[12px] hover:bg-gray-100 cursor-pointer ${
                        isToday ? 'bg-[#1a73e8] text-white font-bold' : 'text-[#3c4043]'
                      }`}>
                        {date || ''}
                      </div>
                      {hasTask && (
                        <div className="w-1 h-1 rounded-full bg-[#1a73e8] mt-0.5" />
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const VIEW_MODES = ["Day", "Week", "Month", "Year", "Tasks"];

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Calendar Action Bar */}
      <div style={{
        height: isMobile ? 'auto' : 52,
        padding: isMobile ? '8px 12px' : '0 16px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? 8 : 12,
        background: '#fff',
        zIndex: 10,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <button onClick={handleToday} style={{
            padding: '0 12px', border: '1px solid #dadce0', borderRadius: 6,
            background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            color: '#3c4043', height: 32, display: 'flex', alignItems: 'center'
          }}>
            Today
          </button>

          {/* FIX: Add Task button specifically for mobile header since sidebar is hidden */}
          {isMobile && (
            <button 
              onClick={onAddTask}
              style={{
                width: 32, height: 32, borderRadius: '50%', background: '#e8f0fe',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#1a73e8'
              }}
              title="Add task"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={handlePrev} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: '50%', color: '#5f6368' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button onClick={handleNext} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: '50%', color: '#5f6368' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          <h2 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 400, color: '#3c4043', margin: 0, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {viewMode === "Day" ? `${getMonthName(currentDate)} ${currentDate.getDate()}, ${currentDate.getFullYear()}` : ''}
            {viewMode === "Week" ? `${getMonthName(currentDate)} ${currentDate.getFullYear()}` : ''}
            {viewMode === "Month" ? `${getMonthName(currentDate)} ${currentDate.getFullYear()}` : ''}
            {viewMode === "Year" ? `${currentDate.getFullYear()}` : ''}
            {viewMode === "Tasks" ? 'Tasks' : ''}
          </h2>
        </div>

        {/* Right: View mode selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: isMobile ? 'center' : 'flex-end' }}>
          {isMobile ? (
             <select 
               value={viewMode} 
               onChange={(e) => onViewModeChange?.(e.target.value)}
               style={{
                 padding: '4px 8px', borderRadius: 6, border: '1px solid #dadce0',
                 fontSize: 13, background: '#fff', color: '#3c4043', outline: 'none'
               }}
             >
               {VIEW_MODES.map(mode => <option key={mode} value={mode}>{mode}</option>)}
             </select>
          ) : (
            <div style={{ display: 'flex', border: '1px solid #dadce0', borderRadius: 6, overflow: 'hidden' }}>
              {VIEW_MODES.map((mode, idx) => (
                <button
                  key={mode}
                  onClick={() => onViewModeChange?.(mode)}
                  style={{
                    padding: '6px 12px', border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 500,
                    background: viewMode === mode ? '#f1f3f4' : 'none',
                    color: viewMode === mode ? '#1a73e8' : '#5f6368',
                    borderLeft: idx > 0 ? '1px solid #dadce0' : 'none'
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {viewMode === "Day" && renderDayView()}
      {viewMode === "Week" && renderWeekView()}
      {viewMode === "Month" && renderMonthView()}
      {viewMode === "Year" && renderYearView()}
    </div>
  );
}
