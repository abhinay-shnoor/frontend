// import { useState, useEffect } from "react";
// import CalendarSidebar from "./CalendarSidebar.jsx";
// import CalendarMain from "./CalendarMain.jsx";
// import TasksList from "./TasksList.jsx";
// import AddTaskModal from "./AddTaskModal.jsx";
// import {
//   getTasks as apiGetTasks,
//   createTask as apiCreateTask,
//   toggleTask as apiToggleTask,
//   deleteTask as apiDeleteTask,
// } from "../../api/calendar.js";

// export const indianHolidays = {
//   "1-1": "New Year's Day",
//   "1-26": "Republic Day",
//   "3-14": "Holi",
//   "4-14": "Ambedkar Jayanti",
//   "5-1": "Labour Day",
//   "8-15": "Independence Day",
//   "10-2": "Gandhi Jayanti",
//   "10-19": "Diwali",
//   "12-25": "Christmas Day"
// };

// export default function CalendarView({ isSidebarOpen, navSearchQuery }) {
//   const [viewMode, setViewMode] = useState("Month");
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentDate, setCurrentDate] = useState(new Date());

//   // Fetch tasks from backend on mount
//   useEffect(() => {
//     setLoading(true);
//     apiGetTasks()
//       .then(data => {
//         // Normalise field names: backend returns `date` and `time` already via alias
//         setTasks(data.map(t => ({
//           id: t.id,
//           title: t.title,
//           description: t.description,
//           date: t.date,       // YYYY-MM-DD
//           time: t.time,       // HH:MM or null
//           completed: t.completed,
//         })));
//       })
//       .catch(() => { })
//       .finally(() => setLoading(false));
//   }, []);

//   const handleAddTask = async (newTask) => {
//     try {
//       const created = await apiCreateTask({
//         title: newTask.title,
//         description: newTask.description || null,
//         date: newTask.date || null,
//         time: newTask.time || null,
//       });
//       setTasks(prev => [...prev, {
//         id: created.id,
//         title: created.title,
//         description: created.description,
//         date: created.date,
//         time: created.time,
//         completed: created.completed,
//       }]);
//     } catch {
//       // silently fail; a toast would require context here
//     }
//   };

//   const toggleTaskCompletion = async (id) => {
//     const task = tasks.find(t => t.id === id);
//     if (!task) return;
//     const updated = await apiToggleTask(id, !task.completed);
//     setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: updated.completed } : t));
//   };

//   const deleteTask = async (id) => {
//     try {
//       await apiDeleteTask(id);
//       setTasks(prev => prev.filter(t => t.id !== id));
//     } catch { }
//   };

