import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import { useNotifications } from '../../hooks';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/',        label: 'Home' },
    { path: '/browse',  label: 'Browse' },
    ...(isAuthenticated ? [
      { path: '/post',      label: 'Post Resource' },
      { path: '/messages',  label: 'Messages' },
      { path: '/dashboard', label: 'Dashboard' },
    ] : []),
  ];

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(30,41,59,0.95)' : 'rgba(30,41,59,0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #334155',
      transition: 'background 0.3s ease',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', gap: 32,
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
            borderRadius: 10, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 18,
          }}>🎓</div>
          <span style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20,
            background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>UniShare</span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {navLinks.map(({ path, label }) => (
            <Link
              key={path} to={path}
              style={{
                padding: '6px 14px', borderRadius: 8,
                background: isActive(path) ? 'rgba(14,165,233,0.15)' : 'transparent',
                border: `1px solid ${isActive(path) ? '#0EA5E9' : 'transparent'}`,
                color: isActive(path) ? '#0EA5E9' : '#94A3B8',
                fontSize: 13, fontWeight: isActive(path) ? 600 : 400,
                transition: 'all 0.2s', textDecoration: 'none',
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isAuthenticated ? (
            <>
              {/* Notification bell */}
              <Link to="/dashboard" style={{
                position: 'relative', background: 'transparent',
                border: '1px solid #334155', borderRadius: 10,
                padding: '8px 12px', color: '#94A3B8', fontSize: 18,
                textDecoration: 'none', display: 'flex',
              }}>
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    background: '#EF4444', color: '#fff',
                    fontSize: 9, fontWeight: 700, borderRadius: '50%',
                    width: 16, height: 16, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </Link>

              {/* User menu */}
              <div style={{ position: 'relative' }} ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    width: 38, height: 38,
                    background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
                    borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)',
                    color: '#fff', fontWeight: 700, fontSize: 13,
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {user?.profilePicture
                    ? <img src={user.profilePicture} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    : getInitials(user?.firstName, user?.lastName)
                  }
                </button>

                {menuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: '100%', marginTop: 8,
                    background: '#1E293B', border: '1px solid #334155',
                    borderRadius: 12, padding: 8, minWidth: 180,
                    boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                    animation: 'fadeInUp 0.2s ease',
                  }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid #334155', marginBottom: 4 }}>
                      <div style={{ color: '#F1F5F9', fontWeight: 600, fontSize: 14 }}>
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div style={{ color: '#64748B', fontSize: 12 }}>{user?.university}</div>
                    </div>
                    {[
                      { to: `/profile/${user?._id}`, label: '👤 My Profile' },
                      { to: '/dashboard',            label: '📊 Dashboard' },
                      { to: '/bookmarks',            label: '⭐ Bookmarks' },
                      { to: '/messages',             label: '💬 Messages' },
                    ].map(({ to, label }) => (
                      <Link key={to} to={to}
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: 'block', padding: '8px 12px', color: '#94A3B8',
                          fontSize: 13, borderRadius: 8, textDecoration: 'none',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.target.style.background = '#273344'; e.target.style.color = '#F1F5F9'; }}
                        onMouseLeave={(e) => { e.target.style.background = ''; e.target.style.color = '#94A3B8'; }}
                      >{label}</Link>
                    ))}
                    <div style={{ borderTop: '1px solid #334155', marginTop: 4, paddingTop: 4 }}>
                      <button
                        onClick={() => { logout(); navigate('/'); setMenuOpen(false); }}
                        style={{
                          width: '100%', textAlign: 'left', background: 'transparent',
                          border: 'none', padding: '8px 12px', color: '#EF4444',
                          fontSize: 13, cursor: 'pointer', borderRadius: 8,
                        }}
                      >🚪 Sign Out</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                padding: '8px 16px', borderRadius: 10,
                border: '1px solid #334155', color: '#94A3B8',
                fontSize: 13, fontWeight: 500, textDecoration: 'none',
              }}>Sign In</Link>
              <Link to="/register" style={{
                padding: '8px 16px', borderRadius: 10,
                background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
                color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
