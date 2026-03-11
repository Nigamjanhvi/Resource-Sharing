import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { REQUEST_STATUSES } from '../utils/constants';
import { timeAgo, getInitials } from '../utils/helpers';
import Spinner from '../components/common/Spinner';
import api from '../utils/api';
import toast from 'react-hot-toast';

const StatCard = ({ icon, label, value, color = '#0EA5E9' }) => (
  <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 14, padding: 20 }}>
    <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color }}>{value}</div>
    <div style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>{label}</div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resources');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/users/dashboard');
        setData(res.data.data);
      } catch { toast.error('Failed to load dashboard'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleRequestAction = async (requestId, status) => {
    try {
      await api.put(`/requests/${requestId}`, { status });
      toast.success(`Request ${status.toLowerCase()}`);
      const res = await api.get('/users/dashboard');
      setData(res.data.data);
    } catch { toast.error('Action failed'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={48} /></div>;

  const { stats = {}, myResources = [], sentRequests = [], receivedRequests = [] } = data || {};

  const tabs = [
    { key: 'resources', label: `My Resources (${myResources.length})` },
    { key: 'received',  label: `Incoming Requests (${receivedRequests.length})` },
    { key: 'sent',      label: `Sent Requests (${sentRequests.length})` },
  ];

  const ICON_MAP = { Books: '📚', Notes: '📝', Electronics: '💻', 'Lab Tools': '🔬', Other: '📦' };

  return (
    <div className="page-enter" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", color: '#F1F5F9', fontSize: 28, margin: '0 0 4px' }}>
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p style={{ color: '#64748B' }}>Manage your resources and requests</p>
        </div>
        <Link to="/post" style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', border: 'none', borderRadius: 12, padding: '11px 20px', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>+ Post Resource</Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon="📦" label="Total Resources" value={stats.totalResources || 0} />
        <StatCard icon="✅" label="Active Listings" value={stats.activeResources || 0} color="#10B981" />
        <StatCard icon="📩" label="Pending Requests" value={stats.pendingRequests || 0} color="#F59E0B" />
        <StatCard icon="🤝" label="Completed Exchanges" value={stats.completedExchanges || 0} color="#6366F1" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #334155', paddingBottom: 0 }}>
        {tabs.map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{ padding: '10px 18px', background: 'transparent', border: 'none', borderBottom: `2px solid ${activeTab === key ? '#0EA5E9' : 'transparent'}`, color: activeTab === key ? '#0EA5E9' : '#64748B', cursor: 'pointer', fontSize: 14, fontWeight: activeTab === key ? 600 : 400, fontFamily: "'DM Sans', sans-serif", marginBottom: -1 }}>{label}</button>
        ))}
      </div>

      {/* My Resources */}
      {activeTab === 'resources' && (
        myResources.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>📦</div>
            <h3 style={{ color: '#F1F5F9', fontFamily: "'Syne', sans-serif", marginBottom: 8 }}>No resources yet</h3>
            <p style={{ color: '#64748B', marginBottom: 20 }}>Start sharing your academic resources</p>
            <Link to="/post" style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', borderRadius: 12, padding: '11px 24px', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Post First Resource</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {myResources.map((r) => (
              <div key={r._id} style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  {r.images?.[0]?.url ? <img src={r.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} /> : ICON_MAP[r.category]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link to={`/resources/${r._id}`} style={{ color: '#F1F5F9', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>{r.title}</Link>
                  <div style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>{r.category} · {r.priceType} · {timeAgo(r.createdAt)}</div>
                </div>
                <span style={{ color: r.status === 'Available' ? '#10B981' : '#F59E0B', fontSize: 12, fontWeight: 600 }}>● {r.status}</span>
              </div>
            ))}
          </div>
        )
      )}

      {/* Received Requests */}
      {activeTab === 'received' && (
        receivedRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>📩</div>
            <p>No incoming requests yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {receivedRequests.map((req) => {
              const st = REQUEST_STATUSES[req.status];
              return (
                <div key={req._id} style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>
                        {getInitials(req.requester?.firstName, req.requester?.lastName)}
                      </div>
                      <div>
                        <span style={{ color: '#F1F5F9', fontWeight: 600, fontSize: 14 }}>{req.requester?.firstName} {req.requester?.lastName}</span>
                        <span style={{ color: '#64748B', fontSize: 13 }}> wants to {req.requestType?.toLowerCase()} </span>
                        <Link to={`/resources/${req.resource?._id}`} style={{ color: '#0EA5E9', fontSize: 13 }}>{req.resource?.title}</Link>
                      </div>
                    </div>
                    <span style={{ background: st?.bg, color: st?.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{req.status}</span>
                  </div>
                  {req.message && <p style={{ color: '#94A3B8', fontSize: 13, marginBottom: 12 }}>"{req.message}"</p>}
                  {req.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleRequestAction(req._id, 'Accepted')} style={{ flex: 1, background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', borderRadius: 10, padding: '9px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>✓ Accept</button>
                      <button onClick={() => handleRequestAction(req._id, 'Rejected')} style={{ flex: 1, background: 'transparent', border: '1px solid #EF4444', borderRadius: 10, padding: '9px', color: '#EF4444', cursor: 'pointer', fontSize: 13 }}>✕ Decline</button>
                    </div>
                  )}
                  {req.status === 'Accepted' && (
                    <button onClick={() => handleRequestAction(req._id, 'Completed')} style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', border: 'none', borderRadius: 10, padding: '9px 20px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>🤝 Mark Completed</button>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Sent Requests */}
      {activeTab === 'sent' && (
        sentRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>📤</div>
            <p>No sent requests yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sentRequests.map((req) => {
              const st = REQUEST_STATUSES[req.status];
              return (
                <div key={req._id} style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Link to={`/resources/${req.resource?._id}`} style={{ color: '#F1F5F9', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>{req.resource?.title}</Link>
                    <div style={{ color: '#64748B', fontSize: 12, marginTop: 3 }}>{req.requestType} · {timeAgo(req.createdAt)}</div>
                  </div>
                  <span style={{ background: st?.bg, color: st?.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{req.status}</span>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
