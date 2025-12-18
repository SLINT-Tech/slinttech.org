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
  Trash2,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost, apiDelete } from '../lib/api';
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
    limit: 10,
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
      const response = await apiGet(`/notifications?page=${page}&limit=10&filter=${filterType}`);
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

  // Handle delete notification
  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await apiDelete(`/notifications/${notificationId}`);
      if (response.ok) {
        // Check if notification was unread before removing
        const notification = notifications.find((n) => n.id === notificationId);
        const wasUnread = notification && !notification.read;

        // Remove from local state with animation
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        // Update pagination total
        setPagination((prev) => ({
          ...prev,
          total: prev.total - 1,
          totalPages: Math.ceil((prev.total - 1) / prev.limit),
        }));

        // Update unread count if it was unread
        if (wasUnread) {
          fetchUnreadCount();
        }

        // If we've deleted all items on this page, go to previous page
        if (notifications.length === 1 && pagination.page > 1) {
          fetchNotifications(pagination.page - 1, filter);
        }
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Handle clear all read notifications
  const handleClearAllRead = async () => {
    try {
      const response = await apiDelete('/notifications/clear-all');
      if (response.ok) {
        // Remove all read notifications from state
        setNotifications((prev) => prev.filter((n) => !n.read));

        // Refresh to get accurate pagination
        fetchNotifications(1, filter);
      }
    } catch (error) {
      console.error('Failed to clear read notifications:', error);
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
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-6 transition-colors font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-6">
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
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 text-[#008080] dark:text-teal-400 hover:bg-[#008080]/10 dark:hover:bg-teal-400/10 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}

              {/* Clear read notifications */}
              {notifications.some((n) => n.read) && (
                <button
                  onClick={handleClearAllRead}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear read</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notification list */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <NotificationSkeletonLoader count={8} />
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Bell className="w-10 h-10" />
              </div>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">No notifications</p>
              <p className="text-sm mt-1">
                {filter === 'unread' ? "You're all caught up!" : "You don't have any notifications yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
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
                        : 'bg-white dark:bg-gray-900'
                      } ${isClickable
                        ? 'hover:bg-gray-50 dark:hover:bg-gray-800'
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

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* Mark as read button */}
                          {!notification.read && (
                            <button
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 dark:text-gray-500 hover:text-[#008080] dark:hover:text-teal-400 transition-colors cursor-pointer"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete button */}
                          <button
                            onClick={(e) => handleDelete(notification.id, e)}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-700 mt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing{' '}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {pagination.total}
                </span>{' '}
                notifications
              </div>

              <div className="flex items-center gap-2">
                {/* Previous button */}
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all text-gray-700 dark:text-gray-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`min-w-[40px] px-3 py-2 rounded-lg cursor-pointer font-medium transition-all ${pagination.page === pageNum
                          ? 'bg-[#008080] dark:bg-teal-600 text-white shadow-md dark:shadow-gray-900/30'
                          : 'border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next button */}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all text-gray-700 dark:text-gray-300"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;
