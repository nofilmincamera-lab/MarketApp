/**
 * Safe date utilities to prevent "Invalid time value" errors
 */

/**
 * Safely formats a date string with fallback
 * @param {string} dateString - ISO date string or null/undefined
 * @param {string} formatString - Simple format string
 * @param {string} fallback - fallback text if date is invalid
 * @returns {string} formatted date or fallback
 */
export const safeFormatDate = (dateString, formatString = 'MMM d, yyyy', fallback = 'Date not available') => {
  if (!dateString) return fallback;
  if (typeof dateString !== 'string') return fallback;
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return fallback;
    }
    
    // Format using Intl
    if (formatString === 'MMM d, yyyy') {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    } else if (formatString === 'MMM d, h:mm a') {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(date);
    } else if (formatString === 'MMMM yyyy') {
      return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric'
      }).format(date);
    } else if (formatString === 'MMM yyyy') {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        year: 'numeric'
      }).format(date);
    } else if (formatString === 'MMM d, yyyy h:mm a') {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(date);
    } else if (formatString === "MMM d, yyyy 'at' h:mm a") {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(date);
    } else {
      return date.toLocaleDateString('en-US');
    }
  } catch (e) {
    console.error('Date formatting error:', e, dateString);
    return fallback;
  }
};

/**
 * Safely parses and validates a date string
 * @param {string} dateString - ISO date string
 * @returns {Date|null} parsed date or null if invalid
 */
export const safeParseDateISO = (dateString) => {
  if (!dateString) return null;
  if (typeof dateString !== 'string') return null;
  
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch (e) {
    console.error('Date parsing error:', e, dateString);
    return null;
  }
};

/**
 * Check if date is valid
 * @param {string} dateString - Date string to validate
 * @returns {boolean} true if valid
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch (e) {
    return false;
  }
};