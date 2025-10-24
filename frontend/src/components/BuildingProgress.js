import React, { useState, useEffect } from 'react';
import { Loader, Check, Brain, Search, Palette, Code, Rocket, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { getApiUrl, getAuthHeaders } from '../config/api';


function BuildingProgress({ prompt, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [agentLogs, setAgentLogs] = useState([]);
  const [error, setError] = useState(null);

  const agents = [
    {
      id: 'strategy',
      name: 'Strategy Agent',
      icon: Brain,
      task: 'Analyzing market & validating idea',
      color: 'text-purple-400'
    },
    {
      id: 'research',
      name: 'Research Agent',
      icon: Search,
      task: 'Finding competitors & market data',
      color: 'text-blue-400'
    },
    {
      id: 'revenue',
      name: 'Revenue Agent',
      icon: TrendingUp,
      task: 'Calculating revenue potential',
      color: 'text-green-400'
    },
    {
      id: 'design',
      name: 'Design Agent',
      icon: Palette,
      task: 'Creating UI/UX design system',
      color: 'text-pink-400'
    },
    {
      id: 'code',
      name: 'Code Agent',
      icon: Code,
      task: 'Generating production-ready code',
      color: 'text-yellow-400'
    },
    {
      id: 'deploy',
      name: 'Deploy Agent',
      icon: Rocket,
      task: 'Preparing deployment package',
      color: 'text-orange-400'
    }
  ];

  useEffect(() => {
    // Start the AI building process
    buildApp();
  }, []);

  const buildApp = async () => {
  try {
    // Step 1: Start master build (returns immediately with build ID)
    addLog('🚀 Starting master build orchestrator...');
    
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
          'x-user-tier': 'starter' // Or get from user context
        }
      }
    );

    const buildId = startResponse.data.build_id;
    addLog(`✅ Build started! ID: ${buildId}`);

    // Step 2: Poll for progress
    const pollInterval = setInterval(async () => {
      try {
        const progressResponse = await axios.get(
          getApiUrl(`/api/master/build/${buildId}`)
        );

        const { status, phase, progress, current_task, logs: buildLogs, results } = progressResponse.data;

        // Update progress
        setCurrentStep(Math.floor(progress / 20)); // Map to agent steps
        
        // Add new logs
        if (buildLogs) {
          buildLogs.forEach(log => {
            if (!agentLogs.find(l => l.timestamp === log.timestamp)) {
              addLog(log.message);
            }
          });
        }

        // Check if complete
        if (status === 'completed') {
          clearInterval(pollInterval);
          addLog('🎉 Build complete!');
          
          // Pass results to parent
          onComplete({
            ...results,
            download_url: progressResponse.data.download_url
          });
        }

        // Check if failed
        if (status === 'failed') {
          clearInterval(pollInterval);
          setError(progressResponse.data.error || 'Build failed');
        }

      } catch (pollError) {
        console.error('Poll error:', pollError);
      }
    }, 2000); // Poll every 2 seconds

  } catch (error) {
    console.error('Build error:', error);
    setError(error.response?.data?.error || 'Failed to start build');
  }
};

  const extractProjectName = (prompt) => {
    // Extract project name from prompt
    const match = prompt.match(/(?:build|create|make)\s+(?:a|an)?\s+([a-z0-9\s]+)/i);
    return match ? match[1].trim() : 'MyApp';
  };

  const extractFeatures = (prompt) => {
    // Simple feature extraction
    const features = [];
    if (prompt.toLowerCase().includes('auth')) features.push('Authentication');
    if (prompt.toLowerCase().includes('payment')) features.push('Payments');
    if (prompt.toLowerCase().includes('chat')) features.push('Chat');
    if (prompt.toLowerCase().includes('notification')) features.push('Notifications');
    return features.length > 0 ? features : ['User Management', 'Dashboard'];
  };

  const extractTargetMarket = (prompt) => {
    // Simple extraction - in production, AI would do this
    if (prompt.toLowerCase().includes('india')) return 'India';
    if (prompt.toLowerCase().includes('usa') || prompt.toLowerCase().includes('america')) return 'USA';
    return 'Global';
  };

  const addLog = (message) => {
    setAgentLogs(prev => [...prev, { message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 px-4 py-2 rounded-full mb-4">
            <Loader className="w-4 h-4 text-purple-300 animate-spin" />
            <span className="text-sm text-purple-200 font-semibold">
              AI Agents Building Your App
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Sit back and relax ☕
          </h2>
          <p className="text-gray-400">
            Multiple AI agents are working together on your project
          </p>
        </div>

        {/* Agent Progress */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <div className="space-y-6">
            {agents.map((agent, index) => {
              const Icon = agent.icon;
              const isActive = currentStep === index;
              const isCompleted = completedSteps.includes(index);
              const isPending = index > currentStep;

              return (
                <div key={agent.id} className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    isCompleted ? 'bg-green-500/20 border border-green-500/50' :
                    isActive ? 'bg-purple-500/20 border border-purple-500/50 animate-pulse' :
                    'bg-white/5 border border-white/10'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-6 h-6 text-green-400" />
                    ) : (
                      <Icon className={`w-6 h-6 ${isActive ? agent.color : 'text-gray-500'}`} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`font-semibold ${
                        isCompleted ? 'text-green-400' :
                        isActive ? 'text-white' :
                        'text-gray-500'
                      }`}>
                        {agent.name}
                      </h3>
                      {isActive && (
                        <Loader className="w-4 h-4 text-purple-400 animate-spin" />
                      )}
                    </div>
                    <p className={`text-sm ${
                      isCompleted ? 'text-gray-400 line-through' :
                      isActive ? 'text-gray-300' :
                      'text-gray-600'
                    }`}>
                      {agent.task}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        isCompleted ? 'w-full bg-green-500' :
                        isActive ? 'w-2/3 bg-purple-500 animate-pulse' :
                        'w-0'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Logs */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-green-400" />
            Live Agent Logs
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-sm">
            {agentLogs.map((log, index) => (
              <div key={index} className="text-gray-300 flex items-start gap-3">
                <span className="text-gray-500 text-xs">{log.timestamp}</span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-500/20 border border-red-500/50 rounded-xl p-4">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Fun Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{completedSteps.length}</div>
            <div className="text-xs text-gray-400">Agents Completed</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{agentLogs.length}</div>
            <div className="text-xs text-gray-400">Tasks Processed</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">~3min</div>
            <div className="text-xs text-gray-400">Estimated Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuildingProgress;