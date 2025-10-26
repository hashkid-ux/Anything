import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Zap, Globe, ArrowRight, Mic, X, Loader2, Brain, Code2, Rocket as RocketIcon, TrendingUp, Users, DollarSign, Target, MessageSquare } from 'lucide-react';
import Analytics from '../utils/analytics';

function BuilderInterface({ onStartBuilding }) {
  const [prompt, setPrompt] = useState('');
  const [targetCountry, setTargetCountry] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [selectedExample, setSelectedExample] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    Analytics.trackPageView('builder_interface');
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [prompt]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim().length < 10) {
      alert('Please describe your app idea in more detail (at least 10 characters)');
      return;
    }
    
    Analytics.trackAppBuildStart(prompt);
    
    const fullPrompt = targetCountry 
      ? `${prompt}\n\nTarget Market: ${targetCountry}`
      : prompt;
    
    onStartBuilding(fullPrompt);
  };

  const handleExampleClick = (example) => {
    setSelectedExample(example);
    setPrompt(example.prompt);
    setTimeout(() => setSelectedExample(null), 2000);
  };

  const examples = [
    {
      prompt: "AI-powered fitness app with personalized workout plans, meal tracking, and progress analytics for busy professionals",
      icon: <TrendingUp className="w-5 h-5" />,
      category: "Health & Fitness",
      color: "from-green-500 to-emerald-600"
    },
    {
      prompt: "B2B SaaS platform for team collaboration with real-time editing, video calls, and project management for remote teams",
      icon: <Users className="w-5 h-5" />,
      category: "Productivity",
      color: "from-blue-500 to-cyan-600"
    },
    {
      prompt: "E-commerce marketplace connecting local artisans with global buyers, featuring AR product preview and secure payments",
      icon: <DollarSign className="w-5 h-5" />,
      category: "E-commerce",
      color: "from-purple-500 to-pink-600"
    },
    {
      prompt: "Educational platform with AI tutoring, interactive quizzes, and personalized learning paths for K-12 students",
      icon: <Brain className="w-5 h-5" />,
      category: "Education",
      color: "from-orange-500 to-red-600"
    }
  ];

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Market Research",
      description: "Real competitor analysis & user insights",
      gradient: "from-purple-500/20 to-pink-500/20"
    },
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "Production Code",
      description: "React, Node.js, PostgreSQL ready",
      gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Revenue Strategy",
      description: "3-year projections & pricing models",
      gradient: "from-green-500/20 to-emerald-500/20"
    },
    {
      icon: <RocketIcon className="w-6 h-6" />,
      title: "One-Click Deploy",
      description: "Live in minutes on Vercel/Railway",
      gradient: "from-orange-500/20 to-red-500/20"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 lg:py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          {/* Floating Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full mb-8 group hover:bg-white/15 transition-all cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 rounded-full blur-md animate-pulse"></div>
              <Sparkles className="w-5 h-5 text-purple-300 relative z-10" />
            </div>
            <span className="text-sm text-white font-semibold bg-clip-text">
              Powered by Claude Sonnet 4.5 • 14 AI Agents
            </span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[1.1] tracking-tight">
            From Idea to
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Deployed App
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-pink-500 blur-2xl opacity-30 animate-pulse"></div>
            </span>
            <br />
            <span className="text-4xl md:text-5xl lg:text-6xl text-gray-300">in 3 Minutes</span>
          </h1>
          
          {/* Subheadline with stats */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            AI agents analyze your market, design your app, write production code,
            <br className="hidden md:block" />
            and deploy it live. <span className="text-white font-semibold">Not a prototype. A real business.</span>
          </p>

          {/* Social Proof Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full flex items-center gap-2 group hover:bg-white/15 transition-all">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white font-semibold">2,847 apps built today</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full flex items-center gap-2 hover:bg-white/15 transition-all">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-white font-semibold">$50M+ revenue generated</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full flex items-center gap-2 hover:bg-white/15 transition-all">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-white font-semibold">98% success rate</span>
            </div>
          </div>
        </div>

        {/* Main Input Area */}
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto mb-16">
          <div className={`relative transition-all duration-500 ${focusMode ? 'scale-105' : ''}`}>
            {/* Input Container */}
            <div className="relative bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-2 shadow-2xl transition-all duration-300 hover:border-white/30 focus-within:border-purple-500/50">
              {/* Main Textarea */}
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={() => setFocusMode(true)}
                onBlur={() => setFocusMode(false)}
                placeholder="Describe your app idea in detail... (AI will analyze market, competitors, and build it)"
                className="w-full bg-transparent text-white text-lg px-6 py-6 focus:outline-none placeholder-gray-400 resize-none min-h-[160px] leading-relaxed"
                style={{ maxHeight: '400px' }}
              />

              {/* Character Counter */}
              <div className="absolute top-4 right-6 text-xs text-gray-400">
                {prompt.length} characters
              </div>

              {/* Bottom Bar */}
              <div className="flex items-center justify-between px-4 pb-2">
                <div className="flex items-center gap-3">
                  {/* Voice Input */}
                  <button
                    type="button"
                    onClick={() => setIsListening(!isListening)}
                    className={`p-3 rounded-xl transition-all ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  {/* Advanced Options Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-gray-300 hover:bg-white/20 transition-all text-sm"
                  >
                    <Globe className="w-4 h-4" />
                    <span>{showAdvanced ? 'Hide' : 'Target Market'}</span>
                  </button>

                  {/* Word count indicator */}
                  <div className="text-sm text-gray-400">
                    {prompt.split(' ').filter(w => w).length} words
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={prompt.length < 10}
                  className={`group relative px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                    prompt.length < 10
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Zap className="w-6 h-6" />
                    <span>Build My App</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </span>
                  {prompt.length >= 10 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity -z-10"></div>
                  )}
                </button>
              </div>
            </div>

            {/* Advanced Options Panel */}
            {showAdvanced && (
              <div className="mt-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 animate-slide-down">
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Target Country/Region (Optional)
                </label>
                <input
                  type="text"
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  placeholder="e.g., India, USA, Europe, Southeast Asia..."
                  className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                />
                <p className="text-xs text-gray-400 mt-2">
                  AI will research this specific market for your app
                </p>
              </div>
            )}
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              No credit card • Free to start • Get results in 3 minutes
            </span>
          </p>
        </form>

        {/* Example Ideas Grid */}
        <div className="max-w-6xl mx-auto mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Or Try These <span className="text-purple-400">Proven Ideas</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className={`group relative bg-white/5 backdrop-blur-lg border-2 border-white/10 rounded-2xl p-6 text-left transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:scale-105 ${
                  selectedExample === example ? 'ring-2 ring-purple-500 scale-105' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 bg-gradient-to-br ${example.color} rounded-xl`}>
                    {example.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-400 font-semibold mb-2">{example.category}</div>
                    <p className="text-gray-200 leading-relaxed group-hover:text-white transition-colors">
                      {example.prompt}
                    </p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-purple-400" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            What You Get <span className="text-blue-400">Automatically</span>
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105"
              >
                <div className={`inline-flex p-4 bg-gradient-to-br ${feature.gradient} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h4 className="text-white font-bold mb-2">{feature.title}</h4>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Bar */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>14 AI Agents Active</span>
            </div>
            <div>•</div>
            <div>Web, iOS, Android</div>
            <div>•</div>
            <div>1-Click Deploy</div>
            <div>•</div>
            <div>Full Source Code</div>
          </div>
        </div>
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
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default BuilderInterface;