import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ResourceGrid from '../components/resources/ResourceGrid';
import ResourceFilters from '../components/resources/ResourceFilters';
import { useResources } from '../hooks';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Browse() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [bookmarks, setBookmarks] = useState(new Set());

  const initialFilters = {
    search:    searchParams.get('search') || '',
    category:  searchParams.get('category') || '',
    priceType: searchParams.get('priceType') || '',
    sortBy:    'createdAt',
  };

  const { resources, pagination, isLoading, filters, updateFilters, resetFilters } = useResources(initialFilters);

  // Load user bookmarks
  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        const { data } = await api.get('/users/bookmarks');
        setBookmarks(new Set(data.data.bookmarks.map((b) => b._id)));
      } catch {}
    };
    load();
  }, [isAuthenticated]);

  const handleBookmark = async (id) => {
    if (!isAuthenticated) { toast.error('Sign in to bookmark resources'); return; }
    try {
      const { data } = await api.post(`/resources/${id}/bookmark`);
      setBookmarks((prev) => {
        const next = new Set(prev);
        data.data.isBookmarked ? next.add(id) : next.delete(id);
        return next;
      });
      toast.success(data.data.isBookmarked ? '⭐ Bookmarked!' : 'Bookmark removed');
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  return (
    <div className="page-enter">
      <ResourceFilters
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        total={pagination?.totalItems || 0}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <ResourceGrid
          resources={resources}
          isLoading={isLoading}
          isBookmarked={(id) => bookmarks.has(id)}
          onBookmark={handleBookmark}
        />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => updateFilters({ page })}
                style={{
                  width: 36, height: 36, borderRadius: 8, cursor: 'pointer',
                  background: pagination.currentPage === page ? 'linear-gradient(135deg, #0EA5E9, #6366F1)' : 'transparent',
                  border: `1px solid ${pagination.currentPage === page ? 'transparent' : '#334155'}`,
                  color: pagination.currentPage === page ? '#fff' : '#94A3B8',
                  fontSize: 13, fontWeight: 600,
                }}
              >{page}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
