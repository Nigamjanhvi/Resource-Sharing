import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useResource } from '../hooks';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';
import { TrustScore } from '../components/profile/index';
import { timeAgo, getInitials, formatPrice } from '../utils/helpers';
import { REQUEST_TYPES } from '../utils/constants';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ResourceDetail() {
  const { id } = useParams();
  const { resource, related, isBookmarked, isLoading, error, toggleBookmark } = useResource(id);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showRequest, setShowRequest] = useState(false);
  const [requestData, setRequestData] = useState({ requestType: 'Borrow', message: '', exchangeOffer: '' });
  const [submitting, setSubmitting] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const isOwner = user?._id === resource?.postedBy?._id;

  const handleRequest = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      await api.post('/requests', { resourceId: id, ...requestData });
      toast.success('Request sent successfully! 🎉');
      setShowRequest(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChat = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      const { data } = await api.post('/messages', {
        recipientId: resource.postedBy._id,
        resourceId: id,
        content: `Hi! I'm interested in your resource: "${resource.title}"`,
      });
      navigate(`/messages/${data.data.conversationId}`);
    } catch {
      toast.error('Failed to start chat');
    }
  };

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={48} /></div>;
  if (error) return <div style={{ textAlign: 'center', padding: 80, color: '#94A3B8' }}>{error}</div>;
  if (!resource) return null;

  const owner = resource.postedBy;
  const hasImages = resource.images?.length > 0;
  const ICON_MAP = { Books: '📚', Notes: '📝', Electronics: '💻', 'Lab Tools': '🔬', Stationery: '✏️', Software: '💿', Other: '📦' };

  return (
    <div className="page-enter" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
        {/* Left column */}
        <div>
          {/* Image gallery */}
          <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ height: 360, background: `linear-gradient(135deg, #0EA5E955, #6366F133)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {hasImages ? (
                <img src={resource.images[activeImage].url} alt={resource.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 80 }}>{ICON_MAP[resource.category] || '📦'}</span>
              )}
              <button
                onClick={toggleBookmark}
                style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(15,23,42,0.8)', border: '1px solid #334155', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', color: isBookmarked ? '#F59E0B' : '#64748B', fontSize: 20 }}
              >{isBookmarked ? '★' : '☆'}</button>
            </div>
            {hasImages && resource.images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, padding: 12, overflowX: 'auto' }}>
                {resource.images.map((img, i) => (
                  <img key={i} src={img.url} alt="" onClick={() => setActiveImage(i)}
                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: `2px solid ${activeImage === i ? '#0EA5E9' : 'transparent'}`, flexShrink: 0 }} />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              <Badge type="category">{resource.category}</Badge>
              <Badge type="price">{resource.priceType}</Badge>
              <Badge>{resource.condition}</Badge>
            </div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", color: '#F1F5F9', fontSize: 26, margin: '0 0 14px' }}>{resource.title}</h1>
            {resource.subject && <p style={{ color: '#64748B', fontSize: 14, marginBottom: 14 }}>📖 {resource.subject}</p>}
            <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>{resource.description}</p>
            {resource.tags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {resource.tags.map((tag) => (
                  <Link key={tag} to={`/browse?search=${tag}`} style={{ background: '#0EA5E911', color: '#0EA5E9', border: '1px solid #0EA5E933', padding: '3px 10px', borderRadius: 20, fontSize: 12, textDecoration: 'none' }}>#{tag}</Link>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 20, color: '#64748B', fontSize: 13 }}>
            <span>👁 {resource.views} views</span>
            <span>★ {resource.bookmarkCount} saves</span>
            <span>🕒 {timeAgo(resource.createdAt)}</span>
          </div>
        </div>

        {/* Right column */}
        <div style={{ position: 'sticky', top: 80 }}>
          {/* Price & CTA */}
          <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: '#94A3B8', fontSize: 13, marginBottom: 4 }}>Price</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800 }}>
                {resource.priceType === 'Free' && <span style={{ color: '#4ADE80' }}>FREE</span>}
                {resource.priceType === 'Exchange' && <span style={{ color: '#C084FC' }}>Exchange</span>}
                {resource.priceType === 'Rent' && <span style={{ color: '#FCD34D' }}>${resource.price}<span style={{ fontSize: 16, color: '#94A3B8' }}>/mo</span></span>}
                {resource.priceType === 'Sale' && <span style={{ color: '#60A5FA' }}>${resource.price}</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <span style={{ color: '#64748B', fontSize: 13 }}>📍 {resource.university}</span>
                <span style={{ color: resource.status === 'Available' ? '#10B981' : '#F59E0B', fontSize: 13, fontWeight: 600 }}>● {resource.status}</span>
              </div>
            </div>

            {!isOwner && resource.status === 'Available' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={() => { if (!isAuthenticated) { navigate('/login'); return; } setShowRequest(true); }} style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', border: 'none', borderRadius: 12, padding: '13px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}>
                  Send Request
                </button>
                <button onClick={handleChat} style={{ background: 'transparent', border: '1px solid #334155', borderRadius: 12, padding: '12px', color: '#F1F5F9', cursor: 'pointer', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
                  💬 Message Seller
                </button>
              </div>
            )}

            {isOwner && (
              <div style={{ display: 'flex', gap: 10 }}>
                <Link to={`/post?edit=${resource._id}`} style={{ flex: 1, textAlign: 'center', background: 'transparent', border: '1px solid #334155', borderRadius: 12, padding: '12px', color: '#94A3B8', fontSize: 14, textDecoration: 'none' }}>✏️ Edit</Link>
              </div>
            )}
          </div>

          {/* Owner card */}
          <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 16, padding: 20 }}>
            <h4 style={{ color: '#94A3B8', fontSize: 12, fontWeight: 600, letterSpacing: 1, marginBottom: 14 }}>POSTED BY</h4>
            <Link to={`/profile/${owner._id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, overflow: 'hidden' }}>
                {owner.profilePicture ? <img src={owner.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(owner.firstName, owner.lastName)}
              </div>
              <div>
                <div style={{ color: '#F1F5F9', fontWeight: 600, fontSize: 15 }}>{owner.firstName} {owner.lastName}</div>
                <div style={{ color: '#64748B', fontSize: 12 }}>🏫 {owner.university}</div>
              </div>
            </Link>
            <TrustScore score={owner.trustScore} total={owner.totalRatings} />
          </div>
        </div>
      </div>

      {/* Related */}
      {related?.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", color: '#F1F5F9', fontSize: 22, marginBottom: 20 }}>Similar Resources</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {related.map((r) => (
              <Link key={r._id} to={`/resources/${r._id}`} style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: 14, textDecoration: 'none', display: 'block' }}>
                <div style={{ color: '#F1F5F9', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{r.title}</div>
                <div style={{ color: '#64748B', fontSize: 12 }}>{formatPrice(r.priceType, r.price)}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Request Modal */}
      <Modal isOpen={showRequest} onClose={() => setShowRequest(false)} title="Send Request">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ color: '#94A3B8', fontSize: 13, marginBottom: 8, display: 'block' }}>Request Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {REQUEST_TYPES.map(({ value, label }) => (
                <button key={value} onClick={() => setRequestData((p) => ({ ...p, requestType: value }))} style={{ padding: '10px', background: requestData.requestType === value ? 'rgba(14,165,233,0.15)' : 'transparent', border: `1px solid ${requestData.requestType === value ? '#0EA5E9' : '#334155'}`, borderRadius: 10, color: requestData.requestType === value ? '#0EA5E9' : '#94A3B8', cursor: 'pointer', fontSize: 13 }}>{label}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ color: '#94A3B8', fontSize: 13, marginBottom: 8, display: 'block' }}>Message (optional)</label>
            <textarea value={requestData.message} onChange={(e) => setRequestData((p) => ({ ...p, message: e.target.value }))} placeholder="Introduce yourself and explain your request..." rows={3} style={{ width: '100%', background: '#0F172A', border: '1px solid #334155', borderRadius: 10, padding: '10px 14px', color: '#F1F5F9', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }} />
          </div>
          {requestData.requestType === 'Exchange' && (
            <div>
              <label style={{ color: '#94A3B8', fontSize: 13, marginBottom: 8, display: 'block' }}>What are you offering in exchange?</label>
              <input value={requestData.exchangeOffer} onChange={(e) => setRequestData((p) => ({ ...p, exchangeOffer: e.target.value }))} placeholder="e.g. Physics textbook, lab kit..." style={{ width: '100%', background: '#0F172A', border: '1px solid #334155', borderRadius: 10, padding: '10px 14px', color: '#F1F5F9', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" }} />
            </div>
          )}
          <button onClick={handleRequest} disabled={submitting} style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', border: 'none', borderRadius: 12, padding: '13px', color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}>
            {submitting ? 'Sending...' : 'Send Request 🚀'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
