import { useState } from "react";

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function AddTaskModal({ onClose, onSave }) {
  const [taskName, setTaskName] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskTime, setTaskTime] = useState("");

  const handleSave = () => {
    if (taskName.trim()) {
      onSave({ title: taskName, date: taskDate, time: taskTime, id: Date.now() });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" style={{ animation: "fadeIn 0.2s" }}>
      <div className="bg-white rounded-lg shadow-xl w-[400px] overflow-hidden" style={{ animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-[#f8f9fa]">
          <h3 className="text-[16px] font-semibold text-[#3c4043]">Add task</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <CloseIcon />
          </button>
        </div>
        
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Task Name</label>
            <input 
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              placeholder="e.g., Update project docs" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1a73e8] text-[14px]"
              autoFocus
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date"
                value={taskDate}
                onChange={e => setTaskDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1a73e8] text-[14px] text-gray-800"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Time</label>
              <input 
                type="time"
                value={taskTime}
                onChange={e => setTaskTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1a73e8] text-[14px] text-gray-800"
              />
            </div>
          </div>
        </div>
        
        <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2 bg-[#f8f9fa]">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-md hover:bg-gray-100 font-medium text-[13px] text-[#5f6368] transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!taskName.trim()}
            className="px-4 py-2 rounded-md bg-[#1a73e8] text-white font-medium text-[13px] hover:bg-[#1557b0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
}
