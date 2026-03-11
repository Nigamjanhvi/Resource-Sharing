import React from 'react';
import { getCategoryColor, getPriceColor } from '../../utils/helpers';

export default function Badge({ children, type = 'default', color, style = {} }) {
  let colors;

  if (type === 'category') {
    colors = getCategoryColor(children);
  } else if (type === 'price') {
    colors = getPriceColor(children);
  } else if (color) {
    colors = color;
  } else {
    colors = { bg: '#1e293b', text: '#94A3B8', border: '#475569' };
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        padding: '2px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.3px',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
