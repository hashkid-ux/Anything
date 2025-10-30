import React, { useState, useEffect } from 'react';
import { Loader, Check, Brain, Code, Database, Rocket, FileCode, AlertCircle } from 'lucide-react';

function BuildingProgress({ prompt, onComplete }) {
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

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const url = `${API_BASE_URL}/api/master/build`;

  // Start build
  useEffect(() => {
    startBuild();
  }, []);

  // Poll progress
  useEffect(() => {
    if (!buildId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${url}/${buildId}`);
        const data = await response.json();

        console.log('📊 Progress update:', data);

        // Update progress
        setProgress({
          phase: data.phase || 'building',
          progress: data.progress || 0,
          message: data.message || 'Building...'
        });

        // Update logs
        if (data.logs && Array.isArray(data.logs)) {
          setLogs(data.logs.slice(-20));
        }

        // Extract stats
        if (data.results) {
          setStats({
            filesGenerated: data.results.summary?.files_generated || 0,
            linesOfCode: data.results.summary?.lines_of_code || 0,
            competitorsAnalyzed: data.results.phases?.research?.competitors?.total_analyzed || 0,
            reviewsScanned: data.results.phases?.research?.reviews?.total_reviews || 0
          });
        }

        // Check if completed
        if (data.status === 'completed') {
          clearInterval(interval);
          console.log('✅ Build completed!');
          setTimeout(() => onComplete(data.results), 1000);
        }

        // Check if failed
        if (data.status === 'failed') {
          clearInterval(interval);
          setError(data.error || 'Build failed');
        }

      } catch (error) {
        console.error('Poll error:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [buildId]);

  const startBuild = async () => {
    try {
      console.log('🚀 Starting build:', prompt);

      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to build apps');
        return;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          projectName: extractProjectName(prompt),
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
        throw new Error(errorData.error || 'Build start failed');
      }

      const data = await response.json();
      const { build_id, project_id } = data;
      
      console.log('✅ Build started:', { build_id, project_id });
      
      setBuildId(build_id);
      setProjectId(project_id);

      addLog('🚀 Build started successfully!');
      addLog('🔍 AI agents researching market...');

    } catch (error) {
      console.error('❌ Build start failed:', error);
      setError(error.message || 'Failed to start build');
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
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:scale-105 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Building Your App...</h1>
          <div className="text-7xl font-black text-white mb-2">{progress.progress}%</div>
          <p className="text-purple-300 text-lg mb-2">{progress.message}</p>
          <p className="text-slate-400 text-sm">
            ⏱️ {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')} elapsed
          </p>
        </div>

        <div className="mb-8 bg-slate-800/50 rounded-full h-4 overflow-hidden border border-slate-700">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000"
            style={{ width: `${progress.progress}%` }}
          />
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard icon={<FileCode />} label="Files" value={stats.filesGenerated} animating={stats.filesGenerated > 0} />
          <StatCard icon={<Code />} label="Lines" value={stats.linesOfCode.toLocaleString()} animating={stats.linesOfCode > 0} />
          <StatCard icon={<Brain />} label="Competitors" value={stats.competitorsAnalyzed} animating={stats.competitorsAnalyzed > 0} />
          <StatCard icon={<Database />} label="Reviews" value={stats.reviewsScanned} animating={stats.reviewsScanned > 0} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
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
                  isActive ? 'border-purple-500 scale-105 shadow-lg' : 'border-slate-700'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isCompleted ? 'bg-green-500' : isActive ? 'bg-purple-600' : 'bg-slate-700'
                    }`}>
                      {isCompleted ? <Check className="w-6 h-6 text-white" /> : <PhaseIcon className="w-6 h-6 text-white" />}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold mb-1 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                        {phase.name}
                      </h3>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="h-full bg-purple-500 rounded-full transition-all"
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
                <div key={i} className="text-slate-300 mb-2 hover:bg-slate-800/30 p-2 rounded">
                  <span className="text-slate-500 mr-2">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  {log.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, animating }) {
  return (
    <div className={`bg-slate-800/30 border border-slate-700 rounded-xl p-4 transition-all ${
      animating ? 'scale-105 border-purple-500 shadow-lg' : ''
    }`}>
      <div className="text-purple-400 mb-2">{icon}</div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs font-medium text-slate-500 uppercase">{label}</div>
    </div>
  );
}

export default BuildingProgress;