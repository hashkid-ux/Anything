import React from 'react';
import { Loader } from 'lucide-react';

function LoadingSpinner({ message = 'Loading...', size = 'medium' }) {
  const sizes = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`relative ${sizes[size]}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-ping opacity-75"></div>
        <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
          <Loader className="w-6 h-6 text-white animate-spin" />
        </div>
      </div>
      {message && (
        <p className="text-gray-400 mt-4 text-sm animate-pulse">{message}</p>
      )}
    </div>
  );
}

export default LoadingSpinner;