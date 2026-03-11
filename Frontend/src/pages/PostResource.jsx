import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { CATEGORIES, CONDITIONS, PRICE_TYPES } from '../utils/constants';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STEPS = ['Basic Info', 'Details', 'Media', 'Review'];

export default function PostResource() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', category: '', subject: '',
    condition: 'Good', priceType: 'Free', price: '', tags: '',
  });

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const onDrop = useCallback((accepted) => {
    const previews = accepted.map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );
    setImages((prev) => [...prev, ...previews].slice(0, 5));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [], 'application/pdf': [] },
    maxSize: 10 * 1024 * 1024,
  });

  const validateStep = () => {
    if (step === 1 && (!form.title || !form.category)) { toast.error('Title and category are required'); return false; }
    if (step === 2 && !form.description) { toast.error('Description is required'); return false; }
    if (step === 2 && !form.condition) { toast.error('Condition is required'); return false; }
    if (step === 2 && (form.priceType === 'Sale' || form.priceType === 'Rent') && !form.price) { toast.error('Price is required'); return false; }
    return true;
  };

  const submit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((img) => fd.append('images', img));

      const { data } = await api.post('/resources', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Resource posted successfully! 🎉');
      navigate(`/resources/${data.data.resource._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post resource');
    } finally {
      setLoading(false);
    }
  };

  const card = (children) => (
    <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 16, padding: 28 }}>
      {children}
    </div>
  );

  const label = (text) => <label style={{ color: '#94A3B8', fontSize: 13, marginBottom: 8, display: 'block' }}>{text}</label>;
  const inp = { width: '100%', background: '#0F172A', border: '1px solid #334155', borderRadius: 10, padding: '11px 14px', color: '#F1F5F9', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" };

  return (
    <div className="page-enter" style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", color: '#F1F5F9', fontSize: 30, margin: '0 0 6px' }}>Post a Resource</h1>
        <p style={{ color: '#64748B' }}>Help fellow students by sharing what you have</p>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1 }}>
            <div style={{ height: 4, borderRadius: 2, background: i + 1 <= step ? 'linear-gradient(90deg, #0EA5E9, #6366F1)' : '#334155', marginBottom: 6 }} />
            <span style={{ color: i + 1 <= step ? '#0EA5E9' : '#64748B', fontSize: 11 }}>{s}</span>
          </div>
        ))}
      </div>

      {step === 1 && card(
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            {label('Resource Title *')}
            <input name="title" value={form.title} onChange={handle} placeholder="e.g. Engineering Mathematics Vol. II" style={inp} />
          </div>
          <div>
            {label('Category *')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {CATEGORIES.map(({ value, icon }) => (
                <button key={value} onClick={() => set('category', value)} style={{ padding: '12px 8px', background: form.category === value ? 'rgba(14,165,233,0.15)' : 'transparent', border: `1px solid ${form.category === value ? '#0EA5E9' : '#334155'}`, borderRadius: 10, color: form.category === value ? '#0EA5E9' : '#94A3B8', cursor: 'pointer', fontSize: 13, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 22 }}>{icon}</span>
                  <span style={{ fontSize: 11 }}>{value}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            {label('Subject (optional)')}
            <input name="subject" value={form.subject} onChange={handle} placeholder="e.g. Computer Science, Physics" style={inp} />
          </div>
        </div>
      )}

      {step === 2 && card(
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            {label('Description *')}
            <textarea name="description" value={form.description} onChange={handle} placeholder="Describe your resource — edition, condition details, what's included..." rows={4} style={{ ...inp, resize: 'vertical' }} />
          </div>
          <div>
            {label('Condition *')}
            <div style={{ display: 'flex', gap: 8 }}>
              {CONDITIONS.map(({ value, label: cLabel, description }) => (
                <button key={value} onClick={() => set('condition', value)} title={description} style={{ flex: 1, padding: '10px 6px', background: form.condition === value ? 'rgba(14,165,233,0.15)' : 'transparent', border: `1px solid ${form.condition === value ? '#0EA5E9' : '#334155'}`, borderRadius: 10, color: form.condition === value ? '#0EA5E9' : '#94A3B8', cursor: 'pointer', fontSize: 12 }}>{cLabel}</button>
              ))}
            </div>
          </div>
          <div>
            {label('Price Type *')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {PRICE_TYPES.map(({ value, icon, label: pLabel, description }) => (
                <button key={value} onClick={() => set('priceType', value)} style={{ padding: '12px', background: form.priceType === value ? 'rgba(14,165,233,0.15)' : 'transparent', border: `1px solid ${form.priceType === value ? '#0EA5E9' : '#334155'}`, borderRadius: 10, color: form.priceType === value ? '#0EA5E9' : '#94A3B8', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{pLabel}</div>
                  <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{description}</div>
                </button>
              ))}
            </div>
          </div>
          {(form.priceType === 'Sale' || form.priceType === 'Rent') && (
            <div>
              {label(`Price ($) ${form.priceType === 'Rent' ? 'per month' : ''}`)}
              <input type="number" name="price" value={form.price} onChange={handle} placeholder="0.00" min="0" style={inp} />
            </div>
          )}
          <div>
            {label('Tags (comma separated)')}
            <input name="tags" value={form.tags} onChange={handle} placeholder="e.g. calculus, math, stewart" style={inp} />
          </div>
        </div>
      )}

      {step === 3 && card(
        <div>
          {label('Upload Images / PDFs (max 5)')}
          <div {...getRootProps()} style={{ border: `2px dashed ${isDragActive ? '#0EA5E9' : '#334155'}`, borderRadius: 12, padding: 40, textAlign: 'center', cursor: 'pointer', background: isDragActive ? 'rgba(14,165,233,0.05)' : 'transparent', marginBottom: 16 }}>
            <input {...getInputProps()} />
            <div style={{ fontSize: 40, marginBottom: 10 }}>📸</div>
            <p style={{ color: '#94A3B8', fontSize: 14 }}>{isDragActive ? 'Drop files here' : 'Drag & drop or click to upload'}</p>
            <p style={{ color: '#64748B', fontSize: 12, marginTop: 4 }}>PNG, JPG, PDF up to 10MB</p>
          </div>
          {images.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {images.map((img, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={img.preview} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #334155' }} />
                  <button onClick={() => setImages((p) => p.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -6, right: -6, background: '#EF4444', border: 'none', borderRadius: '50%', width: 18, height: 18, color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 4 && card(
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ color: '#F1F5F9', fontFamily: "'Syne', sans-serif", marginBottom: 8 }}>Review Your Listing</h3>
          {[['Title', form.title], ['Category', form.category], ['Condition', form.condition], ['Price', form.priceType === 'Free' ? 'Free' : form.priceType === 'Exchange' ? 'Exchange' : `$${form.price} (${form.priceType})`], ['Subject', form.subject || '—'], ['Tags', form.tags || '—']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155' }}>
              <span style={{ color: '#64748B', fontSize: 14 }}>{k}</span>
              <span style={{ color: '#F1F5F9', fontSize: 14, fontWeight: 500 }}>{v}</span>
            </div>
          ))}
          <div style={{ padding: '10px 0' }}>
            <span style={{ color: '#64748B', fontSize: 14 }}>Images</span>
            <span style={{ color: '#F1F5F9', fontSize: 14, fontWeight: 500, float: 'right' }}>{images.length} uploaded</span>
          </div>
          <div style={{ background: '#0F172A', borderRadius: 12, padding: 14, marginTop: 8 }}>
            <p style={{ color: '#94A3B8', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{form.description}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        {step > 1 && (
          <button onClick={() => setStep((s) => s - 1)} style={{ flex: 1, background: 'transparent', border: '1px solid #334155', borderRadius: 12, padding: '13px', color: '#94A3B8', cursor: 'pointer', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>← Back</button>
        )}
        <button
          onClick={() => { if (step < 4) { if (validateStep()) setStep((s) => s + 1); } else submit(); }}
          disabled={loading}
          style={{ flex: 2, background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', border: 'none', borderRadius: 12, padding: '13px', color: '#fff', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15, fontFamily: "'DM Sans', sans-serif", opacity: loading ? 0.7 : 1 }}
        >
          {step < 4 ? 'Continue →' : loading ? 'Posting...' : 'Post Resource 🚀'}
        </button>
      </div>
    </div>
  );
}
