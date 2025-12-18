import { Bell } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import NotificationOffcanvas from './NotificationOffcanvas';

interface NotificationBellProps {
  darkMode?: boolean;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ darkMode = false }) => {
  const { unreadCount, fetchUnreadCount } = useSocket();
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);

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
        ref={bellRef}
        onClick={handleBellClick}
        className={`relative p-2 rounded-full transition-colors duration-200 ${darkMode
            ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
            : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5 sm:w-6 sm:h-6" />

        {/* Notification badge */}
        {unreadCount > 0 && (
          <span
            className={`absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold rounded-full ${darkMode
                ? 'bg-red-500 text-white'
                : 'bg-red-500 text-white'
              }`}
            aria-hidden="true"
          >
            {displayCount}
          </span>
        )}
      </button>

      <NotificationOffcanvas
        isOpen={isOffcanvasOpen}
        onClose={handleCloseOffcanvas}
        darkMode={darkMode}
      />
    </>
  );
};

export default NotificationBell;
