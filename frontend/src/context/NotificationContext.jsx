import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notification.service';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch unread notification count safely
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const response = await notificationService.getUnreadCount();
      if (response && response.data && typeof response.data.count === 'number') {
        setUnreadCount(response.data.count);
      }
    } catch (err) {
      // Failure isolation: log silently without crashing UI
      console.warn('Unable to fetch unread notification count:', err.message);
    }
  }, [isAuthenticated]);

  // Fetch recent notifications for dropdown panel
  const fetchRecentNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setRecentNotifications([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await notificationService.getNotifications({ page: 1, limit: 5 });
      if (response && Array.isArray(response.data)) {
        setRecentNotifications(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Mark notification as read (Updates local state & decrements count)
  const markAsRead = async (id) => {
    if (!id) return;
    
    // Find target in current local state
    const target = recentNotifications.find((n) => n.id === id);
    const isUnread = target ? (!target.readAt && target.status !== 'READ') : true;

    try {
      await notificationService.markAsRead(id);
      
      // Update local state idempotently
      setRecentNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString(), status: 'READ' } : n))
      );

      if (isUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.warn('Failed to mark notification as read:', err.message);
    }
  };

  // Synchronize on authentication change
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    } else {
      setUnreadCount(0);
      setRecentNotifications([]);
    }
  }, [isAuthenticated, fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        recentNotifications,
        loading,
        error,
        fetchUnreadCount,
        fetchRecentNotifications,
        markAsRead,
        setRecentNotifications,
        setUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
