import React from 'react';
import { CheckCircle, AlertCircle, Info, DollarSign, Code, Trash2, ExternalLink } from 'lucide-react';

function NotificationItem({ notification, onMarkAsRead, onDelete }) {
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-400" />;
      case 'build':
        return <Code className="w-5 h-5 text-blue-400" />;
      case 'payment':
        return <DollarSign className="w-5 h-5 text-green-400" />;
      default:
        return <Info className="w-5 h-5 text-purple-400" />;
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`p-4 transition-all ${
        notification.read 
          ? 'bg-slate-900/50 hover:bg-slate-800/50' 
          : 'bg-slate-800/50 hover:bg-slate-800'
      } ${notification.actionUrl ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`font-semibold text-sm ${
              notification.read ? 'text-slate-400' : 'text-white'
            }`}>
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
            )}
          </div>

          <p className={`text-sm leading-relaxed mb-2 ${
            notification.read ? 'text-slate-500' : 'text-slate-300'
          }`}>
            {notification.message}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">
              {formatTime(notification.createdAt)}
            </span>

            <div className="flex items-center gap-2">
              {notification.actionUrl && (
                <a
                  href={notification.actionUrl}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors"
                >
                  {notification.actionText || 'View'}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationItem;