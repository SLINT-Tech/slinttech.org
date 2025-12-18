import { X, Bell, CheckCircle, XCircle, Mail, BookOpen, ClipboardCheck, ChevronRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { useSocket, Notification } from '../contexts/SocketContext';

interface NotificationOffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper to get relative time string
const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 4) return `${diffWeek}w ago`;
  return date.toLocaleDateString();
};

// Get icon for notification type
const getNotificationIcon = (type: Notification['type'], status?: string) => {
  switch (type) {
    case 'task_submitted':
      return <ClipboardCheck className="w-5 h-5 text-[#008080]" />;
    case 'task_reviewed':
      return status === 'approved' ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500" />
      );
    case 'message_received':
      return <Mail className="w-5 h-5 text-purple-500" />;
    case 'course_enrolled':
      return <BookOpen className="w-5 h-5 text-[#008080]" />;
    default:
      return <Bell className="w-5 h-5 text-gray-500" />;
  }
};

const NotificationOffcanvas: React.FC<NotificationOffcanvasProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const {
    notifications,
    fetchLatestNotifications,
    markAsRead,
    markAllAsRead,
  } = useSocket();
  const offcanvasRef = useRef<HTMLDivElement>(null);

  // Fetch latest notifications when offcanvas opens
  useEffect(() => {
    if (isOpen) {
      fetchLatestNotifications();
    }
  }, [isOpen, fetchLatestNotifications]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read first
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on type
    switch (notification.type) {
      case 'task_submitted':
        navigate('/mentor/submissions');
        break;
      case 'task_reviewed':
        if (notification.referenceId) {
          navigate(`/task/${notification.referenceId}`);
        }
        break;
      case 'message_received':
        // No navigation for messages - just mark as read
        break;
      case 'course_enrolled':
        if (notification.referenceId) {
          navigate(`/courses`);
        }
        break;
    }

    onClose();
  };

  // Parse metadata if exists
  const getMetadata = (notification: Notification): Record<string, string> => {
    if (!notification.metadata) return {};
    try {
      return JSON.parse(notification.metadata);
    } catch {
      return {};
    }
  };

  // Don't render anything if not open (for performance)
  if (!isOpen) return null;

  // Use portal to render outside of Navigation's stacking context
  return createPortal(
    <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true" aria-label="Notifications">
      {/* Backdrop - matches modal pattern */}
      <div
        className="fixed inset-0 bg-gray-900/50 dark:bg-gray-950/70 backdrop-blur-md transition-opacity duration-300"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Offcanvas panel */}
      <div
        ref={offcanvasRef}
        className="fixed top-0 right-0 h-full w-full sm:w-[360px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out animate-slideInRight"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Notifications
          </h2>
          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.read) && (
              <button
                onClick={markAllAsRead}
                className="text-xs px-2 py-1 rounded-md text-[#008080] dark:text-teal-400 hover:bg-[#008080]/10 dark:hover:bg-teal-400/10 transition-colors font-medium"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
              aria-label="Close notifications"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500 px-4">
              <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                <Bell className="w-7 h-7" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No notifications</p>
              <p className="text-xs mt-1 text-center">We'll notify you when something arrives</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((notification) => {
                const metadata = getMetadata(notification);
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${!notification.read ? 'bg-[#008080]/5 dark:bg-teal-900/10' : ''}`}
                  >
                    {/* Icon */}
                    <div className="shrink-0 mt-0.5">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${!notification.read
                        ? 'bg-[#008080]/10 dark:bg-teal-400/10'
                        : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                        {getNotificationIcon(notification.type, metadata?.status)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium line-clamp-1 ${!notification.read
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-700 dark:text-gray-300'
                          }`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="shrink-0 w-2 h-2 rounded-full bg-[#008080] mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                        {getRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - View all link */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 shrink-0">
          <Link
            to="/notifications"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 text-sm font-medium text-[#008080] dark:text-teal-400 hover:text-[#006666] dark:hover:text-teal-300 transition-colors"
          >
            View all notifications
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NotificationOffcanvas;
