import React from 'react';

export default function Spinner({ size = 24, color = '#0EA5E9' }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `3px solid ${color}33`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  );
}