//   // Search logic (tasks + holidays)
//   const query = (navSearchQuery || "").toLowerCase().trim();
//   let searchResults = null;
//   if (query.length > 0) {
//     const matchingTasks = tasks.filter(t => t.title.toLowerCase().includes(query));
//     const matchingHolidays = Object.entries(indianHolidays).filter(([_, name]) => name.toLowerCase().includes(query));
//     searchResults = (
//       <div className="absolute top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-md max-h-[300px] overflow-y-auto">
//         <div className="p-4">
//           <h3 className="text-[12px] font-semibold text-gray-500 uppercase mb-2">Search Results</h3>
//           {matchingTasks.length === 0 && matchingHolidays.length === 0 && (
//             <p className="text-[14px] text-gray-500">No tasks or holidays found.</p>
//           )}
//           {matchingTasks.length > 0 && (
//             <div className="mb-4">
//               <h4 className="text-[13px] font-medium text-[#1a73e8] mb-1">Tasks</h4>
//               {matchingTasks.map(t => (
//                 <div key={t.id} className="py-1 px-2 hover:bg-gray-50 text-[14px] flex justify-between cursor-pointer">
//                   <span>{t.title}</span>
//                   <span className="text-gray-500 text-[12px]">{t.date}</span>
//                 </div>
//               ))}
//             </div>
//           )}
//           {matchingHolidays.length > 0 && (
//             <div>
//               <h4 className="text-[13px] font-medium text-[#ea4335] mb-1">Holidays</h4>
//               {matchingHolidays.map(([key, name]) => {
//                 const [m, d] = key.split('-');
//                 const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//                 return (
//                   <div key={key} className="py-1 px-2 hover:bg-gray-50 text-[14px] flex justify-between cursor-pointer">
//                     <span>{name}</span>
//                     <span className="text-gray-500 text-[12px]">{monthNames[parseInt(m) - 1]} {d}</span>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col flex-1 overflow-hidden relative">
//       {/* Back to chat bar */}
//       <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderBottom: '1px solid #e5e7eb', background: '#fff', flexShrink: 0 }}>
//         <button
//           onClick={() => window.dispatchEvent(new CustomEvent('calendar:back'))}
//           style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#5f6368', fontWeight: 500, padding: '4px 8px', borderRadius: 6 }}
//           onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
//           onMouseLeave={e => e.currentTarget.style.background = 'none'}
//         >
//           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <polyline points="15 18 9 12 15 6" />
//           </svg>
//           Back to Chat
//         </button>
//       </div>
//       <div className="flex flex-1 overflow-hidden relative">
//         {searchResults}

//         <CalendarSidebar
//           isOpen={isSidebarOpen}
//           onAddTask={() => setIsModalOpen(true)}
//           currentDate={currentDate}
//           setCurrentDate={setCurrentDate}
//           indianHolidays={indianHolidays}
//         />

//         {viewMode === "Tasks" ? (
//           <TasksList
//             tasks={tasks}
//             loading={loading}
//             toggleTaskCompletion={toggleTaskCompletion}
//             deleteTask={deleteTask}
//             onViewCalendar={() => setViewMode("Month")}
//           />
//         ) : (
//           <CalendarMain
//             viewMode={viewMode}
//             onViewModeChange={setViewMode}
//             currentDate={currentDate}
//             setCurrentDate={setCurrentDate}
//             tasks={tasks}
//             indianHolidays={indianHolidays}
//           />
//         )}

//         {isModalOpen && (
//           <AddTaskModal
//             onClose={() => setIsModalOpen(false)}
//             onSave={handleAddTask}
//           />
//         )}
//       </div>
//         </div>
//       );
// }


import { useState, useEffect } from "react";
import CalendarSidebar from "./CalendarSidebar.jsx";
import CalendarMain from "./CalendarMain.jsx";
import TasksList from "./TasksList.jsx";
import AddTaskModal from "./AddTaskModal.jsx";
import {
  getTasks as apiGetTasks,
  createTask as apiCreateTask,
  toggleTask as apiToggleTask,
  deleteTask as apiDeleteTask,
} from "../../api/calendar.js";

export const indianHolidays = {
  "1-1":  "New Year's Day",
  "1-26": "Republic Day",
  "3-14": "Holi",
  "4-14": "Ambedkar Jayanti",
  "5-1":  "Labour Day",
  "8-15": "Independence Day",
  "10-2": "Gandhi Jayanti",
  "10-19":"Diwali",
  "12-25":"Christmas Day",
};

