import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'error' | 'success';
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const duration = message.length > 100 ? 8000 : 6000;
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`
      fixed top-4 right-4 z-50 transition-all duration-300
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
    `}>
      <div className={`
        flex items-start gap-3 p-4 rounded-lg shadow-lg max-w-md min-w-[320px]
        ${type === 'error'
          ? 'bg-red-50 border-2 border-red-200'
          : 'bg-green-50 border-2 border-green-200'
        }
      `}>
        <div className={`
          flex-shrink-0 mt-0.5
          ${type === 'error' ? 'text-red-600' : 'text-green-600'}
        `}>
          {type === 'error' ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`
            text-sm font-medium leading-relaxed
            ${type === 'error' ? 'text-red-800' : 'text-green-800'}
          `}>
            {message}
          </p>
        </div>
        <button
          onClick={handleClose}
          className={`
            flex-shrink-0 p-1 rounded-full transition-colors
            ${type === 'error'
              ? 'hover:bg-red-100 text-red-600'
              : 'hover:bg-green-100 text-green-600'
            }
          `}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;