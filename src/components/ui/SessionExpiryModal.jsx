import React from 'react';

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const WarningIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export default function SessionExpiryModal({ onContinue, onLogout }) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        style={{ animation: "fadeIn 0.3s ease-out" }}
      />

      {/* Modal */}
      <div
        className="relative bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-2xl w-[400px] overflow-hidden"
        style={{ animation: "fadeSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      >
        {/* Header decoration */}
        <div className="h-2 bg-yellow-400 w-full" />
        
        <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-full">
            <WarningIcon />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Session Expiring
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Your session is about to expire due to inactivity. <br />
            Would you like to stay logged in?
          </p>

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={onContinue}
              className="w-full py-3.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold rounded-2xl transition-all shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-95"
            >
              Continue Session
            </button>
            <button
              onClick={onLogout}
              className="w-full py-3.5 bg-gray-100 dark:bg-[#2D2D2D] hover:bg-gray-200 dark:hover:bg-[#3D3D3D] text-gray-700 dark:text-gray-300 font-semibold rounded-2xl transition-all"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </div>
  );
}
