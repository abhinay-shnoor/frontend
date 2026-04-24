/**
 * Formats a date string into a human-readable label: 'Today', 'Yesterday', or 'DD/MM/YYYY'.
 * @param {string|Date} dateStr - The date to format.
 * @returns {string} - The formatted date label.
 */
export const formatDateLabel = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMsg = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diffMs = startOfToday.getTime() - startOfMsg.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Formats a timestamp into a 12-hour time string (e.g., '12:34 PM').
 * @param {string|Date} dateStr - The date to format.
 * @returns {string} - The formatted time string.
 */
export const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};
