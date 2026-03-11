import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 520 }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        zIndex: 1000, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '20px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1E293B',
          border: '1px solid #334155',
          borderRadius: '20px',
          maxWidth, width: '100%',
          maxHeight: '90vh', overflow: 'auto',
          animation: 'fadeInUp 0.25s ease',
        }}
      >
        {title && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '20px 24px', borderBottom: '1px solid #334155',
          }}>
            <h3 style={{ color: '#F1F5F9', fontFamily: "'Syne', sans-serif", fontSize: '17px', margin: 0 }}>
              {title}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'transparent', border: 'none', color: '#64748B',
                fontSize: '22px', cursor: 'pointer', lineHeight: 1, padding: '2px 6px',
              }}
            >
              ×
            </button>
          </div>
        )}
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
