/**
 * DataFlow Standardized Data Formatters
 */

/**
 * Format a number as Indian Rupee (INR) currency
 * @param {number|string} value
 * @param {boolean} compact - if true, outputs ₹12.5k instead of ₹12,500
 */
export const formatCurrency = (value, compact = false) => {
  const num = Number(value);
  if (isNaN(num)) return '₹0';

  if (compact) {
    if (Math.abs(num) >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)}Cr`;
    }
    if (Math.abs(num) >= 100000) {
      return `₹${(num / 100000).toFixed(1)}L`;
    }
    if (Math.abs(num) >= 1000) {
      return `₹${(num / 1000).toFixed(1)}k`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

/**
 * Format standard integer / decimal with en-IN comma separation
 * @param {number|string} value
 */
export const formatNumber = (value) => {
  const num = Number(value);
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
};

/**
 * Format date string (YYYY-MM-DD) into readable label (e.g. "Jan 04, 2024" or "Jan 04")
 * @param {string} dateStr
 * @param {boolean} includeYear
 */
export const formatDate = (dateStr, includeYear = true) => {
  if (!dateStr) return '-';
  try {
    const parts = String(dateStr).slice(0, 10).split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parts[2];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = months[monthIdx] || parts[1];
      return includeYear ? `${monthName} ${day}, ${year}` : `${monthName} ${day}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
};

/**
 * Format percentage
 * @param {number} value
 * @param {number} decimals
 */
export const formatPercentage = (value, decimals = 1) => {
  const num = Number(value);
  if (isNaN(num)) return '0%';
  return `${num.toFixed(decimals)}%`;
};
