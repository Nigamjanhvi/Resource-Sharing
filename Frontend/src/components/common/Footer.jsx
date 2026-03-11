import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: '#1E293B',
      borderTop: '1px solid #334155',
      padding: '48px 24px 24px',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎓</div>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>UniShare</span>
            </div>
            <p style={{ color: '#64748B', fontSize: 13, lineHeight: 1.7 }}>
              Connect with students at your university to share, exchange, rent, or donate academic resources.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ color: '#F1F5F9', fontFamily: "'Syne', sans-serif", fontSize: 14, marginBottom: 14 }}>Platform</h4>
            {[['Browse Resources', '/browse'], ['Post a Resource', '/post'], ['Dashboard', '/dashboard'], ['Messages', '/messages']].map(([label, to]) => (
              <Link key={to} to={to} style={{ display: 'block', color: '#64748B', fontSize: 13, marginBottom: 8, textDecoration: 'none' }}
                onMouseEnter={(e) => e.target.style.color = '#94A3B8'}
                onMouseLeave={(e) => e.target.style.color = '#64748B'}
              >{label}</Link>
            ))}
          </div>

          <div>
            <h4 style={{ color: '#F1F5F9', fontFamily: "'Syne', sans-serif", fontSize: 14, marginBottom: 14 }}>Categories</h4>
            {['Books', 'Notes', 'Electronics', 'Lab Tools', 'Software'].map((cat) => (
              <Link key={cat} to={`/browse?category=${cat}`} style={{ display: 'block', color: '#64748B', fontSize: 13, marginBottom: 8, textDecoration: 'none' }}
                onMouseEnter={(e) => e.target.style.color = '#94A3B8'}
                onMouseLeave={(e) => e.target.style.color = '#64748B'}
              >{cat}</Link>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #334155', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: '#64748B', fontSize: 12 }}>© {new Date().getFullYear()} UniShare. Built for students, by students.</p>
          <p style={{ color: '#64748B', fontSize: 12 }}>MERN Stack · MongoDB · Express · React · Node.js</p>
        </div>
      </div>
    </footer>
  );
}
