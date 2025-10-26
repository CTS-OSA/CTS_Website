// src/utils/dateFormatter.js

/**
 * Format a date string (ISO 8601 format) into a more user-friendly format.
 * @param {string} isoDate - The ISO 8601 date string to be formatted.
 * @param {string} locale - Optional: Locale for formatting (default is 'en-US').
 * @param {Object} options - Optional: Formatting options for date (default is full format).
 * @returns {string} - The formatted date.
 */
export const formatDate = (isoDate, locale = 'en-US', options = {}) => {
  const date = new Date(isoDate);

  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true, 
  };

  const formatOptions = { ...defaultOptions, ...options };

  return date.toLocaleString(locale, formatOptions);
};

export function calculateAge(birthdate) {
  const today = new Date();
  const birthDate = new Date(birthdate);
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export const clearError = (errors, setErrors, key) => {
  if (errors?.[key]) {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  }
};

export const shortenRegionName = (regionName) => {
  if (!regionName) return "";

  const specialRegions = ["NCR", "CAR", "BARMM", "NIR"];
  const prefix = regionName.split(" - ")[0]; 

  const match = specialRegions.find((abbr) => prefix.startsWith(abbr));
  if (match) return match; 

  const romanPart = prefix.replace("Region", "").trim();
  return romanPart;
};
