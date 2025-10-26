import React, { useState, useEffect } from 'react';
import { Rocket, Menu, X, Sparkles, Crown, Bell, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import BuilderInterface from './components/BuilderInterface';
import BuildingProgress from './components/BuildingProgress';
import AppPreview from './components/AppPreview';
import Dashboard from './components/Dashboard/Dashboard';
import LoginModal from './components/Auth/LoginModal';
import OAuthCallback from './components/Auth/OAuthCallback';
import PricingModal from './components/Payment/PricingModal';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const [buildData, setBuildData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isOAuthCallback, setIsOAuthCallback] = useState(false);

  // Check if current URL is OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('token') || window.location.pathname === '/auth/callback') {
      setIsOAuthCallback(true);
    }
  }, []);

  // Check if user is logged in on mount
  useEffect(() => {
    // Don't auto-login if we're in OAuth callback
    if (isOAuthCallback) return;

    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setView('dashboard');
      } catch (e) {
        console.error('Failed to parse saved user:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    // Simulated notifications
    if (user) {
      setNotifications([
        { id: 1, message: 'Your app is ready to deploy!', unread: true },
        { id: 2, message: 'New AI features available', unread: true }
      ]);
    }
  }, [isOAuthCallback]);

  // Close menus when clicking outside
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

  // Handle OAuth callback success
  const handleOAuthSuccess = (userData) => {
    console.log('OAuth success:', userData);
    setUser(userData);
    setIsOAuthCallback(false);
    setView('dashboard');
  };

  // Handle OAuth callback error
  const handleOAuthError = (error) => {
    console.error('OAuth error:', error);
    setIsOAuthCallback(false);
    setView('landing');
    setShowLoginModal(true);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setView('landing');
    setShowUserMenu(false);
  };

  const handleStartBuilding = (prompt) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (user.credits <= 0) {
      setShowPricingModal(true);
      return;
    }

    setUserPrompt(prompt);
    setView('building');
  };

  const handleBuildComplete = (data) => {
    setBuildData(data);
    setView('preview');
    
    if (user) {
      const updatedUser = { ...user, credits: user.credits - 1 };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const handleUpgradeSuccess = (newTier) => {
    const updatedUser = { ...user, tier: newTier };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
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

  // Show OAuth callback handler
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
        {/* Global Navigation Header */}
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

                {/* Desktop Navigation */}
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

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">
                  {/* Live Stats (when not logged in) */}
                  {!user && (
                    <div className="hidden md:flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>2,847 apps today</span>
                      </div>
                    </div>
                  )}

                  {/* User Section */}
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
                      <button className="relative p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                        <Bell className="w-5 h-5 text-white" />
                        {notifications.filter(n => n.unread).length > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {notifications.filter(n => n.unread).length}
                          </span>
                        )}
                      </button>

                      {/* User Avatar & Menu */}
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

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                          <div 
                            className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-slide-down"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* User Info */}
                            <div className="p-4 border-b border-white/10">
                              <div className="flex items-center gap-3 mb-3">
                                {user.avatar ? (
                                  <img 
                                    src={user.avatar} 
                                    alt={user.name}
                                    className="w-12 h-12 rounded-xl object-cover"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <User className="w-6 h-6 text-white" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-bold truncate">{user.name}</p>
                                  <p className="text-gray-400 text-xs truncate">{user.email}</p>
                                  {user.provider && (
                                    <p className="text-gray-500 text-xs mt-1">via {user.provider}</p>
                                  )}
                                </div>
                              </div>
                              <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${tierConfig.color} px-3 py-1.5 rounded-lg text-sm`}>
                                <TierIcon className="w-3 h-3 text-white" />
                                <span className="text-white font-bold">{tierConfig.label}</span>
                                <span className="text-white/70">•</span>
                                <span className="text-white font-semibold">{user.credits} credits</span>
                              </div>
                            </div>

                            {/* Menu Items */}
                            <div className="p-2">
                              <UserMenuItem 
                                icon={<User className="w-4 h-4" />}
                                label="My Profile"
                                onClick={() => {}}
                              />
                              <UserMenuItem 
                                icon={<Settings className="w-4 h-4" />}
                                label="Settings"
                                onClick={() => {}}
                              />
                              <UserMenuItem 
                                icon={<Crown className="w-4 h-4" />}
                                label="Upgrade Plan"
                                onClick={() => {
                                  setShowUserMenu(false);
                                  setShowPricingModal(true);
                                }}
                                highlight
                              />
                              <div className="h-px bg-white/10 my-2"></div>
                              <UserMenuItem 
                                icon={<LogOut className="w-4 h-4" />}
                                label="Logout"
                                onClick={handleLogout}
                                danger
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Mobile Menu Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMobileMenu(!showMobileMenu);
                        }}
                        className="lg:hidden p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                      >
                        {showMobileMenu ? (
                          <X className="w-6 h-6 text-white" />
                        ) : (
                          <Menu className="w-6 h-6 text-white" />
                        )}
                      </button>
                    </div>
                  ) : (
                    // Not logged in
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowLoginModal(true)}
                        className="hidden sm:block px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white font-semibold rounded-xl transition-all"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => setShowLoginModal(true)}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg hover:shadow-purple-500/50"
                      >
                        Get Started Free
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Menu */}
              {showMobileMenu && user && (
                <div className="lg:hidden mt-4 py-4 border-t border-white/10 space-y-2 animate-slide-down">
                  <MobileNavLink onClick={() => { setView('dashboard'); setShowMobileMenu(false); }}>
                    Dashboard
                  </MobileNavLink>
                  <MobileNavLink onClick={() => { setView('builder'); setShowMobileMenu(false); }}>
                    Build New App
                  </MobileNavLink>
                  <MobileNavLink onClick={() => { setShowPricingModal(true); setShowMobileMenu(false); }}>
                    Upgrade Plan
                  </MobileNavLink>
                </div>
              )}
            </div>
          </header>
        )}

        {/* Main Content Area */}
        <main className="relative">
          {/* Landing/Builder Interface */}
          {view === 'landing' && (
            <BuilderInterface onStartBuilding={handleStartBuilding} />
          )}

          {/* Dashboard */}
          {view === 'dashboard' && user && (
            <Dashboard
              user={user}
              onLogout={handleLogout}
              onBuildNew={() => setView('builder')}
              onOpenPricing={() => setShowPricingModal(true)}
            />
          )}

          {/* Builder (when logged in) */}
          {view === 'builder' && user && (
            <BuilderInterface onStartBuilding={handleStartBuilding} />
          )}

          {/* Building Progress */}
          {view === 'building' && (
            <BuildingProgress 
              prompt={userPrompt} 
              onComplete={handleBuildComplete}
            />
          )}

          {/* Preview Results */}
          {view === 'preview' && buildData && (
            <AppPreview 
              data={buildData}
              onStartNew={() => {
                setView('dashboard');
                setUserPrompt('');
                setBuildData(null);
              }}
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
          onUpgradeSuccess={handleUpgradeSuccess}
        />

        {/* Floating Action Button (Mobile - when logged in) */}
        {user && view === 'dashboard' && (
          <button
            onClick={() => setView('builder')}
            className="lg:hidden fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40"
          >
            <Rocket className="w-8 h-8" />
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </ErrorBoundary>
  );
}

// Navigation Link Component
function NavLink({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
        active 
          ? 'text-white' 
          : 'text-gray-400 hover:text-white'
      }`}
    >
      {children}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
      )}
    </button>
  );
}

// Mobile Navigation Link
function MobileNavLink({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
    >
      {children}
    </button>
  );
}

// User Menu Item Component
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
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default App;