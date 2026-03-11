import React, { useState, useEffect } from 'react';
import ResourceGrid from '../components/resources/ResourceGrid';
import Spinner from '../components/common/Spinner';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/users/bookmarks');
        setBookmarks(data.data.bookmarks);
        setBookmarkedIds(new Set(data.data.bookmarks.map((b) => b._id)));
      } catch { toast.error('Failed to load bookmarks'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleBookmark = async (id) => {
    try {
      await api.post(`/resources/${id}/bookmark`);
      setBookmarks((prev) => prev.filter((b) => b._id !== id));
      setBookmarkedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      toast.success('Bookmark removed');
    } catch { toast.error('Failed to remove bookmark'); }
  };

  return (
    <div className="page-enter" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", color: '#F1F5F9', fontSize: 28, margin: '0 0 6px' }}>⭐ Saved Resources</h1>
        <p style={{ color: '#64748B' }}>{bookmarks.length} bookmarked resources</p>
      </div>
      {loading
        ? <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={48} /></div>
        : <ResourceGrid resources={bookmarks} isLoading={false} isBookmarked={(id) => bookmarkedIds.has(id)} onBookmark={handleBookmark} />
      }
    </div>
  );
}