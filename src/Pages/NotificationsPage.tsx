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
  ArrowLeft,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../lib/api';
import { Notification } from '../contexts/SocketContext';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../hooks/useAuth';
import Navigation from '../Components/Navigation';
import { NotificationSkeletonLoader } from '../Components/SkeletonLoader';

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

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
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

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilter: 'all' | 'unread') => {
    setFilter(newFilter);
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
          navigate(`/task/${notification.referenceId}`);
        }
        break;
      case 'message_received':
        // No navigation for messages
        break;
      case 'course_enrolled':
        if (notification.referenceId) {
          navigate(`/courses`);
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

  // Determine user role for navigation
  const userRole = currentUser.role || 'Mentee';

  return (
    <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 transition-colors">
      {/* Navigation */}
      <Navigation
        role={userRole as 'Mentor' | 'Mentee' | 'Admin'}
        userName={currentUser.fullName || 'User'}
        onLogout={signOut}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button & Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-6 transition-colors font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h1>
              <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
                {pagination.total} total notification{pagination.total !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Filter tabs */}
              <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${filter === 'all'
                    ? 'bg-[#008080] text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleFilterChange('unread')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${filter === 'unread'
                    ? 'bg-[#008080] text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                  Unread
                </button>
              </div>

              {/* Mark all as read */}
              {notifications.some((n) => !n.read) && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 text-[#008080] dark:text-teal-400 hover:bg-[#008080]/10 dark:hover:bg-teal-400/10 border border-gray-200 dark:border-gray-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notification list */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <NotificationSkeletonLoader count={8} />
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                <Bell className="w-10 h-10" />
              </div>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">No notifications</p>
              <p className="text-sm mt-1">
                {filter === 'unread' ? "You're all caught up!" : "You don't have any notifications yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.map((notification) => {
                const metadata = getMetadata(notification);
                const isClickable = notification.type !== 'message_received';

                return (
                  <div
                    key={notification.id}
                    onClick={() => isClickable && handleNotificationClick(notification)}
                    className={`px-4 sm:px-6 py-4 flex items-start gap-4 transition-colors ${isClickable ? 'cursor-pointer' : ''
                      } ${!notification.read
                        ? 'bg-[#008080]/5 dark:bg-teal-900/10'
                        : ''
                      } ${isClickable
                        ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        : ''
                      }`}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!notification.read
                        ? 'bg-[#008080]/10 dark:bg-teal-400/10'
                        : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                        {getNotificationIcon(notification.type, metadata?.status)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium ${!notification.read
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-700 dark:text-gray-300'
                              }`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-[#008080]" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            {getRelativeTime(notification.createdAt)}
                          </p>
                        </div>

                        {/* Mark as read button */}
                        {!notification.read && (
                          <button
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 dark:text-gray-500 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {pagination.page} of {pagination.totalPages}
            </p>

            <div className="flex items-center gap-1">
              {/* Previous button */}
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`p-2 rounded-lg transition-colors ${pagination.page === 1
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Page numbers */}
              {getPageNumbers().map((pageNum, index) =>
                pageNum === '...' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-3 py-2 text-gray-400 dark:text-gray-500"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum as number)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pagination.page === pageNum
                      ? 'bg-[#008080] text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
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
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;
