import { useState, useRef } from "react";
import { currentUser } from "../../data/mockData.js";
import Avatar from "./Avatar.jsx";

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

export default function SettingsModal({ onClose }) {
  const [profileImage, setProfileImage] = useState(null);
  const [displayName, setDisplayName] = useState(currentUser.name);
  const [email] = useState(currentUser.email);
  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    alert("Settings saved!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: "fadeIn 0.2s ease-out" }}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-[440px] max-h-[90vh] overflow-hidden"
        style={{ animation: "fadeSlideUp 0.25s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[18px] font-bold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-6">
          {/* Profile Photo Section */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Profile Photo
            </label>
            <div className="flex items-center gap-4">
              {/* Photo preview */}
              <div className="relative group">
                {profileImage ? (
                  <div
                    className="w-[72px] h-[72px] rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0"
                  >
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <Avatar initials={currentUser.initials} color={currentUser.color} size={72} />
                )}
                {/* Camera overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 w-[72px] h-[72px] rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <span className="text-white">
                    <CameraIcon />
                  </span>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-teal text-white text-[13px] font-semibold rounded-lg hover:bg-teal-hover transition-colors shadow-sm"
                >
                  Upload Photo
                </button>
                {profileImage && (
                  <button
                    onClick={() => setProfileImage(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 text-[13px] font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              Recommended: Square image, at least 200×200px. JPG, PNG or GIF.
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[14px] text-gray-800 focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/15 transition-all"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3 py-2.5 border border-gray-100 rounded-lg text-[14px] text-gray-500 bg-gray-50 cursor-not-allowed"
            />
          </div>

          {/* Theme (optional nice-to-have) */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Theme
            </label>
            <div className="flex gap-3">
              <button className="flex-1 py-2.5 rounded-lg border-2 border-teal bg-teal/5 text-[13px] font-semibold text-teal transition-all">
                Light
              </button>
              <button className="flex-1 py-2.5 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-500 hover:border-gray-300 transition-all">
                Dark
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-[13px] font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-teal text-white text-[13px] font-semibold rounded-lg hover:bg-teal-hover transition-colors shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
