import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

let toastId = 0;
const toastListeners = [];

export const showToast = (message, type = 'info', duration = 5000) => {
  const id = toastId++;
  const toast = { id, message, type, duration };
  toastListeners.forEach(listener => listener(toast));
  return id;
};

function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const addToast = (toast) => {
      setToasts(prev => [...prev, toast]);
      
      if (toast.duration > 0) {
        setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration);
      }
    };

    toastListeners.push(addToast);

    return () => {
      const index = toastListeners.indexOf(addToast);
      if (index > -1) {
        toastListeners.splice(index, 1);
      }
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/90 border-green-600';
      case 'error':
        return 'bg-red-500/90 border-red-600';
      case 'warning':
        return 'bg-yellow-500/90 border-yellow-600';
      default:
        return 'bg-blue-500/90 border-blue-600';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getStyles(toast.type)} border-2 backdrop-blur-xl rounded-xl p-4 shadow-2xl min-w-[300px] max-w-md animate-slide-in-right flex items-start gap-3`}
        >
          <div className="text-white flex-shrink-0">
            {getIcon(toast.type)}
          </div>
          <p className="text-white flex-1 text-sm font-medium">
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/80 hover:text-white flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toast;