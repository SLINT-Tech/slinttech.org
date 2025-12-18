import {
  Bell,
  CheckCircle,
  XCircle,
  Mail,
  BookOpen,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../lib/api';
import { Notification } from '../contexts/SocketContext';
import { useSocket } from '../contexts/SocketContext';

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

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchUnreadCount } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode !== null) return savedMode === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Fetch notifications
  const fetchNotifications = useCallback(async (page: number, filterType: 'all' | 'unread') => {
    setLoading(true);
    try {
      const response = await apiGet(`/notifications?page=${page}&limit=20&filter=${filterType}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications(1, filter);
  }, [filter, fetchNotifications]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchNotifications(newPage, filter);
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilter: 'all' | 'unread') => {
    setFilter(newFilter);
    // fetchNotifications will be triggered by useEffect
  };

  // Handle mark as read
  const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await apiPost(`/notifications/${notificationId}/read`);
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n
          )
        );
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const response = await apiPost('/notifications/mark-all-read');
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
        );
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read first
    if (!notification.read) {
      try {
        await apiPost(`/notifications/${notification.id}/read`);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read: true, readAt: new Date().toISOString() } : n
          )
        );
        fetchUnreadCount();
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }

    // Navigate based on type
    switch (notification.type) {
      case 'task_submitted':
        navigate('/mentor/submissions');
        break;
      case 'task_reviewed':
        if (notification.referenceId) {
          navigate(`/tasks/${notification.referenceId}`);
        }
        break;
      case 'message_received':
        // No navigation for messages
        break;
      case 'course_enrolled':
        if (notification.referenceId) {
          navigate(`/courses/${notification.referenceId}`);
        }
        break;
    }
  };

  // Parse metadata
  const getMetadata = (notification: Notification): Record<string, any> => {
    if (!notification.metadata) return {};
    try {
      return JSON.parse(notification.metadata);
    } catch {
      return {};
    }
  };

  // Generate page numbers to display
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const { page, totalPages } = pagination;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }

    return pages;
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Notifications
            </h1>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {pagination.total} total notification{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter tabs */}
            <div className={`flex rounded-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${filter === 'all'
                    ? darkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                    : darkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => handleFilterChange('unread')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${filter === 'unread'
                    ? darkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                    : darkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Unread
              </button>
            </div>

            {/* Mark all as read */}
            {notifications.some((n) => !n.read) && (
              <button
                onClick={handleMarkAllAsRead}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${darkMode
                    ? 'bg-gray-800 text-blue-400 hover:bg-gray-700'
                    : 'bg-white text-blue-600 hover:bg-gray-50 border border-gray-300'
                  }`}
              >
                <Check className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Notification list */}
        <div className={`rounded-xl overflow-hidden shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-16 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <Bell className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm mt-1">
                {filter === 'unread' ? "You're all caught up!" : "You don't have any notifications yet."}
              </p>
            </div>
          ) : (
            <ul className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {notifications.map((notification) => {
                const metadata = getMetadata(notification);
                const isClickable = notification.type !== 'message_received';

                return (
                  <li key={notification.id}>
                    <div
                      onClick={() => isClickable && handleNotificationClick(notification)}
                      className={`px-4 sm:px-6 py-4 flex items-start gap-4 transition-colors ${isClickable ? 'cursor-pointer' : ''
                        } ${notification.read
                          ? darkMode
                            ? 'bg-gray-800'
                            : 'bg-white'
                          : darkMode
                            ? 'bg-gray-750'
                            : 'bg-blue-50'
                        } ${isClickable
                          ? darkMode
                            ? 'hover:bg-gray-700'
                            : 'hover:bg-gray-50'
                          : ''
                        }`}
                    >
                      {/* Unread indicator */}
                      <div className="flex-shrink-0 mt-1 w-2">
                        {!notification.read && (
                          <span className="block w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>

                      {/* Icon */}
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type, metadata?.status)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p
                              className={`text-sm font-medium ${notification.read
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
                              className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}
                            >
                              {notification.message}
                            </p>
                            <p
                              className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'
                                }`}
                            >
                              {getRelativeTime(notification.createdAt)}
                            </p>
                          </div>

                          {/* Mark as read button */}
                          {!notification.read && (
                            <button
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                              className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${darkMode
                                  ? 'hover:bg-gray-600 text-gray-400'
                                  : 'hover:bg-gray-200 text-gray-500'
                                }`}
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Page {pagination.page} of {pagination.totalPages}
            </p>

            <div className="flex items-center gap-1">
              {/* Previous button */}
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`p-2 rounded-lg transition-colors ${pagination.page === 1
                    ? darkMode
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-300 cursor-not-allowed'
                    : darkMode
                      ? 'text-gray-400 hover:bg-gray-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Page numbers */}
              {getPageNumbers().map((pageNum, index) =>
                pageNum === '...' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className={`px-3 py-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum as number)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pagination.page === pageNum
                        ? 'bg-blue-600 text-white'
                        : darkMode
                          ? 'text-gray-400 hover:bg-gray-800'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {pageNum}
                  </button>
                )
              )}

              {/* Next button */}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`p-2 rounded-lg transition-colors ${pagination.page === pagination.totalPages
                    ? darkMode
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-300 cursor-not-allowed'
                    : darkMode
                      ? 'text-gray-400 hover:bg-gray-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
