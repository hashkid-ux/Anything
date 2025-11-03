// frontend/src/components/BuildingProgress.js
// FULLY FIXED - Build starts properly + Progress updates correctly

import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader, Check, Brain, Code, Database, Rocket, FileCode, 
  AlertCircle, RefreshCw, Zap, TrendingUp, BarChart3, CheckCircle2,
  Eye, Monitor, Play
} from 'lucide-react';
import axios from 'axios';
import LiveAppPreview from './LiveAppPreview';

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
  
  // Live Preview State
  const [generatedFiles, setGeneratedFiles] = useState({});
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [previewAvailable, setPreviewAvailable] = useState(false);
  const [buildCompleted, setBuildCompleted] = useState(false);
  const [completedData, setCompletedData] = useState(null);
  
  const pollIntervalRef = useRef(null);
  const buildStartedRef = useRef(false);

  // CRITICAL FIX: Check for existing build OR start new build
  useEffect(() => {
    const initBuild = async () => {
      // Check session storage for existing build
      const savedBuildId = sessionStorage.getItem('currentBuildId');
      const savedProjectId = sessionStorage.getItem('currentProjectId');
      
      if (savedBuildId && savedProjectId && !buildStartedRef.current) {
        console.log('🔄 Resuming existing build:', savedBuildId);
        setBuildId(savedBuildId);
        setProjectId(savedProjectId);
        buildStartedRef.current = true;
        addLog('🔄 Resuming build from session...');
      } else if (!buildStartedRef.current) {
        console.log('🚀 Starting new build...');
        await startNewBuild();
        buildStartedRef.current = true;
      }
    };

    initBuild();
  }, []); // Only run once

  // Elapsed time counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // CRITICAL FIX: Polling with proper cleanup
  useEffect(() => {
    if (!buildId || buildCompleted) {
      return;
    }

    console.log('🔍 Starting polling for build:', buildId);

    const pollBuild = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('❌ No auth token');
          setError('Authentication required');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/master/build/${buildId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 15000
        });
        
        const data = response.data;
        console.log('📊 Poll response:', {
          status: data.status,
          phase: data.phase,
          progress: data.progress,
          filesCount: Object.keys(data.files || {}).length
        });
        
        // Update progress
        setProgress({
          phase: data.phase || 'building',
          progress: data.progress || 0,
          message: data.message || 'Building...'
        });
        
        // Update stats
        if (data.stats) {
          setStats(prev => ({
            filesGenerated: data.stats.filesGenerated || prev.filesGenerated,
            linesOfCode: data.stats.linesOfCode || prev.linesOfCode,
            competitorsAnalyzed: data.stats.competitorsAnalyzed || prev.competitorsAnalyzed,
            reviewsScanned: data.stats.reviewsScanned || prev.reviewsScanned
          }));
        }
        
        // Update logs
        if (data.logs && data.logs.length > 0) {
          setLogs(data.logs.slice(-20));
        }
        
        // CRITICAL: Handle files for live preview
        if (data.files && Object.keys(data.files).length > 0) {
          console.log('📦 Received', Object.keys(data.files).length, 'files');
          setGeneratedFiles(prev => {
            const merged = { ...prev, ...data.files };
            console.log('📂 Total files now:', Object.keys(merged).length);
            return merged;
          });
          
          if (!previewAvailable) {
            setPreviewAvailable(true);
            addLog('🎨 Live preview is now available!');
          }
        }
        
        // Enable preview at 50%+ with files
        if (data.progress >= 50 && !showLivePreview && Object.keys(generatedFiles).length > 0) {
          setShowLivePreview(true);
          addLog('✨ Live preview activated!');
        }
        
        // CRITICAL: Handle completion
        if (data.status === 'completed') {
          console.log('✅ Build completed!');
          setBuildCompleted(true);
          setCompletedData(data.results);
          
          // Clear polling
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          
          // Clear session storage
          sessionStorage.removeItem('currentBuildId');
          sessionStorage.removeItem('currentProjectId');
          
          addLog('✅ Build completed successfully!');
          
          // Notify parent with delay
          setTimeout(() => {
            if (onComplete && data.results) {
              console.log('📤 Sending results to parent');
              onComplete(data.results);
            }
          }, 1000);
        }
        
        // Handle failure
        if (data.status === 'failed') {
          console.error('❌ Build failed:', data.error);
          setError(data.error || 'Build failed');
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
        
      } catch (error) {
        console.error('❌ Poll error:', error.message);
        
        // Only set error on critical failures
        if (error.response?.status === 404) {
          setError('Build not found - may have expired');
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
        // Otherwise keep polling (temporary network errors)
      }
    };

    // Initial poll immediately
    pollBuild();
    
    // Set up interval - poll every 2 seconds for faster updates
    pollIntervalRef.current = setInterval(pollBuild, 2000);
    
    // Cleanup
    return () => {
      if (pollIntervalRef.current) {
        console.log('🛑 Stopping polling');
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [buildId, buildCompleted, generatedFiles, previewAvailable, showLivePreview]);

  const startNewBuild = async () => {
    try {
      console.log('🚀 Starting new build with prompt:', prompt.substring(0, 50) + '...');
      
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
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      const { build_id, project_id } = response.data;
      console.log('✅ Build started:', { build_id, project_id });
      
      setBuildId(build_id);
      setProjectId(project_id);
      
      // Save to session storage
      sessionStorage.setItem('currentBuildId', build_id);
      sessionStorage.setItem('currentProjectId', project_id);
      
      addLog('🚀 Build started successfully!');
      setProgress({
        phase: 'research',
        progress: 5,
        message: 'Starting market research...'
      });
      
    } catch (error) {
      console.error('❌ Build start failed:', error);
      const errorMsg = error.response?.data?.error || error.message;
      setError(errorMsg);
      addLog(`❌ Error: ${errorMsg}`);
    }
  };

  const addLog = (message) => {
    const log = {
      message,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [...prev, log].slice(-20));
    console.log('📝 Log:', message);
  };

  const extractProjectName = (prompt) => {
    const words = prompt.split(' ').slice(0, 5).join(' ');
    return words.length > 50 ? words.substring(0, 50) : words;
  };

  const handleRetry = () => {
    console.log('🔄 Retrying build...');
    
    // Reset all state
    setError(null);
    setProgress({ phase: 'initializing', progress: 0, message: 'Retrying...' });
    setStats({ filesGenerated: 0, linesOfCode: 0, competitorsAnalyzed: 0, reviewsScanned: 0 });
    setLogs([]);
    setBuildId(null);
    setProjectId(null);
    setGeneratedFiles({});
    setShowLivePreview(false);
    setPreviewAvailable(false);
    setBuildCompleted(false);
    setCompletedData(null);
    
    // Clear session
    sessionStorage.removeItem('currentBuildId');
    sessionStorage.removeItem('currentProjectId');
    
    // Reset refs
    buildStartedRef.current = false;
    
    // Start new build
    setTimeout(() => {
      startNewBuild();
      buildStartedRef.current = true;
    }, 500);
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

  // Show error state
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

  // Show initialization state
  if (!buildId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Initializing Build...</h2>
          <p className="text-slate-400">Setting up AI agents</p>
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
            <svg className="w-32 h-32 sm:w-40 sm:h-40 -rotate-90">
              <circle cx="50%" cy="50%" r="45%" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
              <circle cx="50%" cy="50%" r="45%" stroke="url(#progressGradient)" strokeWidth="8" fill="none" strokeDasharray={`${(progress.progress / 100) * 283} 283`} strokeLinecap="round" className="transition-all duration-1000" />
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

          {previewAvailable && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-full animate-scale-in">
              <Play className="w-4 h-4 text-green-400" />
              <span className="text-green-300 font-medium text-sm">Live Preview Available!</span>
            </div>
          )}
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

        {/* Main Content: Phases + Live Preview */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* LEFT: Build Phases */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-purple-400" />
              Build Progress
            </h3>
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

            {/* Activity Log */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
              <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-bold text-sm">Live Activity</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-medium">LIVE</span>
                </div>
              </div>
              <div className="p-3 max-h-[200px] overflow-y-auto font-mono text-xs scrollbar-thin">
                {logs.length === 0 ? (
                  <div className="text-center py-6">
                    <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-500" />
                    <p className="text-slate-500 text-xs">Initializing...</p>
                  </div>
                ) : (
                  logs.slice().reverse().map((log, i) => (
                    <div key={i} className="text-slate-300 mb-1 text-xs">
                      <span className="text-slate-500 mr-2">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      {log.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: LIVE PREVIEW */}
          <div className="lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                Live Preview
              </h3>
              {!showLivePreview && (
                <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
                  Available at 50%
                </span>
              )}
            </div>

            {showLivePreview && previewAvailable && Object.keys(generatedFiles).length > 0 ? (
              <LiveAppPreview 
                buildId={buildId}
                files={generatedFiles}
                progress={progress}
              />
            ) : (
              <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-50">
                  <Monitor className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Preview Coming Soon</h4>
                <p className="text-slate-400 text-sm mb-4">
                  Live preview will appear when code generation starts (50%+)
                </p>
                <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Generating frontend code...</span>
                </div>
              </div>
            )}
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
                  <span>Watch your app being built in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Test the UI interactively as it's generated</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Preview works on desktop, tablet, and mobile</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Page refresh won't lose your progress</span>
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