import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back! 🎓');
      navigate(from, { replace: true });
    } else {
      toast.error(result.message || 'Login failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0F172A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎓</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>UniShare</span>
          </Link>
          <h1 style={{ color: '#F1F5F9', fontFamily: "'Syne', sans-serif", fontSize: 26, marginTop: 20, marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: '#64748B', fontSize: 14 }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 20, padding: 32 }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ color: '#94A3B8', fontSize: 13, marginBottom: 8, display: 'block' }}>Email Address</label>
              <input
                type="email" name="email" value={form.email} onChange={handle}
                placeholder="you@university.edu"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ color: '#94A3B8', fontSize: 13, marginBottom: 8, display: 'block' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password" value={form.password} onChange={handle}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 16 }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
                border: 'none', borderRadius: 12, padding: '14px',
                color: '#fff', fontWeight: 700, fontSize: 15, cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1, marginTop: 4,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p style={{ color: '#64748B', fontSize: 13, textAlign: 'center', marginTop: 20 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#0EA5E9', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', background: '#0F172A', border: '1px solid #334155',
  borderRadius: 10, padding: '12px 14px', color: '#F1F5F9', fontSize: 14,
  outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif",
};
