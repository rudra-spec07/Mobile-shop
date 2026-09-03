import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, ChevronRight, AlertCircle, Inbox } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import NotificationDetailsModal from '../notification/NotificationDetailsModal';
import Spinner from '../common/Spinner';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const dropdownRef = useRef(null);

  const { role } = useAuth();
  const {
    unreadCount,
    recentNotifications,
    loading,
    error,
    fetchRecentNotifications,
    markAsRead,
  } = useNotifications();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch recent notifications when dropdown opens
  const handleToggleDropdown = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      fetchRecentNotifications();
    }
  };

  // Format relative timestamp or short date
  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  // Target view all route
  const viewAllRoute = role === ROLES.SUPER_ADMIN ? '/admin/notifications' : '/customer/notifications';

  // Format badge display (0: hidden, 1-99: number, >99: 99+)
  const badgeText = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={handleToggleDropdown}
        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors relative"
        title="Notifications"
        aria-label="Toggle notifications dropdown"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
            {badgeText}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="fixed left-3 right-3 top-16 mt-1 sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-2 sm:w-96 max-w-full bg-white rounded-2xl shadow-xl border border-slate-200 py-0 z-50 overflow-hidden animate-fade-in">
          {/* Panel Header */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <Link
              to={viewAllRoute}
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Panel Content Body */}
          <div className="max-h-[calc(100vh-12rem)] sm:max-h-80 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-6 flex flex-col items-center justify-center text-slate-500 gap-2">
                <Spinner size="sm" />
                <span className="text-xs">Loading notifications...</span>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500 text-xs flex flex-col items-center gap-1">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span>{error}</span>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                <Inbox className="w-8 h-8 text-slate-300" />
                <p className="text-xs font-medium text-slate-600">No Notifications</p>
                <p className="text-[11px] text-slate-400">You're all caught up!</p>
              </div>
            ) : (
              recentNotifications.map((notif) => {
                const isRead = Boolean(notif.readAt || notif.status === 'READ');
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markAsRead(notif.id);
                      setSelectedNotification(notif);
                      setIsOpen(false);
                    }}
                    className={`p-3.5 cursor-pointer transition-colors hover:bg-slate-50 flex items-start gap-3 ${
                      !isRead ? 'bg-blue-50/40 font-medium' : 'bg-white'
                    }`}
                  >
                    {/* Unread Indicator Dot */}
                    <div className="mt-1 shrink-0">
                      {!isRead ? (
                        <span className="w-2.5 h-2.5 bg-blue-600 rounded-full block shadow-xs" />
                      ) : (
                        <span className="w-2.5 h-2.5 bg-slate-200 rounded-full block" />
                      )}
                    </div>

                    {/* Notification Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className={`text-xs truncate ${!isRead ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Panel Footer */}
          <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
            <Link
              to={viewAllRoute}
              onClick={() => setIsOpen(false)}
              className="block py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              See All Notifications
            </Link>
          </div>
        </div>
      )}

      {/* Notification Details Modal */}
      {selectedNotification && (
        <NotificationDetailsModal
          isOpen={Boolean(selectedNotification)}
          onClose={() => setSelectedNotification(null)}
          notification={selectedNotification}
        />
      )}
    </div>
  );
};

export default NotificationDropdown;
