import React, { useState, useEffect } from 'react';
import { Loader, Check, Brain, Palette, Code, Rocket, Target, Box, Zap, Award } from 'lucide-react';
import axios from 'axios';
import { getApiUrl, getAuthHeaders } from '../config/api';

function BuildingProgress({ prompt, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [agentLogs, setAgentLogs] = useState([]);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    filesGenerated: 0,
    linesOfCode: 0,
    competitorsAnalyzed: 0,
    reviewsScanned: 0
  });

  const agents = [
    {
      id: 'research',
      name: 'Market Intelligence',
      icon: Brain,
      task: 'Analyzing competitors & trends',
      color: 'from-purple-500 to-pink-600',
      description: 'Scraping competitor data and market gaps'
    },
    {
      id: 'strategy',
      name: 'Business Strategy',
      icon: Target,
      task: 'Creating revenue model',
      color: 'from-blue-500 to-indigo-600',
      description: 'TAM/SAM/SOM & 3-year projections'
    },
    {
      id: 'design',
      name: 'UX/UI Design',
      icon: Palette,
      task: 'Designing interface',
      color: 'from-pink-500 to-rose-600',
      description: 'Psychology-driven design patterns'
    },
    {
      id: 'frontend',
      name: 'Frontend Code',
      icon: Code,
      task: 'Generating React components',
      color: 'from-emerald-500 to-teal-600',
      description: 'Production-ready React + Tailwind'
    },
    {
      id: 'backend',
      name: 'Backend API',
      icon: Box,
      task: 'Creating server & database',
      color: 'from-orange-500 to-red-600',
      description: 'Express API + PostgreSQL schema'
    },
    {
      id: 'deploy',
      name: 'Deployment',
      icon: Rocket,
      task: 'Preparing deployment',
      color: 'from-indigo-500 to-purple-600',
      description: 'Vercel & Railway configuration'
    }
  ];

  useEffect(() => {
    buildApp();
  }, []);

  const buildApp = async () => {
    try {
      addLog('🚀 Initializing build orchestrator...');
      
      const startResponse = await axios.post(
        getApiUrl('/api/master/build'),
        {
          projectName: extractProjectName(prompt),
          description: prompt,
          targetCountry: extractTargetMarket(prompt),
          features: extractFeatures(prompt),
          targetPlatform: 'web',
          framework: 'react',
          database: 'postgresql'
        },
        {
          headers: {
            ...getAuthHeaders(),
            'x-user-tier': 'starter'
          }
        }
      );

      const buildId = startResponse.data.build_id;
      addLog(`✅ Build ID: ${buildId}`);

      const pollInterval = setInterval(async () => {
        try {
          const progressResponse = await axios.get(
            getApiUrl(`/api/master/build/${buildId}`)
          );

          const { status, progress, logs: buildLogs, results } = progressResponse.data;

          setCurrentStep(Math.floor(progress / (100 / agents.length)));
          
          if (buildLogs) {
            buildLogs.forEach(log => {
              if (!agentLogs.find(l => l.timestamp === log.timestamp)) {
                addLog(log.message);
              }
            });
          }

          if (results) {
            setStats({
              filesGenerated: results.summary?.files_generated || 0,
              linesOfCode: results.summary?.lines_of_code || 0,
              competitorsAnalyzed: results.phases?.research?.competitors?.individual_analyses?.length || 0,
              reviewsScanned: results.phases?.research?.reviews?.total_reviews || 0
            });
          }

          if (status === 'completed') {
            clearInterval(pollInterval);
            addLog('🎉 Build complete!');
            setCompletedSteps(agents.map((_, i) => i));
            setTimeout(() => {
              onComplete({
                ...results,
                download_url: progressResponse.data.download_url
              });
            }, 1000);
          }

          if (status === 'failed') {
            clearInterval(pollInterval);
            setError(progressResponse.data.error || 'Build failed');
          }

        } catch (pollError) {
          console.error('Poll error:', pollError);
        }
      }, 2000);

    } catch (error) {
      console.error('Build error:', error);
      setError(error.response?.data?.error || 'Failed to start build');
    }
  };

  const extractProjectName = (prompt) => {
    const match = prompt.match(/(?:build|create|make)\s+(?:a|an)?\s+([a-z0-9\s]+)/i);
    return match ? match[1].trim() : 'MyApp';
  };

  const extractFeatures = (prompt) => {
    const features = [];
    if (prompt.toLowerCase().includes('auth')) features.push('Authentication');
    if (prompt.toLowerCase().includes('payment')) features.push('Payments');
    if (prompt.toLowerCase().includes('chat')) features.push('Chat');
    return features.length > 0 ? features : ['User Management', 'Dashboard'];
  };

  const extractTargetMarket = (prompt) => {
    if (prompt.toLowerCase().includes('india')) return 'India';
    if (prompt.toLowerCase().includes('usa')) return 'USA';
    return 'Global';
  };

  const addLog = (message) => {
    setAgentLogs(prev => [...prev, { message, timestamp: new Date().toLocaleTimeString() }]);
    
    if (message.includes('market') || message.includes('competitor')) setCompletedSteps(prev => [...new Set([...prev, 0])]);
    if (message.includes('strategy') || message.includes('revenue')) setCompletedSteps(prev => [...new Set([...prev, 1])]);
    if (message.includes('design') || message.includes('UX')) setCompletedSteps(prev => [...new Set([...prev, 2])]);
    if (message.includes('frontend') || message.includes('React')) setCompletedSteps(prev => [...new Set([...prev, 3])]);
    if (message.includes('backend') || message.includes('API')) setCompletedSteps(prev => [...new Set([...prev, 4])]);
    if (message.includes('deploy') || message.includes('package')) setCompletedSteps(prev => [...new Set([...prev, 5])]);
  };

  return (
    <div className="min-h-screen relative">
      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 px-4 py-2 rounded-full mb-4">
            <Loader className="w-4 h-4 text-purple-400 animate-spin" />
            <span className="text-slate-300 font-medium text-sm">AI Agents Working</span>
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Building Your App
          </h2>
          <p className="text-base text-slate-400 max-w-2xl mx-auto">
            14 specialized AI agents collaborating to build your application
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <StatCard 
            icon={<Code className="w-4 h-4" />}
            label="Files"
            value={stats.filesGenerated}
            color="from-blue-500 to-indigo-600"
            isAnimating={stats.filesGenerated > 0}
          />
          <StatCard 
            icon={<Zap className="w-4 h-4" />}
            label="Lines"
            value={stats.linesOfCode.toLocaleString()}
            color="from-purple-500 to-pink-600"
            isAnimating={stats.linesOfCode > 0}
          />
          <StatCard 
            icon={<Target className="w-4 h-4" />}
            label="Competitors"
            value={stats.competitorsAnalyzed}
            color="from-emerald-500 to-teal-600"
            isAnimating={stats.competitorsAnalyzed > 0}
          />
          <StatCard 
            icon={<Award className="w-4 h-4" />}
            label="Reviews"
            value={stats.reviewsScanned}
            color="from-orange-500 to-red-600"
            isAnimating={stats.reviewsScanned > 0}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Agent Progress */}
          <div className="lg:col-span-2 space-y-3">
            {agents.map((agent, index) => {
              const Icon = agent.icon;
              const isActive = currentStep === index;
              const isCompleted = completedSteps.includes(index);

              return (
                <div 
                  key={agent.id}
                  className={`relative bg-slate-800/30 backdrop-blur-sm border rounded-xl p-5 transition-all ${
                    isCompleted ? 'border-emerald-500/50 bg-emerald-500/5' :
                    isActive ? 'border-purple-500/50 bg-purple-500/5 scale-[1.02]' :
                    'border-slate-700'
                  }`}
                >
                  {/* Progress Bar */}
                  <div className="absolute inset-0 overflow-hidden rounded-xl">
                    <div 
                      className={`h-full bg-gradient-to-r ${agent.color} opacity-5 transition-all duration-1000 ${
                        isCompleted ? 'w-full' :
                        isActive ? 'w-2/3' :
                        'w-0'
                      }`}
                    />
                  </div>

                  <div className="relative flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center transition-all ${
                      isCompleted ? 'bg-emerald-500 scale-110' :
                      isActive ? `bg-gradient-to-br ${agent.color} scale-110` :
                      'bg-slate-700/50'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold text-sm ${
                          isCompleted ? 'text-emerald-400' :
                          isActive ? 'text-white' :
                          'text-slate-500'
                        }`}>
                          {agent.name}
                        </h3>
                        {isActive && (
                          <span className="text-xs text-purple-400 font-medium">ACTIVE</span>
                        )}
                        {isCompleted && (
                          <span className="text-xs text-emerald-400 font-medium">✓</span>
                        )}
                      </div>
                      <p className={`text-xs mb-1 ${
                        isCompleted ? 'text-slate-500 line-through' :
                        isActive ? 'text-slate-300' :
                        'text-slate-600'
                      }`}>
                        {agent.task}
                      </p>
                      {(isActive || isCompleted) && (
                        <p className="text-xs text-slate-500">
                          {agent.description}
                        </p>
                      )}
                    </div>

                    {/* Progress Circle */}
                    <div className="flex-shrink-0 w-12 h-12 relative">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          className="text-slate-700"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray={`${(isCompleted ? 100 : isActive ? 66 : 0) / 100 * 125} 125`}
                          strokeLinecap="round"
                          className={
                            isCompleted ? 'text-emerald-500' :
                            isActive ? 'text-purple-500' :
                            'text-transparent'
                          }
                          style={{ transition: 'stroke-dasharray 1s ease' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-xs font-bold ${
                          isCompleted ? 'text-emerald-400' :
                          isActive ? 'text-purple-400' :
                          'text-slate-600'
                        }`}>
                          {isCompleted ? '100' : isActive ? '66' : '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Logs */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-black/40 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
                {/* Header */}
                <div className="bg-slate-800/50 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <h3 className="text-white font-semibold text-sm">Live Activity</h3>
                  </div>
                  <span className="text-xs text-slate-500">{agentLogs.length}</span>
                </div>

                {/* Logs */}
                <div className="p-3 max-h-[500px] overflow-y-auto space-y-2 text-xs font-mono">
                  {agentLogs.slice(-12).reverse().map((log, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-2 text-slate-300 p-2 rounded hover:bg-slate-800/30 transition-colors"
                    >
                      <span className="text-slate-600 text-[10px] flex-shrink-0">{log.timestamp}</span>
                      <span className="flex-1 leading-relaxed">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Estimate */}
              <div className="mt-4 bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-slate-400">Est. Time</span>
                  <span className="text-white font-semibold">~3 min</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                    style={{ width: `${(completedSteps.length / agents.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-5 backdrop-blur-sm">
            <h4 className="text-red-300 font-semibold mb-2 text-sm">Build Failed</h4>
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, isAnimating }) {
  return (
    <div className={`bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-4 transition-all ${
      isAnimating ? 'scale-[1.02] border-slate-600' : ''
    }`}>
      <div className={`inline-flex p-2 bg-gradient-to-br ${color} rounded-lg mb-2 ${
        isAnimating ? 'animate-pulse' : ''
      }`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-white mb-0.5 tabular-nums">
        {value}
      </div>
      <div className="text-xs text-slate-500 font-medium">{label}</div>
    </div>
  );
}

export default BuildingProgress;