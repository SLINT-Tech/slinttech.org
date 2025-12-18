import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import NotificationOffcanvas from './NotificationOffcanvas';

const NotificationBell = () => {
  const { unreadCount, fetchUnreadCount } = useSocket();
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  // Refresh unread count periodically as fallback
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 60000); // Every 60 seconds

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleBellClick = () => {
    setIsOffcanvasOpen(true);
  };

  const handleCloseOffcanvas = () => {
    setIsOffcanvasOpen(false);
  };

  // Format count for display (99+ if over 99)
  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <>
      <button
        onClick={handleBellClick}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />

        {/* Notification badge */}
        {unreadCount > 0 && (
          <span
            className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold rounded-full bg-red-500 text-white"
            aria-hidden="true"
          >
            {displayCount}
          </span>
        )}
      </button>

      <NotificationOffcanvas
        isOpen={isOffcanvasOpen}
        onClose={handleCloseOffcanvas}
      />
    </>
  );
};

export default NotificationBell;
