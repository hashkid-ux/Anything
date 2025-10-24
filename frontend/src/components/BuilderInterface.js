import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Globe, ArrowRight } from 'lucide-react';
import Analytics from '../utils/analytics';

function BuilderInterface({ onStartBuilding }) {
  const [prompt, setPrompt] = useState('');
  const [targetCountry, setTargetCountry] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    Analytics.trackPageView('builder_interface');
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim().length < 10) {
      alert('Please describe your app idea in more detail (at least 10 characters)');
      return;
    }
    
    // Track analytics
    Analytics.trackAppBuildStart(prompt);
    
    // Add country context if provided
    const fullPrompt = targetCountry 
      ? `${prompt}\n\nTarget Market: ${targetCountry}`
      : prompt;
    
    onStartBuilding(fullPrompt);
  };

  const examples = [
    "Dating app for dog owners with real-time GPS matching",
    "Fitness tracker that rewards users with crypto",
    "Local food delivery app competing with Swiggy",
    "AI-powered resume builder for freshers",
    "Telegram bot for stock market alerts"
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-4xl w-full">
        {/* Hero Text */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span className="text-sm text-purple-200 font-semibold">
              Powered by Claude Sonnet 4.5 + Multi-Agent AI
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Build Any App<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              In Minutes
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-4">
            Just describe what you want. AI does the rest.
          </p>
          
          <p className="text-sm text-gray-400">
            Market research • UI Design • Code Generation • Deployment
          </p>
        </div>

        {/* Main Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Big Prompt Box */}
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What do you want to build?&#10;&#10;Example: A dating app for pet owners in India with video profiles and AI matching..."
              className="w-full bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl px-6 py-6 text-white placeholder-gray-400 text-lg focus:outline-none focus:border-purple-500 transition-all resize-none"
              rows="6"
              style={{ 
                fontFamily: 'inherit',
                fontSize: '18px',
                lineHeight: '1.6'
              }}
            />
            <div className="absolute bottom-4 right-4 text-sm text-gray-400">
              {prompt.length} characters
            </div>
          </div>

          {/* Optional Country Selector */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              {showAdvanced ? 'Hide' : 'Add'} target country (optional)
            </button>
          </div>

          {showAdvanced && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <label className="block text-sm text-gray-300 mb-2">
                Target Country/Region (AI will research this market)
              </label>
              <input
                type="text"
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                placeholder="e.g., India, USA, Europe, Southeast Asia..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <p className="text-xs text-gray-400 mt-2">
                Leave empty for global market analysis
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={prompt.length < 10}
            className={`w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-lg px-8 py-5 rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 flex items-center justify-center gap-3 group ${
              prompt.length < 10 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Zap className="w-6 h-6" />
            <span>Build My App (Free)</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>

          <p className="text-center text-sm text-gray-400">
            No credit card • No signup • Get started in 30 seconds
          </p>
        </form>

        {/* Example Prompts */}
        <div className="mt-12">
          <p className="text-sm text-gray-400 mb-4 text-center">
            Or try one of these ideas:
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-xl p-4 text-left text-sm text-gray-300 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5 group-hover:text-purple-300" />
                  <span className="group-hover:text-white transition-colors">
                    {example}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>AI Agents Online</span>
            </div>
            <div>•</div>
            <div>Web, iOS, Android</div>
            <div>•</div>
            <div>Deploy in 1-Click</div>
            <div>•</div>
            <div>Full Source Code</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuilderInterface;