import React, { useState } from 'react';
import { Download, ExternalLink, Share2, Sparkles, Code, Smartphone, Globe, DollarSign, TrendingUp, Users, Target, CheckCircle, ArrowRight } from 'lucide-react';

function AppPreview({ data, onStartNew }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeployModal, setShowDeployModal] = useState(false);

  const validation = data.validation;

  const handleDeploy = () => {
    setShowDeployModal(true);
  };

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Your App is Ready! 🎉
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            {data.files_generated} files • {data.lines_of_code.toLocaleString()} lines of code • {data.time_saved} work saved
          </p>
          
          {/* QA Score Badge */}
          {data.qa_results && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 px-4 py-2 rounded-full mt-4">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-semibold">
                QA Score: {data.qa_results.overall_score}/100
              </span>
              {data.deployment_ready && (
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full ml-2">
                  DEPLOYMENT READY
                </span>
              )}
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <a 
              href={`http://localhost:5000${data.download_url}`}
              download
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-xl shadow-2xl flex items-center gap-2 transition-all no-underline"
            >
              <Download className="w-5 h-5" />
              Download Code ({data.files_generated} files)
            </a>
            
            {data.deployment_ready && (
              <button 
                onClick={handleDeploy}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-8 py-4 rounded-xl shadow-2xl flex items-center gap-2 transition-all"
              >
                <ExternalLink className="w-5 h-5" />
                Deploy Now (Free)
              </button>
            )}
            
            <button className="bg-white/10 hover:bg-white/20 border-2 border-white/20 text-white font-bold px-8 py-4 rounded-xl flex items-center gap-2 transition-all">
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={DollarSign} label="Estimated Value" value={data.estimated_value} color="green" />
          <StatCard icon={TrendingUp} label="Viability Score" value={`${validation.viability_score}/100`} color="blue" />
          <StatCard icon={Users} label="Market Size" value={validation.market_size?.som || 'N/A'} color="purple" />
          <StatCard icon={Target} label="Files Generated" value={data.files_generated} color="pink" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            Overview
          </TabButton>
          <TabButton active={activeTab === 'market'} onClick={() => setActiveTab('market')}>
            Market Analysis
          </TabButton>
          <TabButton active={activeTab === 'competitors'} onClick={() => setActiveTab('competitors')}>
            Competitors
          </TabButton>
          {data.qa_results && (
            <TabButton active={activeTab === 'qa'} onClick={() => setActiveTab('qa')}>
              QA Report
            </TabButton>
          )}
          <TabButton active={activeTab === 'code'} onClick={() => setActiveTab('code')}>
            Generated Code
          </TabButton>
        </div>

        {/* Content Area */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* UVP */}
              <div>
                <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  Unique Value Proposition
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {validation.unique_value_proposition}
                </p>
              </div>

              {/* Target Audience */}
              <div className="bg-white/5 rounded-xl p-6">
                <h4 className="text-xl font-bold text-white mb-4">Target Audience</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-400">Primary Persona:</span>
                    <p className="text-gray-300">{validation.target_audience.primary_persona}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Demographics:</span>
                    <p className="text-gray-300">{validation.target_audience.demographics}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Key Pain Points:</span>
                    <ul className="mt-2 space-y-2">
                      {validation.target_audience.pain_points.map((pain, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-300">
                          <span className="text-purple-400">•</span>
                          {pain}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-xl p-6">
                <h4 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  AI Recommendation
                </h4>
                <p className="text-gray-200 leading-relaxed">{validation.recommendation}</p>
              </div>
            </div>
          )}

          {activeTab === 'market' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">Market Opportunity</h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
                  <div className="text-sm text-blue-300 mb-2">Total Addressable Market</div>
                  <div className="text-3xl font-bold text-white mb-2">{validation.market_size.tam}</div>
                  <div className="text-xs text-gray-400">Everyone who could use this</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
                  <div className="text-sm text-purple-300 mb-2">Serviceable Addressable Market</div>
                  <div className="text-3xl font-bold text-white mb-2">{validation.market_size.sam}</div>
                  <div className="text-xs text-gray-400">Who you can realistically reach</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
                  <div className="text-sm text-green-300 mb-2">Serviceable Obtainable Market</div>
                  <div className="text-3xl font-bold text-white mb-2">{validation.market_size.som}</div>
                  <div className="text-xs text-gray-400">Your realistic target</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <h4 className="text-xl font-bold text-white mb-4">Go-To-Market Strategy</h4>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-400 block mb-2">Recommended Channels:</span>
                    <div className="flex flex-wrap gap-2">
                      {validation.go_to_market_strategy.channels.map((channel, i) => (
                        <span key={i} className="bg-purple-500/20 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-full text-sm">
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Customer Acquisition Cost</div>
                      <div className="text-2xl font-bold text-white">{validation.go_to_market_strategy.customer_acquisition_cost}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Customer Lifetime Value</div>
                      <div className="text-2xl font-bold text-white">{validation.go_to_market_strategy.lifetime_value}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'competitors' && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white mb-6">Competitive Landscape</h3>
              {validation.competitors.map((comp, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-xl font-bold text-white">{comp.name}</h4>
                    <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
                      {comp.market_share} market share
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Their Strengths
                      </h5>
                      <ul className="space-y-1">
                        {comp.strengths.map((s, i) => (
                          <li key={i} className="text-gray-300 text-sm">• {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Their Weaknesses (Your Opportunity)
                      </h5>
                      <ul className="space-y-1">
                        {comp.weaknesses.map((w, i) => (
                          <li key={i} className="text-gray-300 text-sm">• {w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'qa' && data.qa_results && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">Quality Assurance Report</h3>
              
              {/* Overall Score */}
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-white">Overall Quality Score</h4>
                  <div className="text-4xl font-bold text-white">{data.qa_results.overall_score}/100</div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all"
                    style={{ width: `${data.qa_results.overall_score}%` }}
                  />
                </div>
              </div>

              {/* Category Scores */}
              <div className="grid md:grid-cols-2 gap-4">
                <QAScoreCard title="Code Quality" score={data.qa_results.code_quality?.score || 0} />
                <QAScoreCard title="Functionality" score={data.qa_results.functionality?.score || 0} />
                <QAScoreCard title="Security" score={data.qa_results.security?.score || 0} />
                <QAScoreCard title="Performance" score={data.qa_results.performance?.score || 0} />
              </div>

              {/* Issues */}
              {data.qa_results.code_quality?.issues?.length > 0 && (
                <div className="bg-white/5 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-white mb-4">Issues Found</h4>
                  <div className="space-y-2">
                    {data.qa_results.code_quality.issues.slice(0, 5).map((issue, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          issue.severity === 'critical' ? 'bg-red-500 text-white' :
                          issue.severity === 'high' ? 'bg-orange-500 text-white' :
                          issue.severity === 'medium' ? 'bg-yellow-500 text-black' :
                          'bg-blue-500 text-white'
                        }`}>
                          {issue.severity}
                        </span>
                        <div className="flex-1">
                          <p className="text-gray-300">{issue.message}</p>
                          <p className="text-gray-500 text-xs mt-1">{issue.file}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {data.qa_results.recommendations?.length > 0 && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-white mb-4">Recommendations</h4>
                  <ul className="space-y-2">
                    {data.qa_results.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>{rec.message || rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Generated Code</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <Download className="w-4 h-4" />
                  Download All
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <CodePackage 
                  icon={Globe}
                  title="Web App"
                  tech="React + Node.js"
                  files="23 files"
                  color="blue"
                />
                <CodePackage 
                  icon={Smartphone}
                  title="Mobile App"
                  tech="React Native"
                  files="18 files"
                  color="purple"
                  premium={true}
                />
                <CodePackage 
                  icon={Code}
                  title="Backend API"
                  tech="Express + PostgreSQL"
                  files="12 files"
                  color="green"
                />
              </div>

              <div className="bg-black/40 rounded-xl p-6 font-mono text-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">src/App.jsx</span>
                  <button className="text-gray-400 hover:text-white text-xs">Copy</button>
                </div>
                <pre className="text-gray-300 overflow-x-auto">
{`import React from 'react';
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

export default App;`}
                </pre>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
                <p className="text-yellow-200 text-sm">
                  <strong>💡 Pro Tip:</strong> Full code generation with mobile apps, backend, and deployment configs is available in Starter tier ($299/month)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-4">What's Next?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <NextStepCard 
              title="Deploy Your App"
              description="One-click deployment to Vercel, AWS, or your own server"
              cta="Deploy Now"
              price="$99"
            />
            <NextStepCard 
              title="Get Mobile Apps"
              description="iOS + Android apps generated and ready for App Store"
              cta="Generate Mobile"
              price="$299/mo"
              highlight={true}
            />
            <NextStepCard 
              title="Full Partnership"
              description="Marketing, analytics, growth support, and more"
              cta="Go Premium"
              price="$999/mo"
            />
          </div>
        </div>

        {/* Start New */}
        <div className="text-center mt-8">
          <button 
            onClick={onStartNew}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mx-auto"
          >
            Build Another App
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Deployment Modal */}
        {showDeployModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-white/20 rounded-2xl max-w-2xl w-full p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Deploy Your App</h3>
                <button 
                  onClick={() => setShowDeployModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <DeploymentOption 
                  provider="Vercel"
                  type="Frontend"
                  icon="▲"
                  time="5 min"
                  cost="Free"
                  recommended={true}
                />
                <DeploymentOption 
                  provider="Railway"
                  type="Backend + Database"
                  icon="🚂"
                  time="10 min"
                  cost="$5/mo"
                  recommended={true}
                />
                <DeploymentOption 
                  provider="Render"
                  type="Full Stack"
                  icon="🎨"
                  time="15 min"
                  cost="Free tier"
                  recommended={false}
                />
              </div>

              <div className="mt-6 bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
                <p className="text-blue-200 text-sm">
                  💡 <strong>Recommended:</strong> Deploy frontend to Vercel (free) and backend to Railway ($5/mo includes database)
                </p>
              </div>

              <div className="mt-6 flex gap-4">
                <button 
                  onClick={() => window.open('/api/deploy/guide/' + data.prompt.split(' ')[0], '_blank')}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all"
                >
                  View Deployment Guide
                </button>
                <button 
                  onClick={() => setShowDeployModal(false)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DeploymentOption({ provider, type, icon, time, cost, recommended }) {
  return (
    <div className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
      recommended 
        ? 'border-green-500/50 bg-green-500/10 hover:bg-green-500/20' 
        : 'border-white/10 bg-white/5 hover:bg-white/10'
    }`}>
      {recommended && (
        <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          RECOMMENDED
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className="text-4xl">{icon}</div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-white">{provider}</h4>
          <p className="text-sm text-gray-400">{type}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">{time}</div>
          <div className="text-sm font-semibold text-white">{cost}</div>
        </div>
      </div>
    </div>
  );
}

function QAScoreCard({ title, score }) {
  const getColorClass = (score) => {
    if (score >= 80) return 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400';
    if (score >= 60) return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400';
    return 'from-red-500/20 to-pink-500/20 border-red-500/30 text-red-400';
  };

  return (
    <div className={`bg-gradient-to-br ${getColorClass(score)} border rounded-xl p-6`}>
      <h5 className="text-sm text-gray-300 mb-2">{title}</h5>
      <div className="text-3xl font-bold text-white mb-3">{score}/100</div>
      <div className="w-full bg-white/10 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
    pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/30 text-pink-400'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-4`}>
      <Icon className={`w-6 h-6 ${colors[color].split(' ')[2]} mb-2`} />
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
        active 
          ? 'bg-white/20 text-white border-2 border-white/30' 
          : 'bg-white/5 text-gray-400 hover:bg-white/10 border-2 border-transparent'
      }`}
    >
      {children}
    </button>
  );
}

function CodePackage({ icon: Icon, title, tech, files, color, premium }) {
  const colors = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-6 relative`}>
      {premium && (
        <span className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
          PRO
        </span>
      )}
      <Icon className="w-8 h-8 text-white mb-3" />
      <h4 className="text-lg font-bold text-white mb-1">{title}</h4>
      <p className="text-sm text-gray-300 mb-2">{tech}</p>
      <p className="text-xs text-gray-400">{files}</p>
    </div>
  );
}

function NextStepCard({ title, description, cta, price, highlight }) {
  return (
    <div className={`rounded-xl p-6 ${
      highlight 
        ? 'bg-gradient-to-br from-purple-600 to-pink-600 ring-2 ring-white/50' 
        : 'bg-white/5 border border-white/10'
    }`}>
      {highlight && (
        <div className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
          MOST POPULAR
        </div>
      )}
      <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
      <p className="text-sm text-gray-300 mb-4">{description}</p>
      <button className={`w-full font-semibold py-3 rounded-lg transition-colors ${
        highlight
          ? 'bg-white text-purple-600 hover:bg-gray-100'
          : 'bg-white/10 text-white hover:bg-white/20'
      }`}>
        {cta} - {price}
      </button>
    </div>
  );
}

export default AppPreview;