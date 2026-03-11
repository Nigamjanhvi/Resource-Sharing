import React from 'react';
import Spinner from './Spinner';

const variants = {
  primary: {
    background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
    color: '#fff',
    border: 'none',
  },
  secondary: {
    background: 'transparent',
    color: '#F1F5F9',
    border: '1px solid #334155',
  },
  danger: {
    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
    color: '#fff',
    border: 'none',
  },
  success: {
    background: 'linear-gradient(135deg, #10B981, #059669)',
    color: '#fff',
    border: 'none',
  },
  ghost: {
    background: 'transparent',
    color: '#94A3B8',
    border: 'none',
  },
};

const sizes = {
  sm: { padding: '6px 14px', fontSize: '13px', borderRadius: '8px' },
  md: { padding: '10px 20px', fontSize: '14px', borderRadius: '10px' },
  lg: { padding: '14px 28px', fontSize: '15px', borderRadius: '12px' },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  style = {},
}) {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...v,
        ...s,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: 'all 0.2s ease',
        fontFamily: "'DM Sans', sans-serif",
        ...style,
      }}
    >
      {loading && <Spinner size={16} color="#fff" />}
      {children}
    </button>
  );
}
