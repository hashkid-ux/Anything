// frontend/src/components/BuilderInterface.js
// COMPLETE UI/UX REDESIGN with Full Logic Integration

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Zap, Globe, ArrowRight, Mic, X, Brain, Code2, 
  Rocket, TrendingUp, Users, DollarSign, Target, CheckCircle,
  BarChart3, Layers, Database, Shield, Clock
} from 'lucide-react';

function BuilderInterface({ onStartBuilding }) {
  const [prompt, setPrompt] = useState('');
  const [targetCountry, setTargetCountry] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [selectedExample, setSelectedExample] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 400);
      textareaRef.current.style.height = newHeight + 'px';
    }
    setCharCount(prompt.length);
  }, [prompt]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim().length < 10) {
      alert('Please describe your app idea in more detail (at least 10 characters)');
      return;
    }
    const fullPrompt = targetCountry ? `${prompt}\n\nTarget Market: ${targetCountry}` : prompt;
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
      color: "from-green-500 to-emerald-500",
      popular: true
    },
    {
      prompt: "B2B SaaS platform for team collaboration with real-time editing, video calls, and project management for remote teams",
      icon: <Users className="w-5 h-5" />,
      category: "Productivity",
      color: "from-blue-500 to-cyan-500",
      popular: true
    },
    {
      prompt: "E-commerce marketplace connecting local artisans with global buyers, featuring AR product preview and secure payments",
      icon: <DollarSign className="w-5 h-5" />,
      category: "E-commerce",
      color: "from-purple-500 to-pink-500",
      popular: false
    },
    {
      prompt: "Educational platform with AI tutoring, interactive quizzes, and personalized learning paths for K-12 students",
      icon: <Brain className="w-5 h-5" />,
      category: "Education",
      color: "from-orange-500 to-red-500",
      popular: false
    }
  ];

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Market Research",
      description: "Real competitor analysis & user insights",
      gradient: "from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-500/20",
      iconBg: "from-purple-500 to-pink-500"
    },
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "Production Code",
      description: "React, Node.js, PostgreSQL ready",
      gradient: "from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-500/20",
      iconBg: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Revenue Strategy",
      description: "3-year projections & pricing models",
      gradient: "from-green-500/10 to-emerald-500/10",
      borderColor: "border-green-500/20",
      iconBg: "from-green-500 to-emerald-500"
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "One-Click Deploy",
      description: "Live in minutes on Vercel/Railway",
      gradient: "from-orange-500/10 to-red-500/10",
      borderColor: "border-orange-500/20",
      iconBg: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { label: "Apps Built Today", value: "2,847", icon: <Rocket className="w-4 h-4" />, color: "text-blue-400" },
    { label: "Revenue Generated", value: "$50M+", icon: <DollarSign className="w-4 h-4" />, color: "text-green-400" },
    { label: "Success Rate", value: "98%", icon: <Target className="w-4 h-4" />, color: "text-purple-400" },
    { label: "Avg Build Time", value: "3 min", icon: <Clock className="w-4 h-4" />, color: "text-orange-400" }
  ];

  return (
    <div className="min-h-screen relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          {/* Floating Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-6 sm:mb-8 group hover:bg-white/10 hover:scale-105 transition-all duration-300">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 rounded-full blur-md animate-pulse"></div>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300 relative z-10" />
            </div>
            <span className="text-xs sm:text-sm text-white font-semibold">
              Powered by Claude Sonnet 4.5
            </span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 sm:mb-8 leading-tight tracking-tight">
            From Idea to
            <br />
            <span className="relative inline-block mt-2">
              <span className="relative z-10 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Deployed App
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-pink-500 blur-2xl opacity-20 animate-pulse"></div>
            </span>
            <br />
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-slate-300 mt-2 inline-block">in 3 Minutes</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            AI agents analyze your market, design your app, write production code,
            <br className="hidden sm:block" />
            and deploy it live. <span className="text-white font-semibold">Not a prototype. A real business.</span>
          </p>

          {/* Stats Pills */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 px-3 sm:px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/10 hover:scale-105 transition-all duration-300">
                <div className={stat.color}>{stat.icon}</div>
                <div className="text-left">
                  <div className="text-white font-bold text-xs sm:text-sm tabular-nums">{stat.value}</div>
                  <div className="text-slate-500 text-[10px] sm:text-xs">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Input Area */}
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto mb-12 sm:mb-16">
          <div className={`relative transition-all duration-500 ${focusMode ? 'scale-105' : ''}`}>
            {/* Input Container */}
            <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl transition-all duration-300 hover:border-white/20 focus-within:border-purple-500/50 focus-within:shadow-purple-500/20">
              {/* Main Textarea */}
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={() => setFocusMode(true)}
                onBlur={() => setFocusMode(false)}
                placeholder="Describe your app idea in detail... (AI will analyze market, competitors, and build it)"
                className="w-full bg-transparent text-white text-base sm:text-lg px-3 sm:px-6 py-4 sm:py-6 focus:outline-none placeholder-slate-500 resize-none min-h-[140px] sm:min-h-[160px] leading-relaxed"
                style={{ maxHeight: '400px' }}
              />

              {/* Character Counter */}
              <div className="absolute top-3 sm:top-4 right-3 sm:right-6 text-xs text-slate-500">
                {charCount} characters
              </div>

              {/* Bottom Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 px-2 sm:px-4 pb-2">
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-start">
                  {/* Voice Input */}
                  <button
                    type="button"
                    onClick={() => setIsListening(!isListening)}
                    className={`p-2 sm:p-3 rounded-xl transition-all duration-300 ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse scale-110' 
                        : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:scale-105'
                    }`}
                  >
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  {/* Advanced Options Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 rounded-xl text-slate-300 hover:bg-white/20 hover:scale-105 transition-all duration-300 text-xs sm:text-sm"
                  >
                    <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{showAdvanced ? 'Hide' : 'Target Market'}</span>
                    <span className="sm:hidden">Market</span>
                  </button>

                  {/* Word count */}
                  <div className="text-xs sm:text-sm text-slate-400 hidden sm:block">
                    {prompt.split(' ').filter(w => w).length} words
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={prompt.length < 10}
                  className={`group relative px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg transition-all duration-300 w-full sm:w-auto ${
                    prompt.length < 10
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2 sm:gap-3">
                    <Zap className="w-4 h-4 sm:w-6 sm:h-6" />
                    <span>Build My App</span>
                    <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" />
                  </span>
                  {prompt.length >= 10 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity -z-10"></div>
                  )}
                </button>
              </div>
            </div>

            {/* Advanced Options Panel */}
            {showAdvanced && (
              <div className="mt-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 animate-slide-down">
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Target Country/Region (Optional)
                </label>
                <input
                  type="text"
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  placeholder="e.g., India, USA, Europe, Southeast Asia..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:bg-white/15 transition-all duration-300"
                />
                <p className="text-xs text-slate-400 mt-2">
                  AI will research this specific market for your app
                </p>
              </div>
            )}
          </div>

          <p className="text-center text-xs sm:text-sm text-slate-400 mt-4 sm:mt-6">
            <span className="inline-flex items-center gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
              No credit card • Free to start • Get results in 3 minutes
            </span>
          </p>
        </form>

        {/* Example Ideas Grid */}
        <div className="max-w-6xl mx-auto mb-12 sm:mb-16">
          <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-6 sm:mb-8">
            Or Try These <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Proven Ideas</span>
          </h3>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className={`group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:scale-105 ${
                  selectedExample === example ? 'ring-2 ring-purple-500 scale-105' : ''
                }`}
              >
                {example.popular && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                    POPULAR
                  </div>
                )}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`p-2 sm:p-3 bg-gradient-to-br ${example.color} rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                    {example.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-400 font-semibold mb-1 sm:mb-2">{example.category}</div>
                    <p className="text-slate-200 text-sm sm:text-base leading-relaxed group-hover:text-white transition-colors line-clamp-3">
                      {example.prompt}
                    </p>
                  </div>
                </div>
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mb-12 sm:mb-16">
          <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-6 sm:mb-8">
            What You Get <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Automatically</span>
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group bg-gradient-to-br ${feature.gradient} backdrop-blur-xl border ${feature.borderColor} rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-all duration-300`}
              >
                <div className={`inline-flex p-3 sm:p-4 bg-gradient-to-br ${feature.iconBg} rounded-xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <h4 className="text-white font-bold mb-2 text-sm sm:text-base">{feature.title}</h4>
                <p className="text-slate-400 text-xs sm:text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Bar */}
        <div className="text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-8 text-xs sm:text-sm text-slate-400 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-4 sm:px-8 py-3 sm:py-4">
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
              <span>14 AI Agents Active</span>
            </div>
            <div className="hidden sm:block">•</div>
            <div className="flex items-center gap-2">
              <Layers className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
              <span>Web, iOS, Android</span>
            </div>
            <div className="hidden sm:block">•</div>
            <div className="flex items-center gap-2">
              <Database className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
              <span>Full Source Code</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuilderInterface;