import React, { useState, useEffect } from 'react';
import { Download, ExternalLink, Share2, Sparkles, Code, Smartphone, Globe, DollarSign, TrendingUp, Users, Target, CheckCircle, ArrowRight, Copy, Play, Zap, Brain, Package, Database, Layers, FileCode, Award, BarChart3, Rocket as RocketIcon } from 'lucide-react';

function AppPreview({ data, onStartNew }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [celebrationActive, setCelebrationActive] = useState(true);
  const [selectedCodeFile, setSelectedCodeFile] = useState('App.jsx');

  const validation = data.validation;

  useEffect(() => {
    // Celebration confetti effect
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Celebration Confetti Effect */}
      {celebrationActive && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
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

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Hero Success Section */}
        <div className="text-center mb-16">
          {/* Success Badge */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-8 animate-scale-in shadow-2xl">
            <CheckCircle className="w-12 h-12 text-white animate-bounce" />
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 animate-slide-up">
            Your App is <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Ready!</span> 🎉
          </h1>

          {/* Stats Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <StatPill icon={<FileCode />} label="Files" value={data.files_generated} color="blue" />
            <StatPill icon={<Code />} label="Lines" value={data.lines_of_code.toLocaleString()} color="purple" />
            <StatPill icon={<Zap />} label="Time Saved" value={data.time_saved} color="green" />
            <StatPill icon={<Award />} label="QA Score" value={`${data.qa_results?.overall_score}/100`} color="orange" />
          </div>

          {/* Main Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <a 
              href={`http://localhost:5000${data.download_url}`}
              download
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-6 h-6" />
              <span>Download Code</span>
              <span className="text-sm opacity-80">({data.files_generated} files)</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity -z-10"></div>
            </a>
            
            {data.deployment_ready && (
              <button 
                onClick={() => setShowDeployModal(true)}
                className="group px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/20 hover:bg-white/20 hover:border-white/30 text-white font-bold rounded-2xl flex items-center gap-3 transition-all hover:scale-105"
              >
                <RocketIcon className="w-6 h-6 group-hover:animate-bounce" />
                <span>Deploy Now</span>
              </button>
            )}
            
            <button 
              onClick={() => setShowShareModal(true)}
              className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/20 hover:bg-white/20 hover:border-white/30 text-white font-bold rounded-2xl flex items-center gap-3 transition-all hover:scale-105"
            >
              <Share2 className="w-6 h-6" />
              <span>Share</span>
            </button>
          </div>

          {/* Deployment Ready Badge */}
          {data.deployment_ready && (
            <div className="inline-flex items-center gap-2 bg-green-500/20 border-2 border-green-500/50 px-6 py-3 rounded-full animate-pulse">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-bold">Production Ready • QA Passed • Deploy Anytime</span>
            </div>
          )}
        </div>

        {/* Key Metrics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <MetricCard
            icon={<DollarSign className="w-8 h-8" />}
            label="Estimated Value"
            value={data.estimated_value}
            color="from-green-500 to-emerald-600"
            detail="Market value"
          />
          <MetricCard
            icon={<TrendingUp className="w-8 h-8" />}
            label="Viability Score"
            value={`${validation.viability_score}/100`}
            color="from-blue-500 to-cyan-600"
            detail="Business potential"
          />
          <MetricCard
            icon={<Users className="w-8 h-8" />}
            label="Market Size"
            value={validation.market_size?.som || 'Large'}
            color="from-purple-500 to-pink-600"
            detail="Target audience"
          />
          <MetricCard
            icon={<Target className="w-8 h-8" />}
            label="Competition"
            value={validation.competitors?.length || 0}
            color="from-orange-500 to-red-600"
            detail="Analyzed"
          />
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <TabButton 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
            icon={<Sparkles />}
            badge={null}
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
            icon={<BarChart3 />}
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
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Value Proposition Card */}
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-white mb-3">Unique Value Proposition</h3>
                    <p className="text-xl text-gray-200 leading-relaxed">{validation.unique_value_proposition}</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                <QuickStatCard
                  title="Generated Files"
                  items={[
                    { label: 'React Components', value: Math.floor(data.files_generated * 0.4) },
                    { label: 'API Routes', value: Math.floor(data.files_generated * 0.3) },
                    { label: 'Database Models', value: Math.floor(data.files_generated * 0.3) }
                  ]}
                  icon={<Package />}
                  color="from-blue-500 to-cyan-600"
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
                  color="from-green-500 to-emerald-600"
                />
              </div>

              {/* Target Audience */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Users className="w-7 h-7 text-blue-400" />
                  Target Audience
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Primary Persona</h4>
                    <p className="text-gray-200 text-lg">{validation.target_audience.primary_persona}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Demographics</h4>
                    <p className="text-gray-200 text-lg">{validation.target_audience.demographics}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Key Pain Points</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {validation.target_audience.pain_points.map((pain, i) => (
                      <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                        <Target className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{pain}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border-2 border-green-500/30 rounded-3xl p-8">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-green-500 rounded-2xl">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-white mb-3">AI Recommendation</h3>
                    <p className="text-xl text-gray-200 leading-relaxed">{validation.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-6 animate-fade-in">
              {/* Code Browser */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                {/* File Tabs */}
                <div className="bg-white/5 border-b border-white/10 px-4 py-3 flex gap-2 overflow-x-auto">
                  {Object.keys(codePreview).map((file) => (
                    <button
                      key={file}
                      onClick={() => setSelectedCodeFile(file)}
                      className={`px-4 py-2 rounded-lg text-sm font-mono transition-all whitespace-nowrap ${
                        selectedCodeFile === file
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {file}
                    </button>
                  ))}
                </div>

                {/* Code Content */}
                <div className="relative">
                  <button className="absolute top-4 right-4 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-semibold flex items-center gap-2 transition-all">
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  <pre className="p-8 overflow-x-auto">
                    <code className="text-gray-300 font-mono text-sm leading-relaxed">
                      {codePreview[selectedCodeFile]}
                    </code>
                  </pre>
                </div>
              </div>

              {/* Code Packages */}
              <div className="grid md:grid-cols-3 gap-6">
                <CodePackageCard
                  icon={<Globe />}
                  title="Frontend"
                  tech="React + Tailwind"
                  files={`${Math.floor(data.files_generated * 0.5)} files`}
                  color="from-blue-500 to-cyan-600"
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
                  color="from-green-500 to-emerald-600"
                />
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-6 animate-fade-in">
              <ArchitectureDiagram />
            </div>
          )}

          {activeTab === 'market' && (
            <div className="space-y-6 animate-fade-in">
              <MarketAnalysisSection validation={validation} />
            </div>
          )}

          {activeTab === 'qa' && (
            <div className="space-y-6 animate-fade-in">
              <QAReportSection qaResults={data.qa_results} />
            </div>
          )}
        </div>

        {/* Next Steps CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl p-12 text-center">
          <h3 className="text-3xl font-black text-white mb-4">What's Next?</h3>
          <p className="text-xl text-gray-300 mb-8">Deploy your app and start making money</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setShowDeployModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-2xl flex items-center gap-3 transition-all hover:scale-105 shadow-2xl"
            >
              <RocketIcon className="w-6 h-6" />
              Deploy Now
            </button>
            <button 
              onClick={onStartNew}
              className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/20 hover:bg-white/20 text-white font-bold rounded-2xl flex items-center gap-3 transition-all hover:scale-105"
            >
              Build Another App
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Deploy Modal */}
      {showDeployModal && (
        <DeployModal onClose={() => setShowDeployModal(false)} />
      )}

      {/* Share Modal */}
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
function StatPill({ icon, label, value, color }) {
  const colors = {
    blue: 'from-blue-500 to-cyan-600',
    purple: 'from-purple-500 to-pink-600',
    green: 'from-green-500 to-emerald-600',
    orange: 'from-orange-500 to-red-600'
  };

  return (
    <div className={`inline-flex items-center gap-3 bg-gradient-to-r ${colors[color]} px-6 py-3 rounded-full`}>
      <div className="text-white">{icon}</div>
      <div>
        <div className="text-white font-black text-lg tabular-nums">{value}</div>
        <div className="text-white/80 text-xs font-medium">{label}</div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color, detail }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:scale-105 transition-all">
      <div className={`inline-flex p-4 bg-gradient-to-br ${color} rounded-2xl mb-4`}>
        {icon}
      </div>
      <div className="text-3xl font-black text-white mb-1 tabular-nums">{value}</div>
      <div className="text-sm font-bold text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="text-xs text-gray-500 mt-1">{detail}</div>
    </div>
  );
}

function TabButton({ active, onClick, icon, children, badge }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all ${
        active 
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl scale-105' 
          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
      }`}
    >
      {icon}
      <span>{children}</span>
      {badge !== null && badge !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          active ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-400'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function QuickStatCard({ title, items, icon, color }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 bg-gradient-to-br ${color} rounded-xl`}>
          {icon}
        </div>
        <h4 className="text-lg font-bold text-white">{title}</h4>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">{item.label}</span>
            <span className="text-white font-bold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CodePackageCard({ icon, title, tech, files, color }) {
  return (
    <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:scale-105 transition-all">
      <div className={`inline-flex p-4 bg-gradient-to-br ${color} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
      <p className="text-gray-400 mb-1">{tech}</p>
      <p className="text-gray-500 text-sm">{files}</p>
    </div>
  );
}

function ArchitectureDiagram() {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
      <h3 className="text-2xl font-bold text-white mb-8 text-center">System Architecture</h3>
      <div className="max-w-3xl mx-auto">
        {/* Simplified architecture visualization */}
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-cyan-600 px-8 py-4 rounded-2xl">
              <Globe className="w-6 h-6 text-white" />
              <span className="text-white font-bold text-lg">React Frontend</span>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-1 h-12 bg-gradient-to-b from-blue-500 to-purple-500"></div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-600 px-8 py-4 rounded-2xl">
              <Layers className="w-6 h-6 text-white" />
              <span className="text-white font-bold text-lg">Node.js Backend</span>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-1 h-12 bg-gradient-to-b from-purple-500 to-green-500"></div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4 rounded-2xl">
              <Database className="w-6 h-6 text-white" />
              <span className="text-white font-bold text-lg">PostgreSQL Database</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketAnalysisSection({ validation }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {['tam', 'sam', 'som'].map((key, i) => (
          <div key={key} className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
            <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">
              {key === 'tam' ? 'Total Addressable Market' : key === 'sam' ? 'Serviceable Market' : 'Obtainable Market'}
            </h4>
            <div className="text-3xl font-black text-white">{validation.market_size?.[key]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QAReportSection({ qaResults }) {
  const categories = [
    { key: 'code_quality', label: 'Code Quality', color: 'blue' },
    { key: 'security', label: 'Security', color: 'green' },
    { key: 'performance', label: 'Performance', color: 'purple' },
    { key: 'functionality', label: 'Functionality', color: 'orange' }
  ];

  return (
    <div className="space-y-6">
      {categories.map(({ key, label, color }) => (
        <div key={key} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-bold text-white">{label}</h4>
            <div className="text-3xl font-black text-white">{qaResults?.[key]?.score || 0}/100</div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
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
  const [selectedProvider, setSelectedProvider] = useState('vercel');

  const providers = [
    {
      id: 'vercel',
      name: 'Vercel',
      icon: '▲',
      type: 'Frontend',
      time: '5 min',
      cost: 'Free',
      recommended: true,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'railway',
      name: 'Railway',
      icon: '🚂',
      type: 'Backend + DB',
      time: '10 min',
      cost: '$5/mo',
      recommended: true,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'render',
      name: 'Render',
      icon: '🎨',
      type: 'Full-Stack',
      time: '15 min',
      cost: 'Free tier',
      recommended: false,
      color: 'from-green-500 to-emerald-600'
    }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-white/20 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 px-8 py-6 flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-black text-white mb-2">Deploy Your App</h3>
            <p className="text-gray-400">Choose your deployment platform</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            <ExternalLink className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Provider Cards */}
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider.id)}
              className={`w-full text-left border-2 rounded-2xl p-6 transition-all ${
                selectedProvider === provider.id
                  ? 'border-purple-500 bg-purple-500/10 scale-105'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
              } ${provider.recommended ? 'relative' : ''}`}
            >
              {provider.recommended && (
                <div className="absolute -top-3 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                  RECOMMENDED
                </div>
              )}
              <div className="flex items-center gap-6">
                <div className={`text-6xl bg-gradient-to-br ${provider.color} p-4 rounded-2xl`}>
                  {provider.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-white mb-1">{provider.name}</h4>
                  <p className="text-gray-400 mb-3">{provider.type}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-2 text-gray-300">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      {provider.time}
                    </span>
                    <span className="flex items-center gap-2 text-gray-300">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      {provider.cost}
                    </span>
                  </div>
                </div>
                {selectedProvider === provider.id && (
                  <CheckCircle className="w-8 h-8 text-purple-400" />
                )}
              </div>
            </button>
          ))}

          {/* Deployment Steps */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-green-400" />
              Quick Deploy Steps
            </h4>
            <ol className="space-y-3">
              {[
                'Install CLI: npm install -g vercel',
                'Navigate to frontend folder',
                'Run: vercel --prod',
                'Your app is live! 🎉'
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button 
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-2xl"
            >
              View Full Guide
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-2xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
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
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-white/20 rounded-3xl max-w-lg w-full p-8 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <Share2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-3xl font-black text-white mb-2">Share Your Success</h3>
          <p className="text-gray-400">Let others see what you've built</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
            <input 
              type="text" 
              value={shareUrl}
              readOnly
              className="flex-1 bg-transparent text-gray-300 text-sm focus:outline-none"
            />
            <button 
              onClick={copyToClipboard}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[
              { name: 'Twitter', color: 'from-blue-400 to-blue-600', icon: '𝕏' },
              { name: 'LinkedIn', color: 'from-blue-600 to-blue-800', icon: 'in' },
              { name: 'Facebook', color: 'from-blue-500 to-blue-700', icon: 'f' },
              { name: 'Email', color: 'from-gray-600 to-gray-800', icon: '✉' }
            ].map((platform) => (
              <button
                key={platform.name}
                className={`bg-gradient-to-br ${platform.color} p-4 rounded-xl text-white font-bold text-2xl hover:scale-110 transition-transform`}
              >
                {platform.icon}
              </button>
            ))}
          </div>

          <button 
            onClick={onClose}
            className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppPreview;