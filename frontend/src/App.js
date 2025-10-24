import React, { useState, useEffect } from 'react';
import { Rocket } from 'lucide-react';
import BuilderInterface from './components/BuilderInterface';
import BuildingProgress from './components/BuildingProgress';
import AppPreview from './components/AppPreview';
import Dashboard from './components/Dashboard/Dashboard';
import LoginModal from './components/Auth/LoginModal';
import PricingModal from './components/Payment/PricingModal';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [view, setView] = useState('landing'); // 'landing', 'dashboard', 'builder', 'building', 'preview'
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const [buildData, setBuildData] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setView('dashboard');
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setView('landing');
  };

  const handleStartBuilding = (prompt) => {
    // Check if user is logged in
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    // Check if user has credits
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
    
    // Deduct credit
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

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Landing/Builder Interface */}
        {view === 'landing' && (
          <>
            {/* Header */}
            <header className="border-b border-white/10 backdrop-blur-xl bg-black/20 sticky top-0 z-40">
              <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Launch AI</h1>
                    <p className="text-xs text-gray-400">Idea → App in Minutes</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400 hidden md:block">
                    🔥 2,847 apps built today
                  </span>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </header>

            <BuilderInterface onStartBuilding={handleStartBuilding} />

            {/* Floating Stats */}
            <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-auto z-30">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-white">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">$50M+</div>
                    <div className="text-xs text-gray-300">Revenue Generated</div>
                  </div>
                  <div className="w-px h-10 bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">98%</div>
                    <div className="text-xs text-gray-300">Success Rate</div>
                  </div>
                  <div className="w-px h-10 bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-xs text-gray-300">AI Agents</div>
                  </div>
                </div>
              </div>
            </div>
          </>
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
          <>
            <header className="border-b border-white/10 backdrop-blur-xl bg-black/20">
              <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Launch AI</h1>
                    <p className="text-xs text-gray-400">Build New App</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 px-4 py-2 rounded-lg">
                    <span className="text-white font-semibold text-sm">
                      {user.credits} credits
                    </span>
                  </div>
                  <button
                    onClick={() => setView('dashboard')}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </header>
            <BuilderInterface onStartBuilding={handleStartBuilding} />
          </>
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
      </div>
    </ErrorBoundary>
  );
}

export default App;