import React, { useState, useEffect } from 'react';
import { Download, ExternalLink, Share2, Code, CheckCircle, ArrowRight, Copy, Zap, Award, BarChart3, Rocket, Target, Users, DollarSign, Globe, Database, Layers, FileCode, X } from 'lucide-react';

function AppPreview({ data, onStartNew }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [celebrationActive, setCelebrationActive] = useState(true);
  const [selectedCodeFile, setSelectedCodeFile] = useState('App.jsx');

  const validation = data.validation;

  useEffect(() => {
    setTimeout(() => setCelebrationActive(false), 3000);
  }, []);

  const codePreview = {
    'App.jsx': `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;`,
    'server.js': `const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});`,
    'schema.prisma': `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
}`
  };

  return (
    <div className="min-h-screen relative">
      {/* Celebration Confetti */}
      {celebrationActive && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                background: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'][Math.floor(Math.random() * 4)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Hero Success Section */}
        <div className="text-center mb-12">
          {/* Success Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-6 shadow-2xl shadow-emerald-500/25">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your App is <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Ready!</span> 🎉
          </h1>

          {/* Stats Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <StatPill icon={<FileCode />} label="Files" value={data.files_generated} />
            <StatPill icon={<Code />} label="Lines" value={data.lines_of_code.toLocaleString()} />
            <StatPill icon={<Zap />} label="Time Saved" value={data.time_saved} />
            <StatPill icon={<Award />} label="QA Score" value={`${data.qa_results?.overall_score}/100`} />
          </div>

          {/* Main Actions */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <a 
              href={`http://localhost:5000${data.download_url}`}
              download
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all hover:scale-[1.02]"
            >
              <Download className="w-5 h-5" />
              <span>Download Code</span>
              <span className="text-xs opacity-80">({data.files_generated} files)</span>
            </a>
            
            {data.deployment_ready && (
              <button 
                onClick={() => setShowDeployModal(true)}
                className="group flex items-center gap-2 px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-white font-semibold rounded-xl transition-all hover:scale-[1.02]"
              >
                <Rocket className="w-5 h-5 group-hover:animate-bounce" />
                <span>Deploy Now</span>
              </button>
            )}
            
            <button 
              onClick={() => setShowShareModal(true)}
              className="px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>

          {/* Deployment Ready Badge */}
          {data.deployment_ready && (
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-full">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 font-medium text-sm">Production Ready • Deploy Anytime</span>
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-10">
          <MetricCard
            icon={<DollarSign className="w-6 h-6" />}
            label="Estimated Value"
            value={data.estimated_value}
            color="from-emerald-500 to-teal-600"
          />
          <MetricCard
            icon={<BarChart3 className="w-6 h-6" />}
            label="Viability Score"
            value={`${validation.viability_score}/100`}
            color="from-blue-500 to-indigo-600"
          />
          <MetricCard
            icon={<Users className="w-6 h-6" />}
            label="Market Size"
            value={validation.market_size?.som || 'Large'}
            color="from-purple-500 to-pink-600"
          />
          <MetricCard
            icon={<Target className="w-6 h-6" />}
            label="Competitors"
            value={validation.competitors?.length || 0}
            color="from-orange-500 to-red-600"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <TabButton 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
            icon={<BarChart3 />}
          >
            Overview
          </TabButton>
          <TabButton 
            active={activeTab === 'code'} 
            onClick={() => setActiveTab('code')}
            icon={<Code />}
            badge={data.files_generated}
          >
            Code
          </TabButton>
          <TabButton 
            active={activeTab === 'architecture'} 
            onClick={() => setActiveTab('architecture')}
            icon={<Layers />}
          >
            Architecture
          </TabButton>
          <TabButton 
            active={activeTab === 'market'} 
            onClick={() => setActiveTab('market')}
            icon={<Target />}
          >
            Market
          </TabButton>
          <TabButton 
            active={activeTab === 'qa'} 
            onClick={() => setActiveTab('qa')}
            icon={<Award />}
            badge={data.qa_results?.overall_score}
          >
            QA Report
          </TabButton>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Value Proposition */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">Unique Value Proposition</h3>
                    <p className="text-slate-300 leading-relaxed">{validation.unique_value_proposition}</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <QuickStatCard
                  title="Generated Files"
                  items={[
                    { label: 'React Components', value: Math.floor(data.files_generated * 0.4) },
                    { label: 'API Routes', value: Math.floor(data.files_generated * 0.3) },
                    { label: 'Database Models', value: Math.floor(data.files_generated * 0.3) }
                  ]}
                  icon={<FileCode />}
                  color="from-blue-500 to-indigo-600"
                />
                <QuickStatCard
                  title="Tech Stack"
                  items={[
                    { label: 'Frontend', value: 'React 18' },
                    { label: 'Backend', value: 'Node.js' },
                    { label: 'Database', value: 'PostgreSQL' }
                  ]}
                  icon={<Layers />}
                  color="from-purple-500 to-pink-600"
                />
                <QuickStatCard
                  title="Code Quality"
                  items={[
                    { label: 'Security', value: `${data.qa_results?.security?.score || 85}/100` },
                    { label: 'Performance', value: `${data.qa_results?.performance?.score || 82}/100` },
                    { label: 'Best Practices', value: `${data.qa_results?.code_quality?.score || 88}/100` }
                  ]}
                  icon={<Award />}
                  color="from-emerald-500 to-teal-600"
                />
              </div>

              {/* Target Audience */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Target Audience
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Primary Persona</h4>
                    <p className="text-slate-300">{validation.target_audience.primary_persona}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Demographics</h4>
                    <p className="text-slate-300">{validation.target_audience.demographics}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Key Pain Points</h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {validation.target_audience.pain_points.map((pain, i) => (
                      <div key={i} className="flex items-start gap-2 bg-slate-800/30 rounded-lg p-3">
                        <Target className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-400 text-sm">{pain}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-500 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">AI Recommendation</h3>
                    <p className="text-slate-300 leading-relaxed">{validation.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-6 animate-fade-in">
              {/* Code Browser */}
              <div className="bg-black/40 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
                {/* File Tabs */}
                <div className="bg-slate-800/50 border-b border-slate-700 px-4 py-2 flex gap-2 overflow-x-auto">
                  {Object.keys(codePreview).map((file) => (
                    <button
                      key={file}
                      onClick={() => setSelectedCodeFile(file)}
                      className={`px-3 py-2 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                        selectedCodeFile === file
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                      }`}
                    >
                      {file}
                    </button>
                  ))}
                </div>

                {/* Code Content */}
                <div className="relative">
                  <button className="absolute top-4 right-4 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-white text-xs font-medium flex items-center gap-2 transition-all">
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </button>
                  <pre className="p-6 overflow-x-auto">
                    <code className="text-slate-300 font-mono text-xs leading-relaxed">
                      {codePreview[selectedCodeFile]}
                    </code>
                  </pre>
                </div>
              </div>

              {/* Code Packages */}
              <div className="grid md:grid-cols-3 gap-4">
                <CodePackageCard
                  icon={<Globe />}
                  title="Frontend"
                  tech="React + Tailwind"
                  files={`${Math.floor(data.files_generated * 0.5)} files`}
                  color="from-blue-500 to-indigo-600"
                />
                <CodePackageCard
                  icon={<Database />}
                  title="Backend"
                  tech="Node.js + Express"
                  files={`${Math.floor(data.files_generated * 0.3)} files`}
                  color="from-purple-500 to-pink-600"
                />
                <CodePackageCard
                  icon={<Database />}
                  title="Database"
                  tech="PostgreSQL + Prisma"
                  files={`${Math.floor(data.files_generated * 0.2)} files`}
                  color="from-emerald-500 to-teal-600"
                />
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="animate-fade-in">
              <ArchitectureDiagram />
            </div>
          )}

          {activeTab === 'market' && (
            <div className="animate-fade-in">
              <MarketAnalysisSection validation={validation} />
            </div>
          )}

          {activeTab === 'qa' && (
            <div className="animate-fade-in">
              <QAReportSection qaResults={data.qa_results} />
            </div>
          )}
        </div>

        {/* Next Steps CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">What's Next?</h3>
          <p className="text-slate-400 mb-6">Deploy your app and start generating revenue</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button 
              onClick={() => setShowDeployModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Rocket className="w-5 h-5" />
              Deploy Now
            </button>
            <button 
              onClick={onStartNew}
              className="px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:bg-slate-800 text-white font-semibold rounded-xl flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              Build Another App
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDeployModal && (
        <DeployModal onClose={() => setShowDeployModal(false)} />
      )}

      {showShareModal && (
        <ShareModal onClose={() => setShowShareModal(false)} />
      )}

      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

// Supporting Components
function StatPill({ icon, label, value }) {
  return (
    <div className="inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 px-4 py-2 rounded-full">
      <div className="text-slate-400">{icon}</div>
      <div>
        <div className="text-white font-bold text-sm tabular-nums">{value}</div>
        <div className="text-slate-500 text-xs">{label}</div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color }) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-5 hover:bg-slate-800/50 hover:border-slate-600 transition-all">
      <div className={`inline-flex p-3 bg-gradient-to-br ${color} rounded-xl mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-white mb-1 tabular-nums">{value}</div>
      <div className="text-xs font-medium text-slate-500 uppercase">{label}</div>
    </div>
  );
}

function TabButton({ active, onClick, icon, children, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap text-sm ${
        active 
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
          : 'bg-slate-800/30 text-slate-400 hover:bg-slate-800/50 hover:text-slate-300 border border-slate-700'
      }`}
    >
      {icon}
      <span>{children}</span>
      {badge !== null && badge !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          active ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-500'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function QuickStatCard({ title, items, icon, color }) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 bg-gradient-to-br ${color} rounded-lg`}>
          {icon}
        </div>
        <h4 className="text-sm font-semibold text-white">{title}</h4>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <span className="text-slate-400">{item.label}</span>
            <span className="text-white font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CodePackageCard({ icon, title, tech, files, color }) {
  return (
    <div className="group bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-5 hover:bg-slate-800/50 hover:border-slate-600 transition-all">
      <div className={`inline-flex p-3 bg-gradient-to-br ${color} rounded-xl mb-3 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h4 className="text-base font-semibold text-white mb-1">{title}</h4>
      <p className="text-slate-400 text-sm mb-1">{tech}</p>
      <p className="text-slate-500 text-xs">{files}</p>
    </div>
  );
}

function ArchitectureDiagram() {
  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
      <h3 className="text-xl font-bold text-white mb-6 text-center">System Architecture</h3>
      <div className="max-w-2xl mx-auto">
        <div className="space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 rounded-xl">
              <Globe className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">React Frontend</span>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-0.5 h-10 bg-gradient-to-b from-blue-500 to-purple-500"></div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-3 rounded-xl">
              <Layers className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Node.js Backend</span>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-0.5 h-10 bg-gradient-to-b from-purple-500 to-emerald-500"></div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 rounded-xl">
              <Database className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">PostgreSQL Database</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketAnalysisSection({ validation }) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        {['tam', 'sam', 'som'].map((key) => (
          <div key={key} className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">
              {key === 'tam' ? 'Total Market' : key === 'sam' ? 'Serviceable Market' : 'Obtainable Market'}
            </h4>
            <div className="text-3xl font-bold text-white">{validation.market_size?.[key]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QAReportSection({ qaResults }) {
  const categories = [
    { key: 'code_quality', label: 'Code Quality', color: 'blue' },
    { key: 'security', label: 'Security', color: 'emerald' },
    { key: 'performance', label: 'Performance', color: 'purple' },
    { key: 'functionality', label: 'Functionality', color: 'orange' }
  ];

  return (
    <div className="space-y-4">
      {categories.map(({ key, label, color }) => (
        <div key={key} className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-semibold text-white">{label}</h4>
            <div className="text-2xl font-bold text-white">{qaResults?.[key]?.score || 0}/100</div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-full transition-all`}
              style={{ width: `${qaResults?.[key]?.score || 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DeployModal({ onClose }) {
  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Deploy Your App</h3>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <DeployOption
            name="Vercel"
            description="Best for frontend deployment"
            time="5 min"
            cost="Free"
          />
          <DeployOption
            name="Railway"
            description="Full-stack deployment"
            time="10 min"
            cost="$5/mo"
          />
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800">
          <h4 className="text-sm font-semibold text-white mb-3">Quick Deploy Steps</h4>
          <ol className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
              <span>Install CLI: npm install -g vercel</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
              <span>Navigate to frontend folder</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
              <span>Run: vercel --prod</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function DeployOption({ name, description, time, cost }) {
  return (
    <button className="w-full text-left border border-slate-700 hover:border-slate-600 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl p-4 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-semibold text-white mb-1">{name}</h4>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-300 font-medium">{time}</div>
          <div className="text-xs text-slate-500">{cost}</div>
        </div>
      </div>
    </button>
  );
}

function ShareModal({ onClose }) {
  const shareUrl = window.location.href;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied!');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl mb-4">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Share Your Success</h3>
          <p className="text-slate-400 text-sm">Let others see what you've built</p>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex items-center gap-2">
            <input 
              type="text" 
              value={shareUrl}
              readOnly
              className="flex-1 bg-transparent text-slate-300 text-sm focus:outline-none"
            />
            <button 
              onClick={copyToClipboard}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-lg transition-all flex items-center gap-2 text-sm"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { name: 'Twitter', icon: '𝕏', color: 'from-slate-600 to-slate-700' },
              { name: 'LinkedIn', icon: 'in', color: 'from-blue-600 to-blue-700' },
              { name: 'Facebook', icon: 'f', color: 'from-blue-500 to-blue-600' },
              { name: 'Email', icon: '✉', color: 'from-slate-600 to-slate-700' }
            ].map((platform) => (
              <button
                key={platform.name}
                className={`bg-gradient-to-br ${platform.color} p-4 rounded-xl text-white font-bold text-2xl hover:scale-110 transition-transform`}
                title={platform.name}
              >
                {platform.icon}
              </button>
            ))}
          </div>

          <button 
            onClick={onClose}
            className="w-full px-4 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white font-medium rounded-xl transition-all text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppPreview;