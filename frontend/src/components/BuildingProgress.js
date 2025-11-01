// frontend/src/components/BuildingProgress.js
// FULLY FIXED - Production Ready with Environment Variables

import React, { useState, useEffect } from 'react';
import { Loader, Check, Brain, Code, Database, Rocket, FileCode, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

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

  // CRITICAL FIX: Use environment variable with fallback
  const API_BASE_URL = process.env.REACT_APP_API_URL || window.location.origin;

  useEffect(() => {
    console.log('🔗 API Base URL:', API_BASE_URL);
    startBuild();
  }, []);

  useEffect(() => {
  if (!buildId) return;

  let isActive = true;

  const pollBuild = async () => {
    if (!isActive) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/master/build/${buildId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = response.data;
      console.log('📊 Build progress:', data);

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
        console.log('✅ Build completed!', data.results);
        
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
      
      // CRITICAL FIX: Stop polling on 404 or other errors
      if (error.response?.status === 404 || error.response?.status === 500) {
        isActive = false;
        setError(error.response?.data?.error || 'Build not found. Please try again.');
      }
    }
  };

  // Initial poll
  pollBuild();

  // Poll every 2 seconds
  const interval = setInterval(pollBuild, 2000);

  return () => {
    isActive = false;
    clearInterval(interval);
  };
}, [buildId, API_BASE_URL, onComplete])

  const startBuild = async () => {
    try {
      console.log('🚀 Starting build:', prompt);

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
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const { build_id, project_id } = response.data;
      
      console.log('✅ Build started:', { build_id, project_id });
      
      setBuildId(build_id);
      setProjectId(project_id);

      addLog('🚀 Build started successfully!');
      addLog('🔍 AI agents analyzing your idea...');

    } catch (error) {
      console.error('❌ Build start failed:', error);
      setError(error.response?.data?.error || error.message || 'Failed to start build');
    }
  };

  const addLog = (message) => {
    setLogs(prev => [...prev, {
      message,
      timestamp: new Date().toISOString()
    }].slice(-20));
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
    { id: 'research', name: 'Market Research', icon: Brain, range: [0, 30] },
    { id: 'strategy', name: 'Strategy', icon: Rocket, range: [30, 50] },
    { id: 'code', name: 'Code Generation', icon: Code, range: [50, 85] },
    { id: 'testing', name: 'Quality Assurance', icon: Database, range: [85, 95] },
    { id: 'packaging', name: 'Packaging', icon: FileCode, range: [95, 100] }
  ];

  const currentPhaseIndex = phases.findIndex(p => p.id === progress.phase);
  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl border-2 border-red-500/50 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Build Failed</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Retry Build
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Building Your App...</h1>
          <div className="text-7xl font-black text-white mb-2">{progress.progress}%</div>
          <p className="text-purple-300 text-lg mb-2">{progress.message}</p>
          <p className="text-slate-400 text-sm">
            ⏱️ {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')} elapsed
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 bg-slate-800/50 rounded-full h-4 overflow-hidden border border-slate-700">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000"
            style={{ width: `${progress.progress}%` }}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard 
            icon={<FileCode />} 
            label="Files" 
            value={stats.filesGenerated} 
            animating={stats.filesGenerated > 0} 
          />
          <StatCard 
            icon={<Code />} 
            label="Lines" 
            value={stats.linesOfCode.toLocaleString()} 
            animating={stats.linesOfCode > 0} 
          />
          <StatCard 
            icon={<Brain />} 
            label="Competitors" 
            value={stats.competitorsAnalyzed} 
            animating={stats.competitorsAnalyzed > 0} 
          />
          <StatCard 
            icon={<Database />} 
            label="Reviews" 
            value={stats.reviewsScanned} 
            animating={stats.reviewsScanned > 0} 
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Phases */}
          <div className="lg:col-span-2 space-y-4">
            {phases.map((phase, index) => {
              const PhaseIcon = phase.icon;
              const isActive = currentPhaseIndex === index;
              const isCompleted = currentPhaseIndex > index;
              const progressInPhase = isActive 
                ? Math.min(100, Math.max(0, ((progress.progress - phase.range[0]) / (phase.range[1] - phase.range[0])) * 100))
                : isCompleted ? 100 : 0;

              return (
                <div key={phase.id} className={`bg-slate-800/30 border rounded-xl p-5 transition-all ${
                  isActive ? 'border-purple-500 scale-105 shadow-lg shadow-purple-500/20' : 'border-slate-700'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                      isCompleted ? 'bg-green-500 scale-110' : isActive ? 'bg-purple-600 scale-110' : 'bg-slate-700'
                    }`}>
                      {isCompleted ? <Check className="w-6 h-6 text-white" /> : <PhaseIcon className="w-6 h-6 text-white" />}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold mb-1 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                        {phase.name}
                      </h3>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            isCompleted ? 'bg-green-500' : isActive ? 'bg-purple-500' : 'bg-slate-600'
                          }`}
                          style={{ width: `${progressInPhase}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{Math.round(progressInPhase)}%</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Activity Log */}
          <div className="bg-black/40 border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-white font-bold">Live Activity</h3>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="p-3 max-h-[500px] overflow-y-auto font-mono text-xs">
              {logs.length === 0 && (
                <div className="text-slate-500 text-center py-8">
                  <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
                  Waiting for activity...
                </div>
              )}
              {logs.slice().reverse().map((log, i) => (
                <div key={i} className="text-slate-300 mb-2 hover:bg-slate-800/30 p-2 rounded animate-slide-in">
                  <span className="text-slate-500 mr-2">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  {log.message}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
          <h4 className="text-blue-300 font-semibold mb-2">💡 While you wait...</h4>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• Your app is being built with production-ready code</li>
            <li>• AI agents are researching your market and competitors</li>
            <li>• Database schema and API routes are being generated</li>
            <li>• Quality assurance tests will run automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, animating }) {
  return (
    <div className={`bg-slate-800/30 border border-slate-700 rounded-xl p-4 transition-all ${
      animating ? 'scale-105 border-purple-500 shadow-lg shadow-purple-500/20' : ''
    }`}>
      <div className="text-purple-400 mb-2">{icon}</div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs font-medium text-slate-500 uppercase">{label}</div>
    </div>
  );
}

export default BuildingProgress;