import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader, AlertCircle, CheckCircle, Eye, EyeOff, Sparkles, Shield, Github, KeyRound } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login');
  const [otpStep, setOtpStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [oauthLoading, setOauthLoading] = useState(null);

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

    if (mode === 'signup' && otpStep === 2) {
      if (!formData.otp || formData.otp.length !== 6) {
        setError('Please enter valid 6-digit OTP');
        return false;
      }
    }

    if ((mode === 'login' || (mode === 'signup' && otpStep === 2)) && formData.password) {
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
    }

    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: formData.email,
        password: formData.password
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        setSuccessMessage('Welcome back!');
        
        setTimeout(() => {
          onLoginSuccess(response.data.user);
          setFormData({ email: '', password: '', name: '', otp: '' });
          onClose();
        }, 1500);
      }

    } catch (err) {
      console.error('Login error:', err);
      
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please check your connection.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check your internet.');
      } else if (err.response) {
        setError(err.response.data?.error || 'Login failed');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.name) {
      setError('Email and name required');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/auth/signup/request-otp`, {
        email: formData.email,
        name: formData.name
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      if (response.data.success) {
        setSuccessMessage('OTP sent to your email! Check your inbox 📧');
        setOtpStep(2);
        setTimeout(() => setSuccessMessage(''), 3000);
      }

    } catch (err) {
      console.error('OTP request error:', err);
      
      if (err.response) {
        setError(err.response.data?.error || 'Failed to send OTP');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/auth/signup/verify-otp`, {
        email: formData.email,
        name: formData.name,
        password: formData.password,
        otp: formData.otp
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        setSuccessMessage('Email verified! Account created! 🎉');
        
        setTimeout(() => {
          onLoginSuccess(response.data.user);
          setFormData({ email: '', password: '', name: '', otp: '' });
          onClose();
        }, 1500);
      }

    } catch (err) {
      console.error('OTP verify error:', err);
      
      if (err.response) {
        setError(err.response.data?.error || 'Invalid or expired OTP');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    setOauthLoading(provider);
    setError('');
    window.location.href = `${API_URL}/api/auth/oauth/${provider}`;
  };

  const handleSwitchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setOtpStep(1);
    setError('');
    setSuccessMessage('');
    setFormData({ email: '', password: '', name: '', otp: '' });
  };

  const handleClose = () => {
    setMode('login');
    setOtpStep(1);
    setFormData({ email: '', password: '', name: '', otp: '' });
    setError('');
    setSuccessMessage('');
    onClose();
  };

  const stats = [
    { icon: <Sparkles className="w-4 h-4" />, label: '10,000+ Users' },
    { icon: <Shield className="w-4 h-4" />, label: 'Bank-level Security' }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={handleClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden animate-scale-in shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-slate-800/50 border-b border-slate-700 px-6 py-5">
          <button
            onClick={handleClose}
            disabled={loading}
            className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {mode === 'login' ? 'Welcome Back' : 
                 otpStep === 2 ? 'Verify Email' : 
                 'Get Started'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'login' ? 'Sign in to continue' : 
                 otpStep === 2 ? 'Enter the code we sent' :
                 '3 free builds included'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* OAuth Buttons - Only show on login/initial signup */}
          {(mode === 'login' || (mode === 'signup' && otpStep === 1)) && (
            <>
              <div className="space-y-2 mb-6">
                <button
                  onClick={() => handleOAuthLogin('google')}
                  disabled={loading || oauthLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 border border-slate-300 rounded-xl transition-all font-medium text-slate-700 text-sm"
                >
                  {oauthLoading === 'google' ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleOAuthLogin('github')}
                  disabled={loading || oauthLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all font-medium text-white text-sm"
                >
                  {oauthLoading === 'github' ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4" />
                      <span>Continue with GitHub</span>
                    </>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-slate-900 text-slate-500 text-xs font-medium">Or with email</span>
                </div>
              </div>
            </>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 mb-4 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-300 font-medium text-sm">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-xs">{error}</p>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full bg-slate-800/50 border border-slate-700 focus:border-purple-500 rounded-lg pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none transition-all text-sm"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-800/50 border border-slate-700 focus:border-purple-500 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-slate-500 focus:outline-none transition-all text-sm"
                    required
                    disabled={loading}
                    minLength="6"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || successMessage}
                className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
                  loading || successMessage
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-purple-500/25'
                }`}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          )}

          {/* OTP SIGNUP - STEP 1: REQUEST OTP */}
          {mode === 'signup' && otpStep === 1 && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full bg-slate-800/50 border border-slate-700 focus:border-purple-500 rounded-lg pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none transition-all text-sm"
                    required
                    disabled={loading}
                    minLength="2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full bg-slate-800/50 border border-slate-700 focus:border-purple-500 rounded-lg pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none transition-all text-sm"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
                  loading
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-purple-500/25'
                }`}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Send Verification Code</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* OTP SIGNUP - STEP 2: VERIFY OTP */}
          {mode === 'signup' && otpStep === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 font-medium text-sm">Check your email</span>
                </div>
                <p className="text-xs text-blue-200">
                  We sent a 6-digit code to <strong>{formData.email}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="123456"
                    className="w-full bg-slate-800/50 border border-slate-700 focus:border-purple-500 rounded-lg pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none transition-all text-sm text-center tracking-widest font-mono text-lg"
                    required
                    disabled={loading}
                    maxLength="6"
                    pattern="[0-9]{6}"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-800/50 border border-slate-700 focus:border-purple-500 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-slate-500 focus:outline-none transition-all text-sm"
                    required
                    disabled={loading}
                    minLength="6"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">At least 6 characters</p>
              </div>

              <button
                type="submit"
                disabled={loading || successMessage}
                className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
                  loading || successMessage
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-purple-500/25'
                }`}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Verify & Create Account</span>
                  </>
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleRequestOTP}
                  disabled={loading}
                  className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Didn't receive code? Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Switch Mode */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-xs">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              {' '}
              <button
                type="button"
                onClick={handleSwitchMode}
                disabled={loading}
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                {mode === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Stats */}
          <div className="mt-6 flex items-center justify-center gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-1.5 text-slate-500 text-xs">
                {stat.icon}
                <span>{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Terms */}
          {mode === 'signup' && (
            <p className="mt-4 text-xs text-slate-500 text-center">
              By signing up, you agree to our{' '}
              <a href="#" className="text-purple-400 hover:text-purple-300">Terms</a>
              {' '}and{' '}
              <a href="#" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginModal;