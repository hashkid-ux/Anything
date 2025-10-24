import React from 'react';
import { Rocket, Crown, Zap } from 'lucide-react';

function Header({ userTier }) {
  const tierConfig = {
    free: { icon: Zap, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Free' },
    starter: { icon: Rocket, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Starter' },
    premium: { icon: Crown, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Premium' }
  };

  const config = tierConfig[userTier];
  const TierIcon = config.icon;

  return (
    <header className="glass-effect sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Launch AI</h1>
              <p className="text-xs text-gray-500">Build Your Empire</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Features
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Pricing
            </a>
            <a href="#case-studies" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Success Stories
            </a>
          </nav>

          {/* User Tier Badge */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${config.bg} ${config.color} px-4 py-2 rounded-lg font-semibold`}>
              <TierIcon className="w-4 h-4" />
              <span className="text-sm">{config.label}</span>
            </div>
            
            {userTier === 'free' && (
              <button className="button-premium text-sm">
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;