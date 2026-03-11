// ─── utils/helpers.js ─────────────────────────────────────────────────────────

import { formatDistanceToNow, format } from 'date-fns';

/**
 * Format a date as relative time (e.g. "2 days ago")
 */
export const timeAgo = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Format a date as readable string (e.g. "Jan 15, 2024")
 */
export const formatDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM d, yyyy');
};

/**
 * Display price based on price type
 */
export const formatPrice = (priceType, price) => {
  switch (priceType) {
    case 'Free':     return 'Free';
    case 'Exchange': return 'Exchange';
    case 'Rent':     return `$${price}/mo`;
    case 'Sale':     return `$${price}`;
    default:         return priceType;
  }
};

/**
 * Truncate long text
 */
export const truncate = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

/**
 * Get initials from a name (e.g. "Alex Chen" → "AC")
 */
export const getInitials = (firstName = '', lastName = '') => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

/**
 * Build Cloudinary thumbnail URL with transformations
 */
export const getImageUrl = (url, width = 400, height = 300) => {
  if (!url) return null;
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_auto/`);
  }
  return url;
};

/**
 * Validate university email (basic check for .edu domains)
 */
export const isUniversityEmail = (email) => {
  return email?.endsWith('.edu') || email?.includes('ac.') || email?.includes('university');
};

/**
 * Get color for a category badge
 */
export const getCategoryColor = (category) => {
  const map = {
    Books:       { bg: '#172554', text: '#60A5FA', border: '#1D4ED8' },
    Notes:       { bg: '#052e16', text: '#4ADE80', border: '#15803D' },
    Electronics: { bg: '#451a03', text: '#FCD34D', border: '#B45309' },
    'Lab Tools': { bg: '#2e1065', text: '#C084FC', border: '#7E22CE' },
    Stationery:  { bg: '#1e293b', text: '#94A3B8', border: '#475569' },
    Software:    { bg: '#450a0a', text: '#FCA5A5', border: '#B91C1C' },
    Other:       { bg: '#1e293b', text: '#94A3B8', border: '#475569' },
  };
  return map[category] || map.Other;
};

/**
 * Get color for price type badge
 */
export const getPriceColor = (priceType) => {
  const map = {
    Free:     { bg: '#052e16', text: '#4ADE80', border: '#15803D' },
    Exchange: { bg: '#2e1065', text: '#C084FC', border: '#7E22CE' },
    Rent:     { bg: '#451a03', text: '#FCD34D', border: '#B45309' },
    Sale:     { bg: '#172554', text: '#60A5FA', border: '#1D4ED8' },
  };
  return map[priceType] || map.Free;
};

/**
 * Debounce a function call
 */
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
