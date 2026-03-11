// ─── utils/constants.js ───────────────────────────────────────────────────────

export const CATEGORIES = [
  { value: 'Books',       label: 'Books',       icon: '📚' },
  { value: 'Notes',       label: 'Notes',       icon: '📝' },
  { value: 'Electronics', label: 'Electronics', icon: '💻' },
  { value: 'Lab Tools',   label: 'Lab Tools',   icon: '🔬' },
  { value: 'Stationery',  label: 'Stationery',  icon: '✏️' },
  { value: 'Software',    label: 'Software',    icon: '💿' },
  { value: 'Other',       label: 'Other',       icon: '📦' },
];

export const CONDITIONS = [
  { value: 'New',  label: 'New',  description: 'Unused, in original condition' },
  { value: 'Good', label: 'Good', description: 'Lightly used, no damage' },
  { value: 'Used', label: 'Used', description: 'Visible wear but fully functional' },
  { value: 'Worn', label: 'Worn', description: 'Heavy use, may have damage' },
];

export const PRICE_TYPES = [
  { value: 'Free',     label: 'Free',     icon: '🆓', description: 'Give it away at no cost' },
  { value: 'Exchange', label: 'Exchange', icon: '🔄', description: 'Swap with another resource' },
  { value: 'Rent',     label: 'Rent',     icon: '⏰', description: 'Lend for a period of time' },
  { value: 'Sale',     label: 'Sale',     icon: '💰', description: 'Sell at a fixed price' },
];

export const REQUEST_TYPES = [
  { value: 'Borrow',   label: 'Borrow' },
  { value: 'Exchange', label: 'Exchange' },
  { value: 'Buy',      label: 'Buy' },
  { value: 'Rent',     label: 'Rent' },
];

export const REQUEST_STATUSES = {
  Pending:   { label: 'Pending',   color: '#F59E0B', bg: '#451a03' },
  Accepted:  { label: 'Accepted',  color: '#10B981', bg: '#052e16' },
  Rejected:  { label: 'Rejected',  color: '#EF4444', bg: '#450a0a' },
  Completed: { label: 'Completed', color: '#6366F1', bg: '#2e1065' },
  Cancelled: { label: 'Cancelled', color: '#94A3B8', bg: '#1e293b' },
};

export const REVIEW_TAGS = [
  'Reliable', 'Responsive', 'Honest', 'Good Condition', 'As Described', 'Friendly',
];

export const SORT_OPTIONS = [
  { value: 'createdAt',     label: 'Newest First' },
  { value: 'views',         label: 'Most Viewed' },
  { value: 'bookmarkCount', label: 'Most Saved' },
  { value: 'price',         label: 'Price: Low to High' },
];

export const UNIVERSITIES = [
  'MIT', 'Stanford University', 'Harvard University', 'UC Berkeley',
  'Caltech', 'Carnegie Mellon', 'Princeton University', 'Yale University',
  'Columbia University', 'University of Michigan', 'Other',
];

export const YEARS = [
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' },
  { value: 5, label: '5th Year' },
  { value: 6, label: 'Graduate' },
];

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
