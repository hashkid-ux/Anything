import React, { useState } from 'react';
import { Rocket, Menu, X, Bell, Settings, User, Crown, Zap, LogOut, ChevronDown } from 'lucide-react';

/**
 * Standalone Header Component
 * Can be used across different pages for consistent navigation
 */
function Header({ 
  user = null, 
  onLogin, 
  onLogout, 
  onNavigate,
  showNotifications = true,
  variant = 'default' // 'default', 'transparent', 'solid'
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'Your app is ready!', unread: true },
    { id: 2, message: 'New features available', unread: true }
  ]);

  const getTierConfig = (tier) => {
    const configs = {
      free: { icon: Zap, color: 'from-gray-500 to-gray-600', label: 'Free' },
      starter: { icon: Rocket, color: 'from-blue-500 to-cyan-600', label: 'Starter' },
      premium: { icon: Crown, color: 'from-purple-500 to-pink-600', label: 'Premium' }
    };
    return configs[tier] || configs.free;
  };

  const tierConfig = user ? getTierConfig(user.tier) : getTierConfig('free');
  const TierIcon = tierConfig.icon;

  const headerClasses = {
    default: 'border-b border-white/10 backdrop-blur-xl bg-black/20',
    transparent: 'bg-transparent',
    solid: 'bg-slate-900 border-b border-white/10'
  };

  return (
    <header className={`sticky top-0 z-50 ${headerClasses[variant]}`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => onNavigate?.('home')}
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
              <NavLink onClick={() => onNavigate?.('dashboard')}>Dashboard</NavLink>
              <NavLink onClick={() => onNavigate?.('builder')}>Build New</NavLink>
              <NavLink onClick={() => onNavigate?.('pricing')}>Pricing</NavLink>
            </nav>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Live Stats (Not logged in) */}
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
                  onClick={() => onNavigate?.('pricing')}
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
                {showNotifications && (
                  <button className="relative p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                    <Bell className="w-5 h-5 text-white" />
                    {notifications.filter(n => n.unread).length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {notifications.filter(n => n.unread).length}
                      </span>
                    )}
                  </button>
                )}

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 pl-3 pr-2 py-2 rounded-xl transition-all"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden md:block text-white font-semibold text-sm max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold truncate">{user.name}</p>
                            <p className="text-gray-400 text-xs truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${tierConfig.color} px-3 py-1.5 rounded-lg text-sm`}>
                          <TierIcon className="w-3 h-3 text-white" />
                          <span className="text-white font-bold">{tierConfig.label}</span>
                          <span className="text-white/70">•</span>
                          <span className="text-white font-semibold">{user.credits} credits</span>
                        </div>
                      </div>

                      <div className="p-2">
                        <UserMenuItem icon={<User />} label="Profile" onClick={() => {}} />
                        <UserMenuItem icon={<Settings />} label="Settings" onClick={() => {}} />
                        <UserMenuItem 
                          icon={<Crown />} 
                          label="Upgrade" 
                          onClick={() => onNavigate?.('pricing')}
                          highlight 
                        />
                        <div className="h-px bg-white/10 my-2"></div>
                        <UserMenuItem 
                          icon={<LogOut />} 
                          label="Logout" 
                          onClick={onLogout}
                          danger 
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="lg:hidden p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  {showMobileMenu ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
                </button>
              </div>
            ) : (
              // Not logged in
              <div className="flex items-center gap-3">
                <button
                  onClick={onLogin}
                  className="hidden sm:block px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white font-semibold rounded-xl transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={onLogin}
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
            <MobileNavLink onClick={() => { onNavigate?.('dashboard'); setShowMobileMenu(false); }}>
              Dashboard
            </MobileNavLink>
            <MobileNavLink onClick={() => { onNavigate?.('builder'); setShowMobileMenu(false); }}>
              Build New App
            </MobileNavLink>
            <MobileNavLink onClick={() => { onNavigate?.('pricing'); setShowMobileMenu(false); }}>
              Pricing
            </MobileNavLink>
          </div>
        )}
      </div>
    </header>
  );
}

// Supporting Components
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
      <span className="w-4 h-4">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default Header;