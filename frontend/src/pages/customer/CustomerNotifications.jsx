import React, { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCircle2, RefreshCw, Inbox } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import NotificationDetailsModal from '../../components/notification/NotificationDetailsModal';
import notificationService from '../../services/notification.service';
import { useNotifications } from '../../context/NotificationContext';

const CustomerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0, page: 1, limit: 10 });
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' or 'UNREAD'
  const [selectedNotification, setSelectedNotification] = useState(null);

  const { markAsRead, fetchUnreadCount } = useNotifications();

  // Load Customer Notifications
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await notificationService.getNotifications({ page, limit: 10 });
      if (response && Array.isArray(response.data)) {
        setNotifications(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Handle Mark Single Item as Read
  const handleItemClick = async (notif) => {
    setSelectedNotification(notif);
    const isUnread = !notif.readAt && notif.status !== 'READ';
    if (isUnread) {
      await markAsRead(notif.id);
      // Locally update page list
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, readAt: new Date().toISOString(), status: 'READ' } : n))
      );
      fetchUnreadCount();
    }
  };

  // Filter notifications list locally
  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'UNREAD') {
      return !n.readAt && n.status !== 'READ';
    }
    return true;
  });

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-slate-800 shadow-sm">
          <div className="absolute -right-10 -top-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold rounded-full mb-2.5">
                <Bell className="w-3.5 h-3.5" /> Notification Center
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Notifications</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Stay updated on your service requests, enquiries, and account status updates in real-time.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={loadNotifications}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
            </Button>
          </div>
        </div>

        {/* Filter Chips (iOS Segmented Bar) */}
        <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 flex items-center gap-1 w-fit">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'ALL'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setActiveFilter('UNREAD')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'UNREAD'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            Unread Only
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500 gap-3">
            <Spinner size="lg" />
            <p className="text-sm font-medium">Loading notifications...</p>
          </div>
        ) : error ? (
          <ErrorState
            title="Unable to load notifications"
            message={error}
            onRetry={loadNotifications}
          />
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={activeFilter === 'UNREAD' ? 'No Unread Notifications' : 'No Notifications Yet'}
            description={
              activeFilter === 'UNREAD'
                ? 'You have read all your notifications.'
                : 'You have not received any notifications yet.'
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const isRead = Boolean(notif.readAt || notif.status === 'READ');
              return (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 hover:shadow-xs ${
                    !isRead
                      ? 'bg-blue-50/40 border-blue-200/80 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  {/* Status Indicator */}
                  <div className="mt-1 shrink-0">
                    {!isRead ? (
                      <span className="w-3 h-3 bg-blue-600 rounded-full block shadow-xs ring-4 ring-blue-100" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-slate-300" />
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className={`text-sm ${!isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-xs text-slate-400 shrink-0 font-normal">
                        {formatDate(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs mt-4">
                <Pagination
                  currentPage={page}
                  totalPages={pagination.totalPages}
                  totalResults={pagination.total}
                  limit={pagination.limit}
                  onPageChange={(newPage) => setPage(newPage)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notification Details Modal */}
      {selectedNotification && (
        <NotificationDetailsModal
          isOpen={Boolean(selectedNotification)}
          onClose={() => setSelectedNotification(null)}
          notification={selectedNotification}
        />
      )}
    </CustomerLayout>
  );
};

export default CustomerNotifications;
