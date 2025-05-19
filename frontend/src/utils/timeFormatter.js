/**
 * Formats a time string from 24-hour format to 12-hour format with AM/PM
 * @param {string} timeString - Time string in format "HH:MM:SS" or "HH:MM"
 * @returns {string} Formatted time string in format "HH:MM AM/PM"
 */
export const formatTime = (timeString) => {
  if (!timeString) return '';

  // Extract hours and minutes from the time string
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);

  // Determine AM/PM
  const ampm = hour >= 12 ? 'PM' : 'AM';

  // Convert to 12-hour format
  const hour12 = hour % 12 || 12;

  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Formats a date string to a localized date string
 * @param {string} dateString - Date string in any valid format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  // Set hours to noon to avoid timezone issues
  date.setHours(12, 0, 0, 0);
  return date.toLocaleDateString();
};

/**
 * Gets the day of week name from a date string
 * @param {string} dateString - Date string in any valid format
 * @returns {string} Day of week name (e.g., "Monday")
 */
export const getDayOfWeek = (dateString) => {
  const date = new Date(dateString);
  // Set hours to noon to avoid timezone issues
  date.setHours(12, 0, 0, 0);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

/**
 * Checks if a date is a weekend (Saturday or Sunday)
 * @param {string} dateString - Date string in any valid format
 * @returns {boolean} True if the date is a weekend, false otherwise
 */
export const isWeekend = (dateString) => {
  const date = new Date(dateString);
  // Set hours to noon to avoid timezone issues
  date.setHours(12, 0, 0, 0);
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};
