// frontend/src/App.js
// FULLY FIXED - Production Ready with Environment Variables

import React, { useState, useEffect } from 'react';
import { Rocket, Menu, X, Sparkles, Crown, Bell, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import axios from 'axios';
import BuilderInterface from './components/BuilderInterface';
import BuildingProgress from './components/BuildingProgress';
import AppPreview from './components/AppPreview';
import Dashboard from './components/Dashboard/Dashboard';
import LoginModal from './components/Auth/LoginModal';
import OAuthCallback from './components/Auth/OAuthCallback';
import PricingModal from './components/Payment/PricingModal';
import NotificationPanel from './components/Notifications/NotificationPanel';
import SettingsModal from './components/Settings/SettingsModal';
import ProfileModal from './components/Profile/ProfileModal';
import ErrorBoundary from './components/ErrorBoundary';

// CRITICAL FIX: Configure axios with environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || window.location.origin;
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.timeout = 30000;

console.log('🔗 API Base URL:', API_BASE_URL);

function App() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const [buildData, setBuildData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isOAuthCallback, setIsOAuthCallback] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('token') || window.location.pathname === '/auth/callback') {
      setIsOAuthCallback(true);
    }
  }, []);

  // Load user on mount
  useEffect(() => {
    if (isOAuthCallback) return;
    
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUserFromAPI();
    } else {
      setLoading(false);
    }
  }, [isOAuthCallback]);

  // CRITICAL FIX: Listen for preview event from Dashboard
  useEffect(() => {
    const handleShowPreview = (event) => {
      console.log('📊 Preview event received:', event.detail);
      setBuildData(event.detail);
      setView('preview');
    };

    window.addEventListener('showPreview', handleShowPreview);
    return () => window.removeEventListener('showPreview', handleShowPreview);
  }, []);

  const loadUserFromAPI = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      if (response.data) {
        setUser(response.data);
        setView('dashboard');
        loadNotifications(response.data.id);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async (userId) => {
    try {
      const response = await axios.get('/api/notifications', {
        params: { unread: true, limit: 5 }
      });
      if (response.data?.notifications) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleOAuthSuccess = async (userData) => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    await loadUserFromAPI();
    setIsOAuthCallback(false);
  };

  const handleOAuthError = (error) => {
    console.error('OAuth error:', error);
    setIsOAuthCallback(false);
    setView('landing');
    setShowLoginModal(true);
  };

  const handleLoginSuccess = async (userData) => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    await loadUserFromAPI();
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setView('landing');
    setShowUserMenu(false);
  };

  const handleStartBuilding = async (prompt) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (user.credits <= 0) {
      setShowPricingModal(true);
      return;
    }

    // CRITICAL FIX: Use credit endpoint
    try {
      await axios.post('/api/auth/use-credit');
      await loadUserFromAPI();
    } catch (error) {
      console.error('Failed to use credit:', error);
      if (error.response?.status === 403) {
        setShowPricingModal(true);
        return;
      }
    }

    setUserPrompt(prompt);
    setView('building');
  };

  const handleBuildComplete = async (data) => {
    console.log('✅ Build complete:', data);
    
    // CRITICAL FIX: Validate data structure
    if (!data || !data.summary) {
      console.error('❌ Invalid build data:', data);
      alert('Build completed but data is incomplete. Please try downloading from dashboard.');
      setView('dashboard');
      return;
    }

    setBuildData(data);
    setView('preview');
    
    if (user) {
      await loadUserFromAPI();
    }
  };

  const handleRetryBuild = () => {
    setView('building');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setBuildData(null);
    setUserPrompt('');
  };

  const getTierConfig = (tier) => {
    const configs = {
      free: { 
        icon: Sparkles, 
        color: 'from-gray-500 to-gray-600', 
        label: 'Free',
        textColor: 'text-gray-400'
      },
      starter: { 
        icon: Rocket, 
        color: 'from-blue-500 to-cyan-600', 
        label: 'Starter',
        textColor: 'text-blue-400'
      },
      premium: { 
        icon: Crown, 
        color: 'from-purple-500 to-pink-600', 
        label: 'Premium',
        textColor: 'text-purple-400'
      }
    };
    return configs[tier] || configs.free;
  };

  const tierConfig = user ? getTierConfig(user.tier) : getTierConfig('free');
  const TierIcon = tierConfig.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (isOAuthCallback) {
    return (
      <ErrorBoundary>
        <OAuthCallback 
          onSuccess={handleOAuthSuccess}
          onError={handleOAuthError}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
        {/* Global Navigation - Hide during building */}
        {view !== 'building' && (
          <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-black/20">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                {/* Logo */}
                <button 
                  onClick={() => setView(user ? 'dashboard' : 'landing')}
                  className="flex items-center gap-3 group"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                      <Rocket className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-black text-white group-hover:text-purple-300 transition-colors">
                      Launch AI
                    </h1>
                    <p className="text-xs text-gray-400 font-medium">Build • Deploy • Scale</p>
                  </div>
                </button>

                {/* Desktop Nav */}
                {user && (
                  <nav className="hidden lg:flex items-center gap-6">
                    <NavLink 
                      active={view === 'dashboard'} 
                      onClick={() => setView('dashboard')}
                    >
                      Dashboard
                    </NavLink>
                    <NavLink 
                      active={view === 'builder'} 
                      onClick={() => setView('builder')}
                    >
                      Build New
                    </NavLink>
                    <NavLink onClick={() => setShowPricingModal(true)}>
                      Pricing
                    </NavLink>
                  </nav>
                )}

                {/* Right Side */}
                <div className="flex items-center gap-4">
                  {user ? (
                    <div className="flex items-center gap-3">
                      {/* Tier Badge */}
                      <button
                        onClick={() => setShowPricingModal(true)}
                        className={`hidden sm:flex items-center gap-2 bg-gradient-to-r ${tierConfig.color} px-4 py-2 rounded-xl hover:scale-105 transition-transform`}
                      >
                        <TierIcon className="w-4 h-4 text-white" />
                        <span className="text-white font-bold text-sm">{tierConfig.label}</span>
                      </button>

                      {/* Credits */}
                      <div className="hidden sm:block bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl">
                        <span className="text-white font-bold text-sm tabular-nums">
                          {user.credits} credits
                        </span>
                      </div>

                      {/* Notifications */}
                      <button 
                        onClick={() => setShowNotificationPanel(true)}
                        className="relative p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                      >
                        <Bell className="w-5 h-5 text-white" />
                        {notifications.length > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {notifications.length}
                          </span>
                        )}
                      </button>

                      {/* User Menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowUserMenu(!showUserMenu);
                          }}
                          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 pl-3 pr-2 py-2 rounded-xl transition-all group"
                        >
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.name}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <span className="hidden md:block text-white font-semibold text-sm max-w-[100px] truncate">
                            {user.name}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown */}
                        {showUserMenu && (
                          <div 
                            className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="p-2">
                              <UserMenuItem 
                                icon={<User />}
                                label="Profile"
                                onClick={() => { setShowUserMenu(false); setShowProfileModal(true); }}
                              />
                              <UserMenuItem 
                                icon={<Settings />}
                                label="Settings"
                                onClick={() => { setShowUserMenu(false); setShowSettingsModal(true); }}
                              />
                              <UserMenuItem 
                                icon={<Crown />}
                                label="Upgrade"
                                onClick={() => { setShowUserMenu(false); setShowPricingModal(true); }}
                                highlight
                              />
                              <div className="h-px bg-white/10 my-2"></div>
                              <UserMenuItem 
                                icon={<LogOut />}
                                label="Logout"
                                onClick={handleLogout}
                                danger
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowLoginModal(true)}
                        className="hidden sm:block px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-all"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => setShowLoginModal(true)}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all hover:scale-105"
                      >
                        Get Started Free
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className="relative">
          {view === 'landing' && (
            <BuilderInterface onStartBuilding={handleStartBuilding} />
          )}

          {view === 'dashboard' && user && (
            <Dashboard
              user={user}
              onLogout={handleLogout}
              onBuildNew={() => setView('builder')}
              onOpenPricing={() => setShowPricingModal(true)}
            />
          )}

          {view === 'builder' && user && (
            <BuilderInterface onStartBuilding={handleStartBuilding} />
          )}

          {view === 'building' && (
            <BuildingProgress 
              prompt={userPrompt} 
              onComplete={handleBuildComplete}
              onRetry={handleRetryBuild}
            />
          )}

          {view === 'preview' && buildData && (
            <AppPreview 
              data={buildData}
              onStartNew={handleBackToDashboard}
            />
          )}
        </main>

        {/* Modals */}
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />

        <PricingModal
          isOpen={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          currentTier={user?.tier || 'free'}
          onUpgradeSuccess={loadUserFromAPI}
        />

        <NotificationPanel
          isOpen={showNotificationPanel}
          onClose={() => setShowNotificationPanel(false)}
          user={user}
        />

        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          user={user}
          onUpdate={loadUserFromAPI}
        />

        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={user}
        />
      </div>
    </ErrorBoundary>
  );
}

function NavLink({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
        active ? 'text-white' : 'text-gray-400 hover:text-white'
      }`}
    >
      {children}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
      )}
    </button>
  );
}

function UserMenuItem({ icon, label, onClick, highlight, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        danger 
          ? 'text-red-400 hover:bg-red-500/10' 
          : highlight
          ? 'text-purple-400 hover:bg-purple-500/10'
          : 'text-gray-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      {React.cloneElement(icon, { className: 'w-4 h-4' })}
      <span>{label}</span>
    </button>
  );
}

export default App;