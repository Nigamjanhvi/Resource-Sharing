import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';

export const useResources = (initialFilters = {}) => {
  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchResources = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { page, limit: 12, ...filters };
      const { data } = await api.get('/resources', { params });
      setResources(data.data.resources);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch resources.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchResources(1); }, [fetchResources]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => setFilters({}), []);

  return { resources, pagination, isLoading, error, filters, updateFilters, resetFilters, refetch: fetchResources };
};

export const useResource = (id) => {
  const [resource, setResource] = useState(null);
  const [related, setRelated] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/resources/${id}`);
        setResource(data.data.resource);
        setRelated(data.data.related);
        setIsBookmarked(data.data.isBookmarked);
      } catch (err) {
        setError(err.response?.data?.message || 'Resource not found.');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [id]);

  const toggleBookmark = useCallback(async () => {
    try {
      const { data } = await api.post(`/resources/${id}/bookmark`);
      setIsBookmarked(data.data.isBookmarked);
    } catch (err) {
      console.error('Bookmark toggle failed:', err);
    }
  }, [id]);

  return { resource, related, isBookmarked, isLoading, error, toggleBookmark };
};

export const useMessages = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);

  const fetchMessages = useCallback(async (page = 1) => {
    if (!conversationId) return;
    setIsLoading(true);
    try {
      const { data } = await api.get(`/messages/${conversationId}`, { params: { page, limit: 30 } });
      if (page === 1) setMessages(data.data.messages);
      else setMessages((prev) => [...data.data.messages, ...prev]);
      setHasMore(data.data.pagination.currentPage < data.data.pagination.totalPages);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => { pageRef.current = 1; fetchMessages(1); }, [fetchMessages]);

  const loadMore = useCallback(() => {
    pageRef.current += 1;
    fetchMessages(pageRef.current);
  }, [fetchMessages]);

  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const sendMessage = useCallback(async (content, recipientId = null, resourceId = null) => {
    try {
      const payload = { content };
      if (conversationId) payload.conversationId = conversationId;
      else { payload.recipientId = recipientId; payload.resourceId = resourceId; }
      const { data } = await api.post('/messages', payload);
      addMessage(data.data.message);
      return { success: true, conversationId: data.data.conversationId };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to send.' };
    }
  }, [conversationId, addMessage]);

  return { messages, isLoading, hasMore, loadMore, addMessage, sendMessage };
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/notifications?limit=20');
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.put('/notifications/mark-read', { ids: 'all' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  }, []);

  return { notifications, unreadCount, isLoading, addNotification, markAllRead, refetch: fetchNotifications };
};

export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
};