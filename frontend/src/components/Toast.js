import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X, Sparkles } from 'lucide-react';

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
        return <CheckCircle className="w-6 h-6" />;
      case 'error':
        return <XCircle className="w-6 h-6" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6" />;
      case 'sparkle':
        return <Sparkles className="w-6 h-6" />;
      default:
        return <Info className="w-6 h-6" />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          gradient: 'from-green-500 to-emerald-600',
          glow: 'shadow-green-500/50'
        };
      case 'error':
        return {
          gradient: 'from-red-500 to-pink-600',
          glow: 'shadow-red-500/50'
        };
      case 'warning':
        return {
          gradient: 'from-yellow-500 to-orange-600',
          glow: 'shadow-yellow-500/50'
        };
      case 'sparkle':
        return {
          gradient: 'from-purple-500 to-pink-600',
          glow: 'shadow-purple-500/50'
        };
      default:
        return {
          gradient: 'from-blue-500 to-cyan-600',
          glow: 'shadow-blue-500/50'
        };
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[100] space-y-3 max-w-md">
      {toasts.map((toast) => {
        const styles = getStyles(toast.type);
        return (
          <div
            key={toast.id}
            className={`bg-gradient-to-r ${styles.gradient} backdrop-blur-xl rounded-2xl p-5 shadow-2xl ${styles.glow} min-w-[320px] animate-slide-in-right border-2 border-white/20`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 text-white animate-scale-in">
                {getIcon(toast.type)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold leading-relaxed">
                  {toast.message}
                </p>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            {toast.duration > 0 && (
              <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white/80 rounded-full animate-progress"
                  style={{ animationDuration: `${toast.duration}ms` }}
                />
              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-progress {
          animation: progress linear forwards;
        }
      `}</style>
    </div>
  );
}

export default Toast;