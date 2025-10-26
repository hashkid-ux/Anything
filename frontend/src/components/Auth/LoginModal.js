import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader, AlertCircle, CheckCircle, Eye, EyeOff, Sparkles, TrendingUp, Users, Shield } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (mode === 'signup') {
      if (!formData.name || formData.name.trim().length < 2) {
        setError('Name must be at least 2 characters');
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const payload = mode === 'login' 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(`${API_URL}${endpoint}`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        setSuccessMessage(mode === 'login' ? 'Welcome back!' : 'Account created successfully!');
        
        setTimeout(() => {
          onLoginSuccess(response.data.user);
          setFormData({ email: '', password: '', name: '' });
          onClose();
        }, 1500);
      }

    } catch (err) {
      console.error('Auth error:', err);
      
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please check your connection.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check your internet.');
      } else if (err.response) {
        setError(err.response.data?.error || 'Authentication failed');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setSuccessMessage('');
    setFormData({ email: '', password: '', name: '' });
  };

  const handleClose = () => {
    setFormData({ email: '', password: '', name: '' });
    setError('');
    setSuccessMessage('');
    onClose();
  };

  const stats = [
    { icon: <Users className="w-4 h-4" />, label: '10,000+ Users', color: 'from-blue-500 to-cyan-600' },
    { icon: <TrendingUp className="w-4 h-4" />, label: '$50M+ Generated', color: 'from-green-500 to-emerald-600' },
    { icon: <Shield className="w-4 h-4" />, label: '256-bit Encryption', color: 'from-purple-500 to-pink-600' }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={handleClose}
    >
      <div 
        className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-white/20 rounded-3xl max-w-5xl w-full overflow-hidden animate-scale-in shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid md:grid-cols-2">
          {/* Left Side - Branding */}
          <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Launch AI</h3>
                  <p className="text-sm text-white/80">Build • Deploy • Scale</p>
                </div>
              </div>

              {/* Value Props */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-1">AI Market Research</h4>
                    <p className="text-white/80 text-sm">Real competitor analysis & user insights</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-1">Production Code</h4>
                    <p className="text-white/80 text-sm">React, Node.js, PostgreSQL ready to deploy</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-1">3 Free Builds</h4>
                    <p className="text-white/80 text-sm">Start building immediately, no credit card</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="relative z-10 grid grid-cols-1 gap-3">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3">
                  <div className={`p-2 bg-gradient-to-br ${stat.color} rounded-lg`}>
                    {stat.icon}
                  </div>
                  <span className="text-white font-semibold text-sm">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-8 md:p-12 relative">
            {/* Close Button */}
            <button
              onClick={handleClose}
              disabled={loading}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>

            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">
                {mode === 'login' ? 'Welcome Back' : 'Get Started Free'}
              </h2>
              <p className="text-gray-400">
                {mode === 'login' 
                  ? 'Sign in to continue building amazing apps' 
                  : 'Create your account - 3 free app builds included!'}
              </p>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-500/20 border-2 border-green-500/50 rounded-2xl p-4 mb-6 flex items-start gap-3 animate-slide-up">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-green-300 font-semibold">{successMessage}</p>
                  <p className="text-green-400/80 text-sm mt-1">Redirecting to dashboard...</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border-2 border-red-500/50 rounded-2xl p-4 mb-6 flex items-start gap-3 animate-shake">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full bg-white/5 border-2 border-white/10 focus:border-purple-500 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none transition-all"
                      required
                      disabled={loading}
                      minLength="2"
                      maxLength="100"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border-2 border-white/10 focus:border-purple-500 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none transition-all"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border-2 border-white/10 focus:border-purple-500 rounded-xl pl-12 pr-12 py-4 text-white placeholder-gray-500 focus:outline-none transition-all"
                    required
                    disabled={loading}
                    minLength="6"
                    maxLength="100"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="text-xs text-gray-500 mt-2">At least 6 characters</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || successMessage}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                  loading || successMessage
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-purple-500/50 hover:scale-105 active:scale-95'
                }`}
              >
                {loading ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                  </>
                ) : successMessage ? (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    <span>Success!</span>
                  </>
                ) : (
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                )}
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                {' '}
                <button
                  type="button"
                  onClick={handleSwitchMode}
                  disabled={loading}
                  className="text-purple-400 hover:text-purple-300 font-bold transition-colors"
                >
                  {mode === 'login' ? 'Sign up free' : 'Sign in'}
                </button>
              </p>
            </div>

            {/* Free Trial Badge */}
            {mode === 'signup' && (
              <div className="mt-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/30 rounded-xl p-4">
                <p className="text-green-200 text-sm text-center flex items-center justify-center gap-2 font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>Free Trial: 3 app builds • No credit card required</span>
                </p>
              </div>
            )}

            {/* Terms */}
            {mode === 'signup' && (
              <p className="mt-6 text-xs text-gray-500 text-center">
                By signing up, you agree to our{' '}
                <a href="#" className="text-purple-400 hover:text-purple-300">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>
              </p>
            )}
          </div>
        </div>
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

export default LoginModal;