// FIX 9: CalendarView no longer accepts navSearchQuery from parent.
// It manages its own internal search bar so the global chat search bar
// is not shown when the calendar is active.
export default function CalendarView({ isSidebarOpen, isMobile }) {
  const [viewMode, setViewMode]     = useState("Month");
  const [tasks, setTasks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // ─── Internal search state (replaces global navSearchQuery dependency) ────
  const [searchQuery, setSearchQuery]   = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiGetTasks()
      .then(data => {
        setTasks(data.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          date: t.date,
          time: t.time,
          completed: t.completed,
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAddTask = async (newTask) => {
    try {
      const created = await apiCreateTask({
        title: newTask.title,
        description: newTask.description || null,
        date: newTask.date || null,
        time: newTask.time || null,
      });
      setTasks(prev => [...prev, {
        id: created.id,
        title: created.title,
        description: created.description,
        date: created.date,
        time: created.time,
        completed: created.completed,
      }]);
    } catch {}
  };

  const toggleTaskCompletion = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const updated = await apiToggleTask(id, !task.completed);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: updated.completed } : t));
  };

  const deleteTask = async (id) => {
    try {
      await apiDeleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch {}
  };

  // Build search results from the internal query
  const query = searchQuery.toLowerCase().trim();
  let searchResults = null;
  if (query.length > 0) {
    const matchingTasks    = tasks.filter(t => t.title.toLowerCase().includes(query));
    const matchingHolidays = Object.entries(indianHolidays).filter(([_, name]) =>
      name.toLowerCase().includes(query)
    );
    searchResults = (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        maxHeight: 300, overflowY: 'auto',
      }}>
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', margin: 0 }}>
              Search Results
            </h3>
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 16 }}>✕</button>
          </div>
          {matchingTasks.length === 0 && matchingHolidays.length === 0 && (
            <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>No tasks or holidays found.</p>
          )}
          {matchingTasks.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <h4 style={{ fontSize: 13, fontWeight: 500, color: '#1a73e8', marginBottom: 4, marginTop: 0 }}>Tasks</h4>
              {matchingTasks.map(t => (
                <div key={t.id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '6px 8px', fontSize: 14, cursor: 'pointer', borderRadius: 6,
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span>{t.title}</span>
                  <span style={{ color: '#6B7280', fontSize: 12 }}>{t.date}</span>
                </div>
              ))}
            </div>
          )}
          {matchingHolidays.length > 0 && (
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 500, color: '#ea4335', marginBottom: 4, marginTop: 0 }}>Holidays</h4>
              {matchingHolidays.map(([key, name]) => {
                const [m, d] = key.split('-');
                const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                return (
                  <div key={key} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '6px 8px', fontSize: 14, cursor: 'pointer', borderRadius: 6,
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <span>{name}</span>
                    <span style={{ color: '#6B7280', fontSize: 12 }}>{monthNames[parseInt(m) - 1]} {d}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden relative">
      {/* Back to chat bar + internal search input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 16px', borderBottom: '1px solid #e5e7eb',
        background: '#fff', flexShrink: 0,
      }}>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('calendar:back'))}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, background: 'none',
            border: 'none', cursor: 'pointer', fontSize: 13, color: '#5f6368',
            fontWeight: 500, padding: '4px 8px', borderRadius: 6, flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Chat
        </button>

        {/* FIX 9: Calendar-specific search bar (replaces global navbar search) */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          background: searchFocused ? '#fff' : '#f1f3f4',
          border: searchFocused ? '1.5px solid #1a73e8' : '1.5px solid transparent',
          borderRadius: 24, padding: '6px 14px', transition: 'all 0.2s', maxWidth: 500,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search tasks & holidays..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: 13, color: '#374151',
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', lineHeight: 1 }}>✕</button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Internal search results overlay */}
        {searchResults}

        <CalendarSidebar
          isOpen={isSidebarOpen}
          onAddTask={() => setIsModalOpen(true)}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          indianHolidays={indianHolidays}
        />

        {viewMode === "Tasks" ? (
          <TasksList
            tasks={tasks}
            loading={loading}
            toggleTaskCompletion={toggleTaskCompletion}
            deleteTask={deleteTask}
            onViewCalendar={() => setViewMode("Month")}
          />
        ) : (
          <CalendarMain
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            tasks={tasks}
            indianHolidays={indianHolidays}
            isMobile={isMobile}
          />
        )}

        {isModalOpen && (
          <AddTaskModal
            onClose={() => setIsModalOpen(false)}
            onSave={handleAddTask}
          />
        )}
      </div>
    </div>
  );
}