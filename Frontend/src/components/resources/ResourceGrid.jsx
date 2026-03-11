import React from 'react';
import ResourceCard from './ResourceCard';
import Spinner from '../common/Spinner';

export default function ResourceGrid({ resources, isLoading, isBookmarked, onBookmark }) {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <Spinner size={48} />
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
        <h3 style={{ color: '#F1F5F9', fontFamily: "'Syne', sans-serif", marginBottom: 8 }}>No resources found</h3>
        <p style={{ color: '#64748B' }}>Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 20,
    }}>
      {resources.map((resource) => (
        <ResourceCard
          key={resource._id}
          resource={resource}
          isBookmarked={isBookmarked?.(resource._id)}
          onBookmark={onBookmark}
        />
      ))}
    </div>
  );
}
