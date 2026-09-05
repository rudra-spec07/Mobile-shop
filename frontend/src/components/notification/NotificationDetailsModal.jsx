import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowRight, CheckCircle2, Clock, Info, ShieldAlert, Package, MessageSquare, FileText } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

const NotificationDetailsModal = ({ isOpen, onClose, notification }) => {
  const navigate = useNavigate();
  const { role } = useAuth();

  if (!notification) return null;

  const isRead = Boolean(notification.readAt || notification.status === 'READ');

  // Format timestamp nicely
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Determine Notification Type Badge Style
  const getTypeBadge = (type) => {
    switch (type) {
      case 'LOW_STOCK':
        return { bg: 'bg-red-100 text-red-800 border-red-200', label: 'Low Stock Alert', icon: ShieldAlert };
      case 'CANCELLATION_REQUESTED':
        return { bg: 'bg-red-100 text-red-800 border-red-200', label: 'Cancellation Requested', icon: ShieldAlert };
      case 'CANCELLATION_REJECTED':
        return { bg: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Cancellation Rejected', icon: Info };
      case 'PASSWORD_RESET':
        return { bg: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Password Reset', icon: Info };
      case 'ACCOUNT_CREATED':
        return { bg: 'bg-green-100 text-green-800 border-green-200', label: 'Account Welcome', icon: CheckCircle2 };
      case 'ENQUIRY_CREATED':
      case 'ENQUIRY_RESPONDED':
        return { bg: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Enquiry Update', icon: MessageSquare };
      case 'REQUEST_CREATED':
      case 'REQUEST_CONFIRMED':
      case 'REQUEST_PROCESSING':
      case 'REQUEST_COMPLETED':
      case 'REQUEST_CANCELLED':
        return { bg: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Service Order', icon: FileText };
      default:
        return { bg: 'bg-slate-100 text-slate-800 border-slate-200', label: 'System Notice', icon: Bell };
    }
  };

  const badgeStyle = getTypeBadge(notification.type);
  const BadgeIcon = badgeStyle.icon;

  // Determine Deep Link Resource Path
  const getResourceAction = () => {
    const { type, referenceType, referenceId } = notification;

    if (type === 'LOW_STOCK' || referenceType === 'PART') {
      if (role === ROLES.SUPER_ADMIN) {
        return { label: 'View Low Stock Report', path: '/admin/inventory/low-stock', icon: Package };
      }
    }

    if (referenceType === 'ENQUIRY' || (type && type.startsWith('ENQUIRY_'))) {
      if (role === ROLES.SUPER_ADMIN) {
        return { label: 'Go to Admin Enquiries Desk', path: '/admin/enquiries', icon: MessageSquare };
      }
      return { label: 'View My Enquiries', path: '/customer/enquiries', icon: MessageSquare };
    }

    if (type === 'CANCELLATION_REQUESTED' || referenceType === 'SERVICE_REQUEST' || (type && type.startsWith('REQUEST_'))) {
      if (role === ROLES.SUPER_ADMIN) {
        if (type === 'CANCELLATION_REQUESTED' && referenceId) {
          return { label: 'Review Cancellation Request', path: `/admin/requests?requestId=${referenceId}&action=cancellation`, icon: ShieldAlert };
        }
        if (referenceId) {
          return { label: 'Go to Request Details', path: `/admin/requests?requestId=${referenceId}`, icon: FileText };
        }
        return { label: 'Go to Admin Orders & Requests', path: '/admin/requests', icon: FileText };
      }
      if (referenceId) {
        return { label: 'View Service Request Details', path: `/customer/requests/${referenceId}`, icon: FileText };
      }
      return { label: 'View My Service Requests', path: '/customer/requests', icon: FileText };
    }

    return null;
  };

  const action = getResourceAction();

  const handleNavigate = () => {
    if (action?.path) {
      onClose();
      navigate(action.path);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notification Details">
      <div className="space-y-4">
        {/* Header Badges & Read Status */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${badgeStyle.bg}`}>
            <BadgeIcon className="w-3.5 h-3.5" />
            <span>{badgeStyle.label}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDate(notification.createdAt)}</span>
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-base font-extrabold text-slate-900 leading-snug">
            {notification.title}
          </h3>
        </div>

        {/* Message Body */}
        <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
          {notification.message}
        </div>

        {/* Read / Unread Status Footer Indicator */}
        <div className="flex items-center justify-between pt-1 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isRead ? 'bg-slate-300' : 'bg-blue-600 ring-4 ring-blue-100'}`} />
            {isRead ? `Read at ${formatDate(notification.readAt || notification.updatedAt)}` : 'Unread'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">
            Close
          </Button>

          {action && (
            <Button variant="primary" size="sm" onClick={handleNavigate} className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold">
              <span>{action.label}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default NotificationDetailsModal;
