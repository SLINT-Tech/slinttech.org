import {
  X,
  Bell,
  CheckCircle,
  XCircle,
  Mail,
  BookOpen,
  ClipboardCheck,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket, Notification } from '../contexts/SocketContext';

interface NotificationOffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
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
      return <ClipboardCheck className="w-5 h-5 text-blue-500" />;
    case 'task_reviewed':
      return status === 'approved' ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500" />
      );
    case 'message_received':
      return <Mail className="w-5 h-5 text-purple-500" />;
    case 'course_enrolled':
      return <BookOpen className="w-5 h-5 text-indigo-500" />;
    default:
      return <Bell className="w-5 h-5 text-gray-500" />;
  }
};

const NotificationOffcanvas: React.FC<NotificationOffcanvasProps> = ({
  isOpen,
  onClose,
  darkMode = false,
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
        // Navigate to mentor submissions page
        navigate('/mentor/submissions');
        break;
      case 'task_reviewed':
        // Navigate to specific task
        if (notification.referenceId) {
          navigate(`/tasks/${notification.referenceId}`);
        }
        break;
      case 'message_received':
        // No navigation for messages - just mark as read
        break;
      case 'course_enrolled':
        // Navigate to course detail
        if (notification.referenceId) {
          navigate(`/courses/${notification.referenceId}`);
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
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        aria-hidden="true"
      />

      {/* Offcanvas panel */}
      <div
        ref={offcanvasRef}
        className={`fixed top-0 right-0 h-full z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
          } ${darkMode ? 'bg-gray-900' : 'bg-white'
          } w-full sm:w-96 shadow-xl flex flex-col`}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
        >
          <h2
            className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'
              }`}
          >
            Notifications
          </h2>
          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.read) && (
              <button
                onClick={markAllAsRead}
                className={`text-sm px-2 py-1 rounded transition-colors ${darkMode
                    ? 'text-blue-400 hover:bg-gray-800'
                    : 'text-blue-600 hover:bg-blue-50'
                  }`}
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-1 rounded-full transition-colors ${darkMode
                  ? 'hover:bg-gray-700 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-500'
                }`}
              aria-label="Close notifications"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div
              className={`flex flex-col items-center justify-center h-64 ${darkMode ? 'text-gray-500' : 'text-gray-400'
                }`}
            >
              <Bell className="w-12 h-12 mb-3" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => {
                const metadata = getMetadata(notification);
                return (
                  <li key={notification.id}>
                    <button
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${notification.read
                          ? darkMode
                            ? 'bg-gray-900'
                            : 'bg-white'
                          : darkMode
                            ? 'bg-gray-800'
                            : 'bg-blue-50'
                        } ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                        }`}
                    >
                      {/* Unread indicator */}
                      <div className="flex-shrink-0 mt-1">
                        {!notification.read && (
                          <span className="block w-2 h-2 rounded-full bg-blue-500" />
                        )}
                        {notification.read && <span className="block w-2 h-2" />}
                      </div>

                      {/* Icon */}
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type, metadata?.status)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${notification.read
                              ? darkMode
                                ? 'text-gray-300'
                                : 'text-gray-700'
                              : darkMode
                                ? 'text-white'
                                : 'text-gray-900'
                            }`}
                        >
                          {notification.title}
                        </p>
                        <p
                          className={`text-sm mt-0.5 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                        >
                          {notification.message}
                        </p>
                        <p
                          className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}
                        >
                          {getRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-4 py-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
        >
          <button
            onClick={handleViewAll}
            className={`w-full py-2 text-center text-sm font-medium rounded-lg transition-colors ${darkMode
                ? 'bg-gray-800 text-blue-400 hover:bg-gray-700'
                : 'bg-gray-100 text-blue-600 hover:bg-gray-200'
              }`}
          >
            View All Notifications
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationOffcanvas;
