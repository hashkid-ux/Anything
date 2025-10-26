import React, { useEffect, useState } from 'react';
import { Loader, CheckCircle, XCircle } from 'lucide-react';

function OAuthCallback({ onSuccess, onError }) {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Completing authentication...');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = () => {
    try {
      // Get URL parameters
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const userStr = params.get('user');
      const error = params.get('error');

      // Check for errors
      if (error) {
        setStatus('error');
        setMessage(getErrorMessage(error));
        setTimeout(() => {
          onError?.(error);
          window.history.replaceState({}, '', '/');
        }, 3000);
        return;
      }

      // Validate token and user data
      if (!token || !userStr) {
        setStatus('error');
        setMessage('Authentication data missing. Please try again.');
        setTimeout(() => {
          onError?.('missing_data');
          window.history.replaceState({}, '', '/');
        }, 3000);
        return;
      }

      // Parse user data
      let userData;
      try {
        userData = JSON.parse(decodeURIComponent(userStr));
      } catch (e) {
        console.error('Failed to parse user data:', e);
        setStatus('error');
        setMessage('Invalid user data. Please try again.');
        setTimeout(() => {
          onError?.('invalid_data');
          window.history.replaceState({}, '', '/');
        }, 3000);
        return;
      }

      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Set default axios header if available
      if (window.axios) {
        window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      // Success!
      setStatus('success');
      setMessage(`Welcome, ${userData.name}! Redirecting to dashboard...`);

      // Redirect after short delay
      setTimeout(() => {
        onSuccess?.(userData);
        window.history.replaceState({}, '', '/dashboard');
      }, 2000);

    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
      setTimeout(() => {
        onError?.('unknown_error');
        window.history.replaceState({}, '', '/');
      }, 3000);
    }
  };

  const getErrorMessage = (error) => {
    const errorMessages = {
      'google_auth_failed': 'Google authentication failed. Please try again.',
      'github_auth_failed': 'GitHub authentication failed. Please try again.',
      'token_generation_failed': 'Failed to create session. Please try again.',
      'access_denied': 'Access denied. Authentication was cancelled.'
    };
    return errorMessages[error] || 'Authentication failed. Please try again.';
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center z-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 bg-white/5 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-12 max-w-md w-full mx-4 text-center animate-scale-in">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 bg-gradient-to-br from-blue-600 to-purple-600">
          {status === 'processing' && (
            <Loader className="w-12 h-12 text-white animate-spin" />
          )}
          {status === 'success' && (
            <CheckCircle className="w-12 h-12 text-white animate-bounce" />
          )}
          {status === 'error' && (
            <XCircle className="w-12 h-12 text-white animate-shake" />
          )}
        </div>

        {/* Message */}
        <h2 className={`text-2xl font-bold mb-3 ${
          status === 'success' ? 'text-green-400' :
          status === 'error' ? 'text-red-400' :
          'text-white'
        }`}>
          {status === 'processing' && 'Authenticating...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h2>

        <p className="text-gray-300 mb-6">
          {message}
        </p>

        {/* Loading Dots */}
        {status === 'processing' && (
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default OAuthCallback;