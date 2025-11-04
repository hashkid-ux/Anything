import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Loader, Check, Brain, Code, Database, Rocket, FileCode, 
  AlertCircle, RefreshCw, Zap, TrendingUp, BarChart3, CheckCircle2,
  Eye, Monitor, Play, ArrowLeft, XCircle, Clock
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

function BuildingProgress({ prompt, onComplete, onCancel }) {
  // Core state
  const [buildState, setBuildState] = useState('INITIALIZING'); // INITIALIZING, STARTING, BUILDING, COMPLETED, FAILED
  const [buildId, setBuildId] = useState(null);
  const [projectId, setProjectId] = useState(null);
  
  // Progress tracking
  const [progress, setProgress] = useState({ 
    phase: 'initializing', 
    progress: 0, 
    message: 'Preparing to start build...' 
  });
  const [stats, setStats] = useState({
    filesGenerated: 0,
    linesOfCode: 0,
    competitorsAnalyzed: 0,
    reviewsScanned: 0
  });
  
  // UI state
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Live Preview
  const [generatedFiles, setGeneratedFiles] = useState({});
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [previewAvailable, setPreviewAvailable] = useState(false);
  
  // Refs for cleanup and control
  const pollIntervalRef = useRef(null);
  const mountedRef = useRef(true);
  const buildInitiatedRef = useRef(false);

  // ============================================
  // LIFECYCLE: Component mount/unmount
  // ============================================
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, []);

  // ============================================
  // MAIN: Build initialization on mount
  // ============================================
  useEffect(() => {
    if (!buildInitiatedRef.current && buildState === 'INITIALIZING') {
      buildInitiatedRef.current = true;
      initializeBuild();
    }
  }, [buildState]);

  // ============================================
  // POLLING: Start when build ID is available
  // ============================================
  useEffect(() => {
    if (buildId && buildState === 'BUILDING') {
      startPolling();
    }
    
    return () => {
      stopPolling();
    };
  }, [buildId, buildState]);

  // ============================================
  // TIMER: Elapsed time counter
  // ============================================
  useEffect(() => {
    const timer = setInterval(() => {
      if (mountedRef.current && buildState === 'BUILDING') {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [startTime, buildState]);

  // ============================================
  // FUNCTION: Initialize build
  // ============================================
  const initializeBuild = async () => {
    try {
      addLog('🚀 Starting new build...', 'info');
      setBuildState('STARTING');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      // Extract project name from prompt
      const projectName = extractProjectName(prompt);
      
      addLog(`📝 Project: ${projectName}`, 'info');
      addLog('🔧 Configuring build parameters...', 'info');

      // Call backend to start build
      const response = await fetch(`${API_BASE_URL}/api/master/build`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectName,
          description: prompt,
          targetCountry: 'Global',
          features: [],
          framework: 'react',
          database: 'postgresql',
          targetPlatform: 'web'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.build_id || !data.project_id) {
        throw new Error('Invalid response from server - missing build identifiers');
      }

      // SUCCESS - Build started
      if (mountedRef.current) {
        setBuildId(data.build_id);
        setProjectId(data.project_id);
        setBuildState('BUILDING');
        
        // Save to session storage for recovery
        sessionStorage.setItem('currentBuildId', data.build_id);
        sessionStorage.setItem('currentProjectId', data.project_id);
        
        addLog('✅ Build started successfully!', 'success');
        addLog(`🆔 Build ID: ${data.build_id.substring(0, 16)}...`, 'info');
        
        setProgress({
          phase: 'research',
          progress: 5,
          message: '🔍 Starting market research...'
        });
      }
      
    } catch (error) {
      console.error('❌ Build initialization failed:', error);
      
      if (mountedRef.current) {
        setBuildState('FAILED');
        setError(error.message);
        addLog(`❌ Failed to start: ${error.message}`, 'error');
      }
    }
  };

  // ============================================
  // FUNCTION: Start polling for progress
  // ============================================
  const startPolling = () => {
    if (pollIntervalRef.current) {
      return; // Already polling
    }

    addLog('📡 Starting live updates...', 'info');
    
    // Initial poll immediately
    pollBuildProgress();
    
    // Then poll every 2 seconds
    pollIntervalRef.current = setInterval(() => {
      pollBuildProgress();
    }, 2000);
  };

  // ============================================
  // FUNCTION: Stop polling
  // ============================================
  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
      addLog('📡 Stopped live updates', 'info');
    }
  };

  // ============================================
  // FUNCTION: Poll build progress
  // ============================================
  const pollBuildProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/master/build/${buildId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Build not found - may have expired');
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!mountedRef.current) return;

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

      // Update files for preview
      if (data.files && Object.keys(data.files).length > 0) {
        setGeneratedFiles(prev => {
          const merged = { ...prev, ...data.files };
          return merged;
        });
        
        if (!previewAvailable) {
          setPreviewAvailable(true);
          addLog('🎨 Live preview is now available!', 'success');
        }
      }

      // Enable preview at 50%+
      if (data.progress >= 50 && !showLivePreview && Object.keys(generatedFiles).length > 0) {
        setShowLivePreview(true);
        addLog('✨ Live preview activated!', 'success');
      }

      // Handle completion
      if (data.status === 'completed') {
        stopPolling();
        setBuildState('COMPLETED');
        addLog('🎉 Build completed successfully!', 'success');
        
        // Clear session storage
        sessionStorage.removeItem('currentBuildId');
        sessionStorage.removeItem('currentProjectId');
        
        // Notify parent with delay for UI update
        setTimeout(() => {
          if (mountedRef.current && onComplete && data.results) {
            onComplete(data.results);
          }
        }, 1000);
      }

      // Handle failure
      if (data.status === 'failed') {
        stopPolling();
        setBuildState('FAILED');
        setError(data.error || 'Build failed unexpectedly');
        addLog(`❌ Build failed: ${data.error}`, 'error');
      }

    } catch (error) {
      // Only log errors, don't stop polling for network issues
      console.error('Poll error:', error.message);
    }
  };

  // ============================================
  // FUNCTION: Cleanup
  // ============================================
  const cleanup = () => {
    stopPolling();
    sessionStorage.removeItem('currentBuildId');
    sessionStorage.removeItem('currentProjectId');
  };

  // ============================================
  // FUNCTION: Handle retry
  // ============================================
  const handleRetry = useCallback(() => {
    // Full reset
    cleanup();
    
    setBuildState('INITIALIZING');
    setBuildId(null);
    setProjectId(null);
    setError(null);
    setProgress({ phase: 'initializing', progress: 0, message: 'Preparing to retry...' });
    setStats({ filesGenerated: 0, linesOfCode: 0, competitorsAnalyzed: 0, reviewsScanned: 0 });
    setLogs([]);
    setGeneratedFiles({});
    setShowLivePreview(false);
    setPreviewAvailable(false);
    
    buildInitiatedRef.current = false;
    
    // Reinitialize
    setTimeout(() => {
      if (mountedRef.current) {
        initializeBuild();
      }
    }, 500);
  }, [prompt]);

  // ============================================
  // FUNCTION: Handle cancel/back
  // ============================================
  const handleCancel = useCallback(() => {
    cleanup();
    
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  // ============================================
  // HELPER: Add log
  // ============================================
  const addLog = (message, type = 'info') => {
    const log = {
      message,
      type,
      timestamp: new Date().toISOString()
    };
    
    setLogs(prev => [...prev, log].slice(-50));
  };

  // ============================================
  // HELPER: Extract project name
  // ============================================
  const extractProjectName = (prompt) => {
    const words = prompt.split(' ').slice(0, 5).join(' ');
    return words.length > 50 ? words.substring(0, 50) : words;
  };

  // ============================================
  // RENDER: Error state
  // ============================================
  if (buildState === 'FAILED' && error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-2xl border border-red-500/30 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full mb-6">
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">Build Failed</h2>
          <p className="text-red-300 mb-6 leading-relaxed">{error}</p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={handleRetry}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Retry Build
            </button>
            
            <button
              onClick={handleCancel}
              className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
          
          {/* Debug info */}
          <details className="mt-6 text-left">
            <summary className="text-xs text-slate-400 cursor-pointer mb-2">Debug Info</summary>
            <pre className="text-xs text-slate-500 bg-black/30 p-3 rounded-lg overflow-auto">
              {JSON.stringify({ buildId, projectId, buildState, error }, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: Initializing/Starting state
  // ============================================
  if (buildState === 'INITIALIZING' || buildState === 'STARTING') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="text-center max-w-md">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Rocket className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {buildState === 'INITIALIZING' ? 'Initializing...' : 'Starting Build...'}
          </h2>
          <p className="text-slate-400 mb-4">
            {buildState === 'INITIALIZING' 
              ? 'Setting up AI agents and build environment'
              : 'Connecting to servers and preparing workspace'}
          </p>
          
          {/* Recent logs */}
          <div className="bg-black/30 rounded-lg p-4 max-h-40 overflow-y-auto">
            {logs.slice(-5).map((log, i) => (
              <div key={i} className="text-xs text-slate-400 mb-1 font-mono">
                {log.message}
              </div>
            ))}
          </div>
          
          {/* Cancel button */}
          <button
            onClick={handleCancel}
            className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: Main building interface
  // ============================================
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

  return (
    <div className="min-h-screen px-4 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>{minutes}:{String(seconds).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Progress Circle */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="relative inline-block mb-6">
            <svg className="w-32 h-32 sm:w-40 sm:h-40 -rotate-90">
              <circle cx="50%" cy="50%" r="45%" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
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

          {previewAvailable && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-full animate-pulse">
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

        {/* Main Content: Phases + Preview */}
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
                        ? `bg-gradient-to-br ${phase.color} scale-110` 
                        : 'bg-white/10'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      ) : (
                        <PhaseIcon className={`w-6 h-6 sm:w-7 sm:h-7 text-white ${isActive ? 'animate-pulse' : ''}`} />
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
              <div className="p-3 max-h-[200px] overflow-y-auto font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-center py-6">
                    <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-500" />
                    <p className="text-slate-500 text-xs">Initializing...</p>
                  </div>
                ) : (
                  logs.slice().reverse().slice(0, 10).map((log, i) => (
                    <div key={i} className={`mb-1 ${
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'success' ? 'text-green-400' :
                      'text-slate-300'
                    }`}>
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

          {/* RIGHT: Live Preview Placeholder */}
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
                <span>Generating code...</span>
              </div>
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