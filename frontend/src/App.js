// frontend/src/App.js
// COMPLETE UI/UX REDESIGN - Production Ready

import React, { useState, useEffect } from 'react';
import { Rocket, Menu, X, Sparkles, Crown, Bell, Settings, LogOut, User, ChevronDown, Zap } from 'lucide-react';
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

const API_BASE_URL = process.env.REACT_APP_API_URL || window.location.origin;
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.timeout = 30000;

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('token') || window.location.pathname === '/auth/callback') {
      setIsOAuthCallback(true);
    }
  }, []);

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

  useEffect(() => {
    const handleShowPreview = (event) => {
      setBuildData(event.detail);
      setView('preview');
    };
    window.addEventListener('showPreview', handleShowPreview);
    return () => window.removeEventListener('showPreview', handleShowPreview);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false);
      setShowMobileMenu(false);
    };
    if (showUserMenu || showMobileMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu, showMobileMenu]);

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
    if (!data || !data.summary) {
      alert('Build completed but data is incomplete. Please try downloading from dashboard.');
      setView('dashboard');
      return;
    }
    setBuildData(data);
    setView('preview');
    if (user) await loadUserFromAPI();
  };

  const handleRetryBuild = () => setView('building');
  const handleBackToDashboard = () => {
    setView('dashboard');
    setBuildData(null);
    setUserPrompt('');
  };

  const getTierConfig = (tier) => {
    const configs = {
      free: { icon: Sparkles, color: 'from-slate-500 to-slate-600', label: 'Free', textColor: 'text-slate-400', glow: 'shadow-slate-500/20' },
      starter: { icon: Zap, color: 'from-blue-500 to-cyan-500', label: 'Starter', textColor: 'text-blue-400', glow: 'shadow-blue-500/30' },
      premium: { icon: Crown, color: 'from-purple-500 via-pink-500 to-rose-500', label: 'Premium', textColor: 'text-purple-400', glow: 'shadow-purple-500/40' }
    };
    return configs[tier] || configs.free;
  };

  const tierConfig = user ? getTierConfig(user.tier) : getTierConfig('free');
  const TierIcon = tierConfig.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isOAuthCallback) {
    return (
      <ErrorBoundary>
        <OAuthCallback onSuccess={handleOAuthSuccess} onError={handleOAuthError} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
        {/* Ambient Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Navigation */}
        {view !== 'building' && (
          <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Logo */}
                <button 
                  onClick={() => setView(user ? 'dashboard' : 'landing')}
                  className="flex items-center gap-3 group relative z-10"
                >
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300`}></div>
                    <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Rocket className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors duration-300">
                      Launch AI
                    </h1>
                  </div>
                </button>

                {/* Desktop Navigation */}
                {user && (
                  <div className="hidden lg:flex items-center gap-2">
                    <NavLink active={view === 'dashboard'} onClick={() => setView('dashboard')}>
                      Dashboard
                    </NavLink>
                    <NavLink active={view === 'builder'} onClick={() => setView('builder')}>
                      Build New
                    </NavLink>
                    <NavLink onClick={() => setShowPricingModal(true)}>
                      Pricing
                    </NavLink>
                  </div>
                )}

                {/* Right Side Actions */}
                <div className="flex items-center gap-3">
                  {user ? (
                    <>
                      {/* Tier Badge */}
                      <button
                        onClick={() => setShowPricingModal(true)}
                        className={`hidden sm:flex items-center gap-2 bg-gradient-to-r ${tierConfig.color} px-3 py-1.5 rounded-lg hover:scale-105 transition-all duration-300 ${tierConfig.glow} shadow-lg`}
                      >
                        <TierIcon className="w-3.5 h-3.5 text-white" />
                        <span className="text-white font-semibold text-xs">{tierConfig.label}</span>
                      </button>

                      {/* Credits */}
                      <div className="hidden sm:flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors duration-300">
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-white font-semibold text-xs tabular-nums">{user.credits}</span>
                      </div>

                      {/* Notifications */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowNotificationPanel(true); }}
                        className="relative p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-300 hover:scale-105"
                      >
                        <Bell className="w-4 h-4 text-white" />
                        {notifications.length > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                            {notifications.length}
                          </span>
                        )}
                      </button>

                      {/* User Menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); }}
                          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 pl-2 pr-1.5 py-1.5 rounded-lg transition-all duration-300 hover:scale-105"
                        >
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-md object-cover" />
                          ) : (
                            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <span className="hidden md:block text-white font-medium text-sm max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showUserMenu && (
                          <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-scale-in">
                            <div className="p-4 border-b border-white/10">
                              <div className="flex items-center gap-3 mb-3">
                                {user.avatar ? (
                                  <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <User className="w-6 h-6 text-white" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-semibold truncate text-sm">{user.name}</p>
                                  <p className="text-slate-400 text-xs truncate">{user.email}</p>
                                </div>
                              </div>
                              <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${tierConfig.color} px-2.5 py-1 rounded-md`}>
                                <TierIcon className="w-3 h-3 text-white" />
                                <span className="text-white font-semibold text-xs">{tierConfig.label}</span>
                                <span className="text-white/60 text-xs">•</span>
                                <span className="text-white text-xs">{user.credits} credits</span>
                              </div>
                            </div>
                            <div className="p-2">
                              <UserMenuItem icon={<User />} label="Profile" onClick={() => { setShowUserMenu(false); setShowProfileModal(true); }} />
                              <UserMenuItem icon={<Settings />} label="Settings" onClick={() => { setShowUserMenu(false); setShowSettingsModal(true); }} />
                              <UserMenuItem icon={<Crown />} label="Upgrade Plan" onClick={() => { setShowUserMenu(false); setShowPricingModal(true); }} highlight />
                              <div className="h-px bg-white/10 my-1"></div>
                              <UserMenuItem icon={<LogOut />} label="Sign Out" onClick={handleLogout} danger />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Mobile Menu Toggle */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowMobileMenu(!showMobileMenu); }}
                        className="lg:hidden p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-300"
                      >
                        {showMobileMenu ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowLoginModal(true)}
                        className="hidden sm:block px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm rounded-lg transition-all duration-300 hover:scale-105"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => setShowLoginModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-sm rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30"
                      >
                        Get Started Free
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Menu */}
              {showMobileMenu && user && (
                <div className="lg:hidden py-4 border-t border-white/10 animate-slide-down">
                  <div className="space-y-1">
                    <MobileNavLink onClick={() => { setView('dashboard'); setShowMobileMenu(false); }}>Dashboard</MobileNavLink>
                    <MobileNavLink onClick={() => { setView('builder'); setShowMobileMenu(false); }}>Build New App</MobileNavLink>
                    <MobileNavLink onClick={() => { setShowPricingModal(true); setShowMobileMenu(false); }}>Pricing</MobileNavLink>
                  </div>
                </div>
              )}
            </div>
          </nav>
        )}

        {/* Main Content */}
        <main className="relative pt-16">
          {view === 'landing' && <BuilderInterface onStartBuilding={handleStartBuilding} />}
          {view === 'dashboard' && user && (
            <Dashboard user={user} onLogout={handleLogout} onBuildNew={() => setView('builder')} onOpenPricing={() => setShowPricingModal(true)} />
          )}
          {view === 'builder' && user && <BuilderInterface onStartBuilding={handleStartBuilding} />}
          {view === 'building' && <BuildingProgress prompt={userPrompt} onComplete={handleBuildComplete} onRetry={handleRetryBuild} />}
          {view === 'preview' && buildData && <AppPreview data={buildData} onStartNew={handleBackToDashboard} />}
        </main>

        {/* Modals */}
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLoginSuccess={handleLoginSuccess} />
        <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} currentTier={user?.tier || 'free'} onUpgradeSuccess={loadUserFromAPI} />
        <NotificationPanel isOpen={showNotificationPanel} onClose={() => setShowNotificationPanel(false)} user={user} />
        <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} user={user} onUpdate={loadUserFromAPI} />
        <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} user={user} />
      </div>
    </ErrorBoundary>
  );
}

function NavLink({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
        active ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {children}
      {active && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
      )}
    </button>
  );
}

function MobileNavLink({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-2.5 text-white font-medium rounded-lg hover:bg-white/10 transition-all duration-300 text-sm"
    >
      {children}
    </button>
  );
}

function UserMenuItem({ icon, label, onClick, highlight, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
        danger 
          ? 'text-red-400 hover:bg-red-500/10' 
          : highlight
          ? 'text-purple-400 hover:bg-purple-500/10'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      {React.cloneElement(icon, { className: 'w-4 h-4' })}
      <span>{label}</span>
    </button>
  );
}

export default App;