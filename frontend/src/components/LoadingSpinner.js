import React from 'react';
import { Loader, Sparkles, Zap, Code, Rocket } from 'lucide-react';

function LoadingSpinner({ 
  message = 'Loading...', 
  size = 'medium',
  variant = 'default',
  withIcon = true,
  fullScreen = false 
}) {
  const sizes = {
    small: { spinner: 'w-8 h-8', container: 'p-4', text: 'text-sm' },
    medium: { spinner: 'w-16 h-16', container: 'p-8', text: 'text-base' },
    large: { spinner: 'w-24 h-24', container: 'p-12', text: 'text-lg' }
  };

  const sizeConfig = sizes[size] || sizes.medium;

  const variants = {
    default: {
      gradient: 'from-blue-600 via-purple-600 to-pink-600',
      icon: Loader,
      animation: 'animate-spin'
    },
    sparkle: {
      gradient: 'from-yellow-500 via-orange-500 to-red-500',
      icon: Sparkles,
      animation: 'animate-pulse'
    },
    code: {
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      icon: Code,
      animation: 'animate-bounce'
    },
    rocket: {
      gradient: 'from-purple-500 via-pink-500 to-red-500',
      icon: Rocket,
      animation: 'animate-bounce'
    }
  };

  const variantConfig = variants[variant] || variants.default;
  const IconComponent = variantConfig.icon;

  const content = (
    <div className={`flex flex-col items-center justify-center ${sizeConfig.container}`}>
      {/* Animated Spinner */}
      <div className="relative mb-6">
        {/* Outer Glow Ring */}
        <div className={`absolute inset-0 bg-gradient-to-r ${variantConfig.gradient} rounded-full blur-2xl opacity-50 animate-pulse`}></div>
        
        {/* Main Spinner */}
        <div className={`relative ${sizeConfig.spinner}`}>
          {/* Background Circle */}
          <div className={`absolute inset-0 bg-gradient-to-r ${variantConfig.gradient} rounded-full opacity-20`}></div>
          
          {/* Spinning Border */}
          <svg className={`${sizeConfig.spinner} ${variantConfig.animation}`} viewBox="0 0 50 50">
            <circle
              className="opacity-25"
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              style={{ color: 'white' }}
            />
            <circle
              className={`animate-spin-slow`}
              cx="25"
              cy="25"
              r="20"
              stroke="url(#gradient)"
              strokeWidth="4"
              fill="none"
              strokeDasharray="80, 200"
              strokeDashoffset="0"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Icon */}
          {withIcon && (
            <div className="absolute inset-0 flex items-center justify-center">
              <IconComponent className={`${variantConfig.animation} text-white`} style={{ width: '40%', height: '40%' }} />
            </div>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="space-y-2 text-center">
          <p className={`text-white font-semibold ${sizeConfig.text} animate-pulse`}>
            {message}
          </p>
          {/* Animated Dots */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}

      {/* Fun Loading Messages (optional) */}
      {size === 'large' && (
        <div className="mt-6 max-w-md">
          <p className="text-gray-400 text-sm text-center italic">
            {getRandomLoadingTip()}
          </p>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

// Fun loading tips
function getRandomLoadingTip() {
  const tips = [
    "AI agents are analyzing your market...",
    "Researching 10,000+ competitors...",
    "Generating production-ready code...",
    "Optimizing for performance...",
    "Creating your revenue model...",
    "Almost there! This is worth the wait...",
    "Building something amazing...",
    "AI is working its magic..."
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

// Alternative minimal spinner
export function MinimalSpinner({ size = 'medium', className = '' }) {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg className="animate-spin" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

// Skeleton loader for content
export function SkeletonLoader({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div 
            className="h-4 bg-white/10 rounded-lg"
            style={{ width: `${Math.random() * 40 + 60}%` }}
          />
        </div>
      ))}
    </div>
  );
}

// Progress bar loader
export function ProgressLoader({ progress = 0, message = 'Loading...' }) {
  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white font-semibold text-sm">{message}</span>
        <span className="text-purple-400 font-bold text-sm tabular-nums">{progress}%</span>
      </div>
      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
}

export default LoadingSpinner;