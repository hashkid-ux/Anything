// frontend/src/components/BuildingProgress.js
// COMPLETE UI/UX REDESIGN with Real-time Progress Tracking

import React, { useState, useEffect } from 'react';
import { 
  Loader, Check, Brain, Code, Database, Rocket, FileCode, 
  AlertCircle, RefreshCw, Zap, TrendingUp, BarChart3, CheckCircle2
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || window.location.origin;

function BuildingProgress({ prompt, onComplete, onRetry }) {
  const [buildId, setBuildId] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [progress, setProgress] = useState({ 
    phase: 'initializing', 
    progress: 0, 
    message: 'Starting build...' 
  });
  const [stats, setStats] = useState({
    filesGenerated: 0,
    linesOfCode: 0,
    competitorsAnalyzed: 0,
    reviewsScanned: 0
  });
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    console.log('🔗 API Base URL:', API_BASE_URL);
    startBuild();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    if (!buildId) return;
    let isActive = true;

    const pollBuild = async () => {
      if (!isActive) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/api/master/build/${buildId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const data = response.data;
        setProgress({
          phase: data.phase || 'building',
          progress: data.progress || 0,
          message: data.message || 'Building...'
        });

        if (data.logs && Array.isArray(data.logs)) {
          setLogs(data.logs.slice(-20));
        }

        if (data.stats) {
          setStats({
            filesGenerated: data.stats.filesGenerated || 0,
            linesOfCode: data.stats.linesOfCode || 0,
            competitorsAnalyzed: data.stats.competitorsAnalyzed || 0,
            reviewsScanned: data.stats.reviewsScanned || 0
          });
        }

        if (data.status === 'completed') {
          isActive = false;
          const completeResults = {
            ...data.results,
            download_url: data.download_url || data.results?.download_url,
            summary: data.results?.summary || {
              files_generated: data.stats?.filesGenerated || 0,
              lines_of_code: data.stats?.linesOfCode || 0,
              competitors_analyzed: data.stats?.competitorsAnalyzed || 0,
              reviews_scanned: data.stats?.reviewsScanned || 0,
              qa_score: data.results?.summary?.qa_score || 0,
              deployment_ready: data.results?.summary?.deployment_ready || false
            }
          };
          setTimeout(() => onComplete(completeResults), 1000);
        }

        if (data.status === 'failed') {
          isActive = false;
          setError(data.error || 'Build failed');
        }
      } catch (error) {
        console.error('Poll error:', error);
        if (error.response?.status === 404 || error.response?.status === 500) {
          isActive = false;
          setError(error.response?.data?.error || 'Build not found. Please try again.');
        }
      }
    };

    pollBuild();
    const interval = setInterval(pollBuild, 2000);
    return () => { isActive = false; clearInterval(interval); };
  }, [buildId, API_BASE_URL, onComplete]);

  const startBuild = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to build apps');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/master/build`,
        {
          projectName: extractProjectName(prompt),
          description: prompt,
          targetCountry: 'Global',
          features: [],
          framework: 'react',
          database: 'postgresql',
          targetPlatform: 'web'
        },
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }}
      );

      if (response.data.error) throw new Error(response.data.error);
      const { build_id, project_id } = response.data;
      setBuildId(build_id);
      setProjectId(project_id);
      addLog('🚀 Build started successfully!');
    } catch (error) {
      console.error('❌ Build start failed:', error);
      setError(error.response?.data?.error || error.message || 'Failed to start build');
    }
  };

  const addLog = (message) => {
    setLogs(prev => [...prev, { message, timestamp: new Date().toISOString() }].slice(-20));
  };

  const extractProjectName = (prompt) => {
    const words = prompt.split(' ').slice(0, 5).join(' ');
    return words.length > 50 ? words.substring(0, 50) : words;
  };

  const handleRetry = () => {
    setError(null);
    setProgress({ phase: 'initializing', progress: 0, message: 'Retrying...' });
    setStats({ filesGenerated: 0, linesOfCode: 0, competitorsAnalyzed: 0, reviewsScanned: 0 });
    setLogs([]);
    setBuildId(null);
    setProjectId(null);
    startBuild();
  };

  const phases = [
    { id: 'research', name: 'Market Research', icon: Brain, range: [0, 30], color: 'from-purple-500 to-pink-500' },
    { id: 'strategy', name: 'Strategy', icon: Rocket, range: [30, 50], color: 'from-blue-500 to-cyan-500' },
    { id: 'code', name: 'Code Generation', icon: Code, range: [50, 85], color: 'from-green-500 to-emerald-500' },
    { id: 'testing', name: 'Quality Assurance', icon: Database, range: [85, 95], color: 'from-orange-500 to-red-500' },
    { id: 'packaging', name: 'Packaging', icon: FileCode, range: [95, 100], color: 'from-yellow-500 to-amber-500' }
  ];

  const currentPhaseIndex = phases.findIndex(p => p.id === progress.phase);
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-2xl border border-red-500/30 rounded-2xl p-8 text-center animate-scale-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full mb-6 animate-pulse">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Build Failed</h2>
          <p className="text-red-300 mb-6 leading-relaxed">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Retry Build
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header with Progress Circle */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="relative inline-block mb-6">
            {/* Animated Circle Progress */}
            <svg className="w-32 h-32 sm:w-40 sm:h-40 -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(progress.progress / 100) * 283} 283`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl sm:text-5xl font-black text-white">{progress.progress}%</div>
              <div className="text-xs text-slate-400 mt-1">Complete</div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">Building Your App</h1>
          <p className="text-purple-300 text-base sm:text-lg mb-2">{progress.message}</p>
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
            <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span>{minutes}:{String(seconds).padStart(2, '0')} elapsed</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
          <StatCard 
            icon={<FileCode />} 
            label="Files" 
            value={stats.filesGenerated} 
            color="from-blue-500 to-cyan-500"
            animating={stats.filesGenerated > 0} 
          />
          <StatCard 
            icon={<Code />} 
            label="Lines" 
            value={stats.linesOfCode.toLocaleString()} 
            color="from-green-500 to-emerald-500"
            animating={stats.linesOfCode > 0} 
          />
          <StatCard 
            icon={<Brain />} 
            label="Competitors" 
            value={stats.competitorsAnalyzed} 
            color="from-purple-500 to-pink-500"
            animating={stats.competitorsAnalyzed > 0} 
          />
          <StatCard 
            icon={<BarChart3 />} 
            label="Reviews" 
            value={stats.reviewsScanned} 
            color="from-orange-500 to-red-500"
            animating={stats.reviewsScanned > 0} 
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Phases Progress */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {phases.map((phase, index) => {
              const PhaseIcon = phase.icon;
              const isActive = currentPhaseIndex === index;
              const isCompleted = currentPhaseIndex > index;
              const progressInPhase = isActive 
                ? Math.min(100, Math.max(0, ((progress.progress - phase.range[0]) / (phase.range[1] - phase.range[0])) * 100))
                : isCompleted ? 100 : 0;

              return (
                <div 
                  key={phase.id} 
                  className={`relative bg-white/5 backdrop-blur-xl border rounded-xl p-4 sm:p-5 transition-all duration-500 ${
                    isActive ? 'border-white/30 scale-105 shadow-2xl' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Icon */}
                    <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all duration-500 ${
                      isCompleted 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 scale-110' 
                        : isActive 
                        ? `bg-gradient-to-br ${phase.color} scale-110 animate-pulse` 
                        : 'bg-white/10'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      ) : (
                        <PhaseIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      )}
                      {isActive && (
                        <div className={`absolute inset-0 bg-gradient-to-br ${phase.color} rounded-xl blur-xl opacity-50 animate-pulse`}></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-bold text-sm sm:text-base transition-colors ${
                          isActive ? 'text-white' : 'text-slate-400'
                        }`}>
                          {phase.name}
                        </h3>
                        <span className="text-lg sm:text-xl font-bold text-white tabular-nums">
                          {Math.round(progressInPhase)}%
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            isCompleted 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                              : isActive 
                              ? `bg-gradient-to-r ${phase.color}` 
                              : 'bg-white/20'
                          }`}
                          style={{ width: `${progressInPhase}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Activity Log */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
            <div className="bg-white/5 px-4 sm:px-5 py-3 sm:py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-bold text-sm sm:text-base">Live Activity</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-medium">LIVE</span>
              </div>
            </div>
            <div className="p-3 sm:p-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto font-mono text-xs scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {logs.length === 0 ? (
                <div className="text-center py-12">
                  <Loader className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-500" />
                  <p className="text-slate-500 text-xs">Initializing AI agents...</p>
                </div>
              ) : (
                logs.slice().reverse().map((log, i) => (
                  <div 
                    key={i} 
                    className="text-slate-300 mb-2 hover:bg-white/5 p-2 rounded transition-colors animate-slide-in-right"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <span className="text-slate-500 mr-2 text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-xs">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 sm:mt-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-blue-300 font-semibold text-base sm:text-lg mb-3">💡 While you wait...</h4>
              <ul className="text-blue-200 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Your app is being built with production-ready code</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>AI agents are researching your market and competitors</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Database schema and API routes are being generated</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Quality assurance tests will run automatically</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, animating }) {
  return (
    <div className={`relative bg-white/5 backdrop-blur-xl border rounded-xl p-4 sm:p-5 transition-all duration-500 ${
      animating ? 'border-white/30 scale-105 shadow-2xl' : 'border-white/10'
    }`}>
      <div className={`inline-flex p-2 sm:p-3 bg-gradient-to-br ${color} rounded-lg mb-3 shadow-lg`}>
        {React.cloneElement(icon, { className: 'w-4 h-4 sm:w-5 sm:h-5 text-white' })}
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-white mb-1 tabular-nums">{value}</div>
      <div className="text-xs font-medium text-slate-500 uppercase">{label}</div>
      {animating && (
        <div className={`absolute inset-0 bg-gradient-to-br ${color} rounded-xl blur-2xl opacity-20 animate-pulse`}></div>
      )}
    </div>
  );
}

export default BuildingProgress;