const CheckCircleIcon = ({ completed }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={completed ? "#34A853" : "none"} stroke={completed ? "#34A853" : "#5f6368"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// Safely format a date string from PostgreSQL (may be "YYYY-MM-DD" or full ISO)
const formatDate = (rawDate) => {
  if (!rawDate) return null;
  // Normalise to YYYY-MM-DD (strips time component if present)
  const dateOnly = String(rawDate).slice(0, 10);
  const d = new Date(dateOnly + 'T00:00:00'); // parse as local midnight
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

export default function TasksList({ tasks, loading, toggleTaskCompletion, deleteTask, onViewCalendar }) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f8f9fa]">
        <div className="w-8 h-8 border-2 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#f8f9fa] border-l border-gray-200 overflow-y-auto">
      {/* Header row with title and "View Calendar" button */}
      <div className="sticky top-0 bg-[#f8f9fa] border-b border-gray-200 px-8 py-4 flex items-center justify-between z-10">
        <h2 className="text-[22px] font-normal text-[#3c4043]">My Tasks</h2>
        {onViewCalendar && (
          <button
            onClick={onViewCalendar}
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-[#1a73e8] text-[#1a73e8] text-[13px] font-medium hover:bg-[#e8f0fe] transition-colors"
          >
            <CalendarIcon />
            View Calendar
          </button>
        )}
      </div>

      <div className="p-8 pt-6">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-24 h-24 mb-6 opacity-25 flex items-center justify-center">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <h3 className="text-[18px] font-medium text-[#3c4043] mb-2">No tasks yet</h3>
            <p className="text-[14px] text-[#5f6368]">Click "+ Add task" in the sidebar to create one.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto flex flex-col gap-3">
            {[...tasks]
              .sort((a, b) => {
                if (a.completed !== b.completed) return a.completed ? 1 : -1;
                return new Date((a.date || "9999") + "T" + (a.time || "00:00")) -
                       new Date((b.date || "9999") + "T" + (b.time || "00:00"));
              })
              .map(task => (
                <div
                  key={task.id}
                  className={`bg-white border rounded-lg p-4 shadow-sm flex items-center gap-4 transition-all hover:shadow-md ${
                    task.completed ? 'border-gray-200 opacity-60' : 'border-[#1a73e8]/30'
                  }`}
                >
                  <button onClick={() => toggleTaskCompletion(task.id)} className="flex-shrink-0 hover:scale-110 transition-transform">
                    <CheckCircleIcon completed={task.completed} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-[15px] font-medium text-gray-900 truncate ${task.completed ? 'line-through text-gray-400' : ''}`}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-[12px] text-[#5f6368] truncate mt-0.5">{task.description}</p>
                    )}
                    {(task.date || task.time) && (
                      <div className="flex items-center gap-2 mt-1 text-[12px] text-[#5f6368]">
                        {formatDate(task.date) && (
                          <span>{formatDate(task.date)}</span>
                        )}
                        {formatDate(task.date) && task.time && <span>•</span>}
                        {task.time && <span>{String(task.time).slice(0, 5)}</span>}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                    title="Delete task"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
