import React, { useState, useEffect } from 'react';
import { Loader, Check, Brain, Search, Palette, Code, Rocket, TrendingUp, Sparkles, Zap, Target, Users, DollarSign, Box } from 'lucide-react';
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
      task: 'Analyzing competitors & market trends',
      color: 'from-purple-500 to-pink-600',
      description: 'Scraping real competitor data, analyzing reviews, finding market gaps'
    },
    {
      id: 'strategy',
      name: 'Business Strategy',
      icon: Target,
      task: 'Creating revenue model & pricing strategy',
      color: 'from-blue-500 to-cyan-600',
      description: 'Calculating TAM/SAM/SOM, 3-year projections, competitive positioning'
    },
    {
      id: 'design',
      name: 'UX/UI Design',
      icon: Palette,
      task: 'Designing interface with psychology principles',
      color: 'from-pink-500 to-rose-600',
      description: 'Applying scarcity, social proof, and conversion optimization'
    },
    {
      id: 'frontend',
      name: 'Frontend Code',
      icon: Code,
      task: 'Generating React components',
      color: 'from-green-500 to-emerald-600',
      description: 'Building production-ready React app with Tailwind CSS'
    },
    {
      id: 'backend',
      name: 'Backend API',
      icon: Box,
      task: 'Creating Node.js server & database',
      color: 'from-orange-500 to-red-600',
      description: 'Express API, PostgreSQL schema, authentication'
    },
    {
      id: 'deploy',
      name: 'Deployment',
      icon: Rocket,
      task: 'Preparing deployment package',
      color: 'from-indigo-500 to-purple-600',
      description: 'Vercel config, Railway setup, environment variables'
    }
  ];

  useEffect(() => {
    buildApp();
  }, []);

  const buildApp = async () => {
    try {
      addLog('🚀 Initializing master build orchestrator...');
      
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

          const { status, phase, progress, current_task, logs: buildLogs, results } = progressResponse.data;

          setCurrentStep(Math.floor(progress / (100 / agents.length)));
          
          if (buildLogs) {
            buildLogs.forEach(log => {
              if (!agentLogs.find(l => l.timestamp === log.timestamp)) {
                addLog(log.message);
              }
            });
          }

          // Update stats
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
    if (prompt.toLowerCase().includes('notification')) features.push('Notifications');
    return features.length > 0 ? features : ['User Management', 'Dashboard'];
  };

  const extractTargetMarket = (prompt) => {
    if (prompt.toLowerCase().includes('india')) return 'India';
    if (prompt.toLowerCase().includes('usa') || prompt.toLowerCase().includes('america')) return 'USA';
    return 'Global';
  };

  const addLog = (message) => {
    setAgentLogs(prev => [...prev, { message, timestamp: new Date().toLocaleTimeString() }]);
    // Auto-complete steps based on log messages
    if (message.includes('market') || message.includes('competitor')) setCompletedSteps(prev => [...new Set([...prev, 0])]);
    if (message.includes('strategy') || message.includes('revenue')) setCompletedSteps(prev => [...new Set([...prev, 1])]);
    if (message.includes('design') || message.includes('UX')) setCompletedSteps(prev => [...new Set([...prev, 2])]);
    if (message.includes('frontend') || message.includes('React')) setCompletedSteps(prev => [...new Set([...prev, 3])]);
    if (message.includes('backend') || message.includes('API')) setCompletedSteps(prev => [...new Set([...prev, 4])]);
    if (message.includes('deploy') || message.includes('package')) setCompletedSteps(prev => [...new Set([...prev, 5])]);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full mb-6">
            <div className="relative">
              <Loader className="w-5 h-5 text-purple-400 animate-spin" />
              <div className="absolute inset-0 bg-purple-500 blur-md animate-pulse"></div>
            </div>
            <span className="text-white font-semibold">AI Agents Working</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Building Your App
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            14 specialized AI agents are collaborating to analyze, design, and deploy your application
          </p>
        </div>

        {/* Live Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <StatCard 
            icon={<Code className="w-5 h-5" />}
            label="Files Generated"
            value={stats.filesGenerated}
            color="from-blue-500 to-cyan-600"
            isAnimating={stats.filesGenerated > 0}
          />
          <StatCard 
            icon={<Zap className="w-5 h-5" />}
            label="Lines of Code"
            value={stats.linesOfCode.toLocaleString()}
            color="from-purple-500 to-pink-600"
            isAnimating={stats.linesOfCode > 0}
          />
          <StatCard 
            icon={<Users className="w-5 h-5" />}
            label="Competitors Analyzed"
            value={stats.competitorsAnalyzed}
            color="from-green-500 to-emerald-600"
            isAnimating={stats.competitorsAnalyzed > 0}
          />
          <StatCard 
            icon={<TrendingUp className="w-5 h-5" />}
            label="Reviews Scanned"
            value={stats.reviewsScanned}
            color="from-orange-500 to-red-600"
            isAnimating={stats.reviewsScanned > 0}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Agent Progress - Left Column */}
          <div className="lg:col-span-2 space-y-4">
            {agents.map((agent, index) => {
              const Icon = agent.icon;
              const isActive = currentStep === index;
              const isCompleted = completedSteps.includes(index);
              const isPending = index > currentStep;

              return (
                <div 
                  key={agent.id}
                  className={`relative bg-white/5 backdrop-blur-xl border-2 rounded-2xl p-6 transition-all duration-500 ${
                    isCompleted ? 'border-green-500/50 bg-green-500/5' :
                    isActive ? 'border-purple-500/50 bg-purple-500/5 scale-105' :
                    'border-white/10'
                  }`}
                >
                  {/* Progress Bar Background */}
                  <div className="absolute inset-0 overflow-hidden rounded-2xl">
                    <div 
                      className={`h-full bg-gradient-to-r ${agent.color} opacity-10 transition-all duration-1000 ${
                        isCompleted ? 'w-full' :
                        isActive ? 'w-3/4 animate-pulse' :
                        'w-0'
                      }`}
                    />
                  </div>

                  <div className="relative z-10 flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isCompleted ? 'bg-green-500 scale-110' :
                      isActive ? `bg-gradient-to-br ${agent.color} animate-pulse scale-110` :
                      'bg-white/10'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-7 h-7 text-white" />
                      ) : (
                        <Icon className={`w-7 h-7 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`font-bold text-lg ${
                          isCompleted ? 'text-green-400' :
                          isActive ? 'text-white' :
                          'text-gray-500'
                        }`}>
                          {agent.name}
                        </h3>
                        {isActive && (
                          <div className="flex items-center gap-2">
                            <Loader className="w-4 h-4 text-purple-400 animate-spin" />
                            <span className="text-xs text-purple-400 font-semibold">ACTIVE</span>
                          </div>
                        )}
                        {isCompleted && (
                          <span className="text-xs text-green-400 font-semibold">✓ COMPLETE</span>
                        )}
                      </div>
                      <p className={`text-sm mb-2 ${
                        isCompleted ? 'text-gray-400 line-through' :
                        isActive ? 'text-gray-300 font-medium' :
                        'text-gray-600'
                      }`}>
                        {agent.task}
                      </p>
                      {(isActive || isCompleted) && (
                        <p className="text-xs text-gray-400">
                          {agent.description}
                        </p>
                      )}
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 relative">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-white/10"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${(isCompleted ? 100 : isActive ? 66 : 0) / 100 * 176} 176`}
                            strokeLinecap="round"
                            className={
                              isCompleted ? 'text-green-500' :
                              isActive ? 'text-purple-500' :
                              'text-transparent'
                            }
                            style={{ transition: 'stroke-dasharray 1s ease' }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-xs font-bold ${
                            isCompleted ? 'text-green-400' :
                            isActive ? 'text-purple-400' :
                            'text-gray-600'
                          }`}>
                            {isCompleted ? '100' : isActive ? '66' : '0'}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Logs - Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <h3 className="text-white font-bold">Live Activity</h3>
                  </div>
                  <span className="text-xs text-gray-400">{agentLogs.length} events</span>
                </div>

                {/* Logs */}
                <div className="p-4 max-h-[600px] overflow-y-auto font-mono text-sm space-y-3">
                  {agentLogs.slice(-15).reverse().map((log, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 text-gray-300 animate-fade-in-up p-2 rounded-lg hover:bg-white/5 transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="text-gray-500 text-xs flex-shrink-0 pt-0.5">{log.timestamp}</span>
                      <span className="flex-1 text-xs leading-relaxed">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Estimate */}
              <div className="mt-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Estimated Time</span>
                  <span className="text-white font-bold">~3 minutes</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(completedSteps.length / agents.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-8 bg-red-500/20 border-2 border-red-500/50 rounded-2xl p-6 backdrop-blur-xl">
            <h4 className="text-red-300 font-bold mb-2">Build Failed</h4>
            <p className="text-red-200">{error}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

function StatCard({ icon, label, value, color, isAnimating }) {
  return (
    <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 ${
      isAnimating ? 'scale-105 border-white/30' : ''
    }`}>
      <div className={`inline-flex p-3 bg-gradient-to-br ${color} rounded-xl mb-3 ${
        isAnimating ? 'animate-pulse' : ''
      }`}>
        {icon}
      </div>
      <div className="text-3xl font-black text-white mb-1 tabular-nums">
        {value}
      </div>
      <div className="text-xs text-gray-400 font-medium">{label}</div>
    </div>
  );
}

export default BuildingProgress;