import { X, Bell, CheckCircle, XCircle, Mail, BookOpen, ClipboardCheck } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        offcanvasRef.current &&
        !offcanvasRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when offcanvas is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

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

  // Handle view all click
  const handleViewAll = () => {
    navigate('/notifications');
    onClose();
  };

  // Parse metadata if exists
  const getMetadata = (notification: Notification): Record<string, any> => {
    if (!notification.metadata) return {};
    try {
      return JSON.parse(notification.metadata);
    } catch {
      return {};
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 dark:bg-black/70 z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Offcanvas panel */}
      <div
        ref={offcanvasRef}
        className={`fixed top-0 right-0 h-full z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
          } bg-white dark:bg-gray-900 w-full sm:w-[380px] shadow-2xl flex flex-col border-l border-gray-200 dark:border-gray-800`}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notifications
          </h2>
          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.read) && (
              <button
                onClick={markAllAsRead}
                className="text-sm px-3 py-1.5 rounded-lg text-[#008080] dark:text-teal-400 hover:bg-[#008080]/10 dark:hover:bg-teal-400/10 transition-colors font-medium"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              aria-label="Close notifications"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Bell className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs mt-1 text-gray-400">We'll notify you when something arrives</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((notification) => {
                const metadata = getMetadata(notification);
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left px-4 py-4 flex items-start gap-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${!notification.read ? 'bg-[#008080]/5 dark:bg-teal-900/10' : ''
                      }`}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!notification.read
                        ? 'bg-[#008080]/10 dark:bg-teal-400/10'
                        : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                        {getNotificationIcon(notification.type, metadata?.status)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium ${!notification.read
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-700 dark:text-gray-300'
                          }`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#008080] mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {getRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={handleViewAll}
            className="w-full py-2.5 text-center text-sm font-medium rounded-lg bg-[#008080] hover:bg-[#006666] text-white transition-colors"
          >
            View All Notifications
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationOffcanvas;
