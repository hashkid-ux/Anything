import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, Users, Target, AlertTriangle, CheckCircle, DollarSign, Sparkles, Download, Share2 } from 'lucide-react';

function ResultsDisplay({ results, onBack, onUpgrade }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  const validation = results.validation;
  const viabilityScore = validation.viability_score;

  // Determine viability status
  const getViabilityStatus = (score) => {
    if (score >= 80) return { text: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { text: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 40) return { text: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { text: 'High Risk', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const status = getViabilityStatus(viabilityScore);

  return (
    <section className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Validator</span>
          </button>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm font-semibold">Export PDF</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-semibold">Share</span>
            </button>
          </div>
        </div>

        {/* Viability Score Card */}
        <div className="glass-effect rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className={`${status.bg} ${status.color} px-4 py-2 rounded-lg font-bold text-sm`}>
                  {status.text}
                </div>
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Viability Analysis Complete</h2>
              <p className="text-gray-600">
                Based on market data, competitor analysis, and business model evaluation
              </p>
            </div>
            
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(viabilityScore / 100) * 440} 440`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold gradient-text">{viabilityScore}</div>
                <div className="text-sm text-gray-500">Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <TabButton 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
            icon={<Target className="w-4 h-4" />}
          >
            Overview
          </TabButton>
          <TabButton 
            active={activeTab === 'market'} 
            onClick={() => setActiveTab('market')}
            icon={<TrendingUp className="w-4 h-4" />}
          >
            Market Analysis
          </TabButton>
          <TabButton 
            active={activeTab === 'competitors'} 
            onClick={() => setActiveTab('competitors')}
            icon={<Users className="w-4 h-4" />}
          >
            Competitors
          </TabButton>
          <TabButton 
            active={activeTab === 'revenue'} 
            onClick={() => setActiveTab('revenue')}
            icon={<DollarSign className="w-4 h-4" />}
          >
            Revenue
          </TabButton>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* UVP */}
              <div className="card">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Unique Value Proposition
                </h3>
                <p className="text-gray-700 leading-relaxed">{validation.unique_value_proposition}</p>
              </div>

              {/* Target Audience */}
              <div className="card">
                <h3 className="text-xl font-bold mb-4">Target Audience</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Primary Persona</h4>
                    <p className="text-gray-600">{validation.target_audience.primary_persona}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Demographics</h4>
                    <p className="text-gray-600">{validation.target_audience.demographics}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Pain Points</h4>
                    <ul className="space-y-2">
                      {validation.target_audience.pain_points.map((pain, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-600">
                          <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-1" />
                          <span>{pain}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Risks */}
              <div className="card">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Risk Analysis
                </h3>
                <div className="space-y-3">
                  {validation.risks.map((risk, index) => (
                    <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-800">{risk.risk}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          risk.severity === 'high' ? 'bg-red-100 text-red-700' :
                          risk.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {risk.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        <strong>Mitigation:</strong> {risk.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className={`card border-2 ${
                validation.recommendation.toLowerCase().includes('go ahead') || 
                validation.recommendation.toLowerCase().includes('proceed') ?
                'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'
              }`}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Final Recommendation
                </h3>
                <p className="text-gray-700 leading-relaxed">{validation.recommendation}</p>
              </div>
            </>
          )}

          {activeTab === 'market' && (
            <>
              <div className="card">
                <h3 className="text-xl font-bold mb-6">Market Size Analysis</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                    <div className="text-sm text-gray-600 mb-2">Total Addressable Market</div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">{validation.market_size.tam}</div>
                    <div className="text-xs text-gray-500">Everyone who could use this</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                    <div className="text-sm text-gray-600 mb-2">Serviceable Addressable Market</div>
                    <div className="text-3xl font-bold text-purple-600 mb-2">{validation.market_size.sam}</div>
                    <div className="text-xs text-gray-500">Who you can realistically reach</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                    <div className="text-sm text-gray-600 mb-2">Serviceable Obtainable Market</div>
                    <div className="text-3xl font-bold text-green-600 mb-2">{validation.market_size.som}</div>
                    <div className="text-xs text-gray-500">Your realistic target</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold mb-4">Go-To-Market Strategy</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Marketing Channels</h4>
                    <div className="flex flex-wrap gap-2">
                      {validation.go_to_market_strategy.channels.map((channel, index) => (
                        <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Customer Acquisition Cost</div>
                      <div className="text-2xl font-bold text-gray-800">{validation.go_to_market_strategy.customer_acquisition_cost}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Lifetime Value</div>
                      <div className="text-2xl font-bold text-gray-800">{validation.go_to_market_strategy.lifetime_value}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'competitors' && (
            <div className="space-y-4">
              {validation.competitors.map((competitor, index) => (
                <div key={index} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold">{competitor.name}</h3>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      {competitor.market_share} market share
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Strengths
                      </h4>
                      <ul className="space-y-1">
                        {competitor.strengths.map((strength, i) => (
                          <li key={i} className="text-gray-600 text-sm">• {strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Weaknesses
                      </h4>
                      <ul className="space-y-1">
                        {competitor.weaknesses.map((weakness, i) => (
                          <li key={i} className="text-gray-600 text-sm">• {weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'revenue' && (
            <>
              <div className="card">
                <h3 className="text-xl font-bold mb-6">Revenue Projections</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
                    <div className="text-sm text-gray-600 mb-2">Year 1</div>
                    <div className="text-3xl font-bold text-green-600 mb-2">{validation.revenue_potential.year_1}</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl">
                    <div className="text-sm text-gray-600 mb-2">Year 2</div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">{validation.revenue_potential.year_2}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                    <div className="text-sm text-gray-600 mb-2">Year 3</div>
                    <div className="text-3xl font-bold text-purple-600 mb-2">{validation.revenue_potential.year_3}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* CTA */}
        <div className="card bg-gradient-to-r from-blue-600 to-purple-600 text-white mt-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Ready to Build This?</h3>
            <p className="mb-6 text-blue-100">
              Upgrade to Starter to generate code, deploy your app, and start making money.
            </p>
            <button onClick={onUpgrade} className="bg-white text-purple-600 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors">
              Upgrade to Starter - $299/month
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TabButton({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
        active 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

export default ResultsDisplay;