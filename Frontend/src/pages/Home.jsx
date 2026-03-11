import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ResourceGrid from '../components/resources/ResourceGrid';
import { CATEGORIES } from '../utils/constants';
import api from '../utils/api';

const STATS = [
  { icon: '📚', number: '2,400+', label: 'Resources' },
  { icon: '🏫', number: '150+',   label: 'Universities' },
  { icon: '👥', number: '8,500+', label: 'Students' },
  { icon: '✅', number: '4,200+', label: 'Exchanges' },
];

export default function Home() {
  const [search, setSearch] = useState('');
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/resources?limit=6&sortBy=views&sortOrder=desc');
        setFeatured(data.data.resources);
      } catch {
        setFeatured([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/browse?search=${encodeURIComponent(search)}`);
    else navigate('/browse');
  };

  return (
    <div className="page-enter">
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(99,102,241,0.08) 100%)',
        borderBottom: '1px solid #334155', padding: '72px 24px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: 20, padding: '6px 16px', marginBottom: 24 }}>
            <span style={{ color: '#0EA5E9', fontSize: 12, fontWeight: 600 }}>🎓 For Students, By Students</span>
          </div>

          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 52, fontWeight: 800, margin: '0 0 16px', color: '#F1F5F9', lineHeight: 1.15 }}>
            Share Academic Resources<br />
            <span style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Within Your University
            </span>
          </h1>

          <p style={{ color: '#94A3B8', fontSize: 18, maxWidth: 600, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Exchange books, share notes, rent lab equipment and more with students at your campus.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, maxWidth: 560, margin: '0 auto 48px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#64748B' }}>🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search books, notes, equipment..."
                style={{
                  width: '100%', background: '#1E293B', border: '1px solid #334155',
                  borderRadius: 14, padding: '14px 16px 14px 48px',
                  color: '#F1F5F9', fontSize: 15, outline: 'none', boxSizing: 'border-box',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>
            <button type="submit" style={{
              background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
              border: 'none', borderRadius: 14, padding: '14px 28px',
              color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 15,
              fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
            }}>Search</button>
          </form>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
            {STATS.map(({ icon, number, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{number}</div>
                <div style={{ color: '#64748B', fontSize: 13 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '56px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", color: '#F1F5F9', fontSize: 28, marginBottom: 8 }}>Browse by Category</h2>
          <p style={{ color: '#64748B', marginBottom: 28 }}>Find exactly what you need</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
            {CATEGORIES.map(({ value, label, icon }) => (
              <Link
                key={value} to={`/browse?category=${value}`}
                style={{
                  background: '#1E293B', border: '1px solid #334155', borderRadius: 14,
                  padding: '20px 16px', textAlign: 'center', textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0EA5E9'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
                <div style={{ color: '#F1F5F9', fontWeight: 600, fontSize: 14 }}>{label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured resources */}
      <section style={{ padding: '0 24px 64px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", color: '#F1F5F9', fontSize: 28, margin: '0 0 4px' }}>Trending Resources</h2>
              <p style={{ color: '#64748B', margin: 0 }}>Most viewed this week</p>
            </div>
            <Link to="/browse" style={{ color: '#0EA5E9', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
          </div>
          <ResourceGrid resources={featured} isLoading={loading} />
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '64px 24px', background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(99,102,241,0.08))', borderTop: '1px solid #334155' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", color: '#F1F5F9', fontSize: 32, marginBottom: 14 }}>
            Have something to share?
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 16, marginBottom: 28 }}>
            Post your resources and help fellow students while decluttering your space.
          </p>
          <Link to="/post" style={{
            display: 'inline-block', background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
            borderRadius: 14, padding: '14px 36px', color: '#fff', fontWeight: 700,
            fontSize: 16, textDecoration: 'none',
          }}>Post a Resource 🚀</Link>
        </div>
      </section>
    </div>
  );
}
