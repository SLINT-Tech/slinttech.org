import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL, getAuthToken, apiGet, apiPost } from '../lib/api';
import { playNotificationSound, initNotificationSound } from '../lib/notificationSound';

// Notification type from backend
export interface Notification {
  id: string;
  userId: string;
  type: 'task_submitted' | 'task_reviewed' | 'message_received' | 'course_enrolled' | 'user_registered';
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  referenceType: 'task' | 'course' | 'message' | 'user' | null;
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
  const socketInitialized = useRef(false);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

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
      // Silent fail - polling will retry
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
      // Silent fail - user can retry by opening offcanvas
    }
  }, []);

  // Mark a single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await apiPost(`/notifications/${notificationId}/read`);
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to mark as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await apiPost('/notifications/mark-all-read');
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to mark all as read:', error);
    }
  }, []);

  // Start polling as fallback when socket is not connected
  const startPolling = useCallback(() => {
    if (pollingInterval.current) return; // Already polling

    pollingInterval.current = setInterval(() => {
      const token = getAuthToken();
      if (token) {
        fetchUnreadCount();
      }
    }, 30000); // Poll every 30 seconds
  }, [fetchUnreadCount]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const token = getAuthToken();

    // Fetch initial data if token exists
    if (token) {
      fetchUnreadCount();
      fetchLatestNotifications();
    }

    // Prevent double initialization in React strict mode
    if (socketInitialized.current) return;
    socketInitialized.current = true;

    if (!token) {
      // No token, start polling for when user logs in
      startPolling();
      return;
    }

    // Determine socket URL
    const socketUrl = API_BASE_URL || window.location.origin;

    const newSocket = io(socketUrl, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      console.log('[SOCKET] Connected');
      setIsConnected(true);
      stopPolling(); // Stop polling when socket connects
      // Refresh data on connect
      fetchUnreadCount();
      fetchLatestNotifications();
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[SOCKET] Disconnected:', reason);
      setIsConnected(false);
      startPolling(); // Start polling when socket disconnects
    });

    newSocket.on('connect_error', (error) => {
      console.log('[SOCKET] Connection error:', error.message);
      setIsConnected(false);
      startPolling(); // Start polling on connection error
    });

    // Handle new notifications - this is the real-time update
    newSocket.on('notification', (notification: Notification) => {
      console.log('[SOCKET] New notification received:', notification);
      // Add to beginning of list and keep only 5
      setNotifications((prev) => [notification, ...prev].slice(0, 5));
      setUnreadCount((prev) => prev + 1);
      // Play notification sound
      playNotificationSound();
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      stopPolling();
      socketInitialized.current = false;
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

  // Also check for token on mount and on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const token = getAuthToken();
        if (token) {
          fetchUnreadCount();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchUnreadCount]);

  // Initialize audio context on first user interaction (browser requirement)
  useEffect(() => {
    const handleUserInteraction = () => {
      initNotificationSound();
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

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
    // Return a default value instead of throwing - this allows usage before provider mounts
    return {
      socket: null,
      isConnected: false,
      unreadCount: 0,
      notifications: [],
      fetchUnreadCount: async () => { },
      fetchLatestNotifications: async () => { },
      markAsRead: async () => { },
      markAllAsRead: async () => { },
    };
  }
  return context;
};

export default SocketContext;
