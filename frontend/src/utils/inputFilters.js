/**
 * Filters a string to only include alphabet characters, spaces, and specific punctuation
 * used in names (hyphens, apostrophes).
 * @param {string} value - The input string.
 * @returns {string} - The filtered string.
 */
export const filterAlphabetsOnly = (value) => {
  // Allows letters (a-z, A-Z), spaces, hyphens (-), and single quotes (')
  return value.replace(/[^a-zA-Z\s-']/g, "");
};

/**
 * Filters a string to only include numerical digits (0-9).
 * @param {string} value - The input string.
 * @returns {string} - The filtered string.
 */
export const filterNumbersOnly = (value) => {
  // Allows only digits
  return value.replace(/[^0-9]/g, "");
};

/**
 * Filters a string to include general text characters (letters, numbers, spaces, common punctuation).
 * Use this for addresses, job/occupation, school, and company names.
 * @param {string} value - The input string.
 * @returns {string} - The filtered string.
 */
export const filterGeneralText = (value) => {
  return value.replace(/[^a-zA-Z0-9\s.,\-/'"?()&:;!#%*]/g, "");
};

export const filterDecimalNumbers = value => {
  const filtered = value.replace(/[^\d.]/g, "");
  const parts = filtered.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  return filtered;
}