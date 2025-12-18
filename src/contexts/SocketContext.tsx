import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL, getAuthToken, apiGet, apiPost } from '../lib/api';

// Notification type from backend
export interface Notification {
  id: string;
  userId: string;
  type: 'task_submitted' | 'task_reviewed' | 'message_received' | 'course_enrolled';
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  referenceType: 'task' | 'course' | 'message' | null;
  referenceId: string | null;
  metadata: string | null;
  createdAt: string;
}

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  unreadCount: number;
  notifications: Notification[];
  fetchUnreadCount: () => Promise<void>;
  fetchLatestNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const SocketContext = createContext<SocketContextValue | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch unread count from API
  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await apiGet('/notifications/unread-count');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('[SOCKET] Failed to fetch unread count:', error);
    }
  }, []);

  // Fetch latest 5 notifications for offcanvas
  const fetchLatestNotifications = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await apiGet('/notifications/latest');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('[SOCKET] Failed to fetch notifications:', error);
    }
  }, []);

  // Mark a single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await apiPost(`/notifications/${notificationId}/read`);
      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('[SOCKET] Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await apiPost('/notifications/mark-all-read');
      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('[SOCKET] Failed to mark all as read:', error);
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      // No token, clean up any existing connection
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Determine socket URL - use API_BASE_URL if set, otherwise current origin
    const socketUrl = API_BASE_URL || window.location.origin;

    const newSocket = io(socketUrl, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    newSocket.on('connect', () => {
      console.log('[SOCKET] Connected');
      setIsConnected(true);
      // Fetch initial data
      fetchUnreadCount();
      fetchLatestNotifications();
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[SOCKET] Disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[SOCKET] Connection error:', error.message);
      setIsConnected(false);
    });

    // Handle new notifications
    newSocket.on('notification', (notification: Notification) => {
      console.log('[SOCKET] New notification:', notification);
      // Add to beginning of list and keep only 5
      setNotifications((prev) => [notification, ...prev].slice(0, 5));
      setUnreadCount((prev) => prev + 1);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for token changes (login/logout)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (e.newValue) {
          // Token added - reconnect socket with new token
          if (socket) {
            socket.auth = { token: e.newValue };
            socket.connect();
          }
          fetchUnreadCount();
          fetchLatestNotifications();
        } else {
          // Token removed - disconnect and clear state
          if (socket) {
            socket.disconnect();
          }
          setUnreadCount(0);
          setNotifications([]);
          setIsConnected(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [socket, fetchUnreadCount, fetchLatestNotifications]);

  const value: SocketContextValue = {
    socket,
    isConnected,
    unreadCount,
    notifications,
    fetchUnreadCount,
    fetchLatestNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextValue => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
