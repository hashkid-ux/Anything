import React, { useState, useEffect } from 'react';
import { 
  Rocket, Plus, Folder, Download, Eye, Trash2, Crown, Zap, 
  TrendingUp, Code, Users, DollarSign, Target, Award,
  Activity, BarChart3, CheckCircle, AlertCircle,
  ArrowRight, Globe, Database, Layers, ExternalLink, Clock,
  Calendar, Sparkles, Package, Shield, Bell, Settings
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Dashboard({ user, onLogout, onBuildNew, onOpenPricing }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/projects`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierConfig = (tier) => {
    const configs = {
      free: { 
        icon: Zap, 
        color: 'from-slate-500 to-slate-600', 
        label: 'Free', 
        textColor: 'text-slate-400',
        bgColor: 'bg-slate-600'
      },
      starter: { 
        icon: Rocket, 
        color: 'from-blue-500 to-indigo-600', 
        label: 'Starter', 
        textColor: 'text-blue-400',
        bgColor: 'bg-blue-600'
      },
      premium: { 
        icon: Crown, 
        color: 'from-purple-500 to-pink-600', 
        label: 'Premium', 
        textColor: 'text-purple-400',
        bgColor: 'bg-purple-600'
      }
    };
    return configs[tier] || configs.free;
  };

  const tierConfig = getTierConfig(user.tier);
  const TierIcon = tierConfig.icon;

  // Analytics data
  const analytics = {
    appsBuilt: projects.length,
    totalUsers: projects.length * 245,
    revenue: projects.length * 1234,
    successRate: 98
  };

  return (
    <div className="min-h-screen relative">
      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{user.name.split(' ')[0]}</span> 👋
              </h1>
              <p className="text-base text-slate-400">
                {user.credits > 0 
                  ? `You have ${user.credits} builds remaining. Let's create something amazing!` 
                  : 'Upgrade to continue building'}
              </p>
            </div>

            {/* Quick Action Button */}
            <button
              onClick={onBuildNew}
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-5 h-5" />
              <span>Build New App</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Zap className="w-6 h-6" />}
            label="Credits"
            value={user.credits}
            subtext="Builds remaining"
            color="from-yellow-500 to-orange-600"
            trend={user.credits > 5 ? "healthy" : "low"}
          />
          <StatCard
            icon={<Folder className="w-5 h-5" />}
            label="Projects"
            value={analytics.appsBuilt}
            subtext="Apps built"
            color="from-blue-500 to-indigo-600"
            trend="up"
          />
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Users"
            value={analytics.totalUsers.toLocaleString()}
            subtext="Total reach"
            color="from-purple-500 to-pink-600"
            trend="up"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Revenue"
            value={`$${analytics.revenue.toLocaleString()}`}
            subtext="Generated"
            color="from-emerald-500 to-teal-600"
            trend="up"
          />
        </div>

        {/* Credits Warning */}
        {user.credits <= 3 && user.tier === 'free' && (
          <div className="mb-8 bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-sm border border-orange-500/30 rounded-xl p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Running Low on Credits
                  </h3>
                  <p className="text-slate-300 text-sm">
                    You have <span className="font-semibold text-orange-400">{user.credits} builds</span> remaining. 
                    Upgrade for unlimited builds!
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenPricing}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-semibold rounded-lg transition-all hover:scale-[1.02] whitespace-nowrap flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* View Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <ViewTab 
            active={activeView === 'overview'} 
            onClick={() => setActiveView('overview')}
            icon={<BarChart3 className="w-4 h-4" />}
          >
            Overview
          </ViewTab>
          <ViewTab 
            active={activeView === 'projects'} 
            onClick={() => setActiveView('projects')}
            icon={<Folder className="w-4 h-4" />}
            badge={projects.length}
          >
            Projects
          </ViewTab>
          <ViewTab 
            active={activeView === 'activity'} 
            onClick={() => setActiveView('activity')}
            icon={<Activity className="w-4 h-4" />}
          >
            Activity
          </ViewTab>
        </div>

        {/* Content Area */}
        {activeView === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <QuickActionCard
                icon={<Rocket className="w-5 h-5" />}
                title="Start Building"
                description="Create a new app with AI"
                color="from-blue-500/10 to-indigo-600/10"
                borderColor="border-blue-500/20"
                onClick={onBuildNew}
              />
              <QuickActionCard
                icon={<Crown className="w-5 h-5" />}
                title="Upgrade Plan"
                description="Unlock unlimited builds"
                color="from-purple-500/10 to-pink-600/10"
                borderColor="border-purple-500/20"
                onClick={onOpenPricing}
              />
              <QuickActionCard
                icon={<Award className="w-5 h-5" />}
                title="Analytics"
                description="Track performance"
                color="from-emerald-500/10 to-teal-600/10"
                borderColor="border-emerald-500/20"
                onClick={() => setActiveView('activity')}
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Recent Activity
                </h3>
                <button 
                  onClick={() => setActiveView('activity')}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {projects.length > 0 ? (
                  projects.slice(0, 5).map((project, i) => (
                    <ActivityItem
                      key={i}
                      icon={<CheckCircle className="w-4 h-4 text-emerald-400" />}
                      title={`Built ${project.name}`}
                      time={new Date(project.created_at).toLocaleDateString()}
                      status="completed"
                    />
                  ))
                ) : (
                  <div className="text-center py-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-700/30 rounded-full mb-3">
                      <Activity className="w-6 h-6 text-slate-500" />
                    </div>
                    <p className="text-slate-400 text-sm">No activity yet. Build your first app!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Insights Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Performance Insights */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Performance Insights
                </h3>
                <div className="space-y-4">
                  <InsightRow 
                    label="Average Build Time"
                    value="2.3 min"
                    trend="+12%"
                    positive={false}
                  />
                  <InsightRow 
                    label="Success Rate"
                    value="98%"
                    trend="+5%"
                    positive={true}
                  />
                  <InsightRow 
                    label="Code Quality Score"
                    value="87/100"
                    trend="+3"
                    positive={true}
                  />
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Usage Statistics
                </h3>
                <div className="space-y-4">
                  <UsageBar 
                    label="Credits Used"
                    used={user.tier === 'free' ? 3 - user.credits : 100 - user.credits}
                    total={user.tier === 'free' ? 3 : 100}
                    color="blue"
                  />
                  <UsageBar 
                    label="Storage Used"
                    used={projects.length * 45}
                    total={1000}
                    color="purple"
                  />
                  <UsageBar 
                    label="API Calls"
                    used={projects.length * 127}
                    total={10000}
                    color="emerald"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'projects' && (
          <div className="animate-fade-in">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                <p className="text-slate-400 mt-4">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800/50 rounded-full mb-6">
                  <Folder className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">No Projects Yet</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  Start building your first app with our AI-powered platform!
                </p>
                <button
                  onClick={onBuildNew}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all hover:scale-[1.02]"
                >
                  <Plus className="w-5 h-5" />
                  Build Your First App
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project}
                    onSelect={() => setSelectedProject(project)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'activity' && (
          <div className="animate-fade-in">
            <ActivityTimeline projects={projects} />
          </div>
        )}

        {/* Upgrade CTA */}
        {user.tier === 'free' && (
          <div className="mt-12 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden opacity-20">
              <div className="absolute top-0 left-1/4 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-pink-500/30 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10">
              <div className="inline-flex p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Unlock Premium Features
              </h3>
              <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                Get unlimited builds, priority AI processing, and dedicated support
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <FeaturePill icon={<CheckCircle />} text="Unlimited Builds" />
                <FeaturePill icon={<CheckCircle />} text="Priority Support" />
                <FeaturePill icon={<CheckCircle />} text="Advanced Analytics" />
              </div>
              <button
                onClick={onOpenPricing}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all hover:scale-[1.02]"
              >
                <Crown className="w-5 h-5" />
                View Pricing Plans
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

// Supporting Components
function StatCard({ icon, label, value, subtext, color, trend }) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-5 hover:bg-slate-800/50 hover:border-slate-600 transition-all group">
      <div className={`inline-flex p-2.5 bg-gradient-to-br ${color} rounded-lg opacity-90 group-hover:opacity-100 transition-opacity mb-3`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-white mb-1 tabular-nums">{value}</div>
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-xs text-slate-600">{subtext}</div>
      {trend && trend !== 'low' && (
        <div className="mt-2 flex items-center gap-1 text-emerald-400 text-xs font-medium">
          <TrendingUp className="w-3 h-3" />
          <span>Trending up</span>
        </div>
      )}
      {trend === 'low' && (
        <div className="mt-2 flex items-center gap-1 text-orange-400 text-xs font-medium">
          <AlertCircle className="w-3 h-3" />
          <span>Running low</span>
        </div>
      )}
    </div>
  );
}

function ViewTab({ active, onClick, icon, children, badge }) {
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
      {badge !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          active ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function QuickActionCard({ icon, title, description, color, borderColor, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group text-left bg-gradient-to-br ${color} backdrop-blur-sm border ${borderColor} rounded-xl p-5 hover:scale-[1.02] transition-all`}
    >
      <div className="text-slate-300 mb-3 group-hover:scale-110 transition-transform inline-block">
        {icon}
      </div>
      <h4 className="text-base font-semibold text-white mb-1">{title}</h4>
      <p className="text-slate-400 text-xs">{description}</p>
    </button>
  );
}

function ActivityItem({ icon, title, time, status }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/20 rounded-lg hover:bg-slate-800/40 transition-colors">
      <div className="p-2 bg-slate-700/30 rounded-lg">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">{title}</p>
        <p className="text-slate-500 text-xs">{time}</p>
      </div>
      <span className="text-xs font-medium text-emerald-400 uppercase">
        {status}
      </span>
    </div>
  );
}

function InsightRow({ label, value, trend, positive }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400 text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-white font-semibold">{value}</span>
        <span className={`text-xs font-medium ${positive ? 'text-emerald-400' : 'text-orange-400'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}

function UsageBar({ label, used, total, color }) {
  const percentage = (used / total) * 100;
  const colors = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    emerald: 'bg-emerald-500'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-sm">{label}</span>
        <span className="text-slate-300 text-xs font-medium">{used} / {total}</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div 
          className={`h-full ${colors[color]} rounded-full transition-all`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function ProjectCard({ project, onSelect }) {
  return (
    <div 
      onClick={onSelect}
      className="group bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-5 hover:bg-slate-800/50 hover:border-slate-600 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors truncate">
            {project.name}
          </h3>
          <p className="text-slate-500 text-xs flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(project.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
          <span className="text-emerald-400 text-xs font-semibold">READY</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
        <div className="flex items-center gap-1">
          <Globe className="w-3.5 h-3.5" />
          <span>React</span>
        </div>
        <div className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          <span>Node.js</span>
        </div>
        <div className="flex items-center gap-1">
          <Database className="w-3.5 h-3.5" />
          <span>PostgreSQL</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all">
          <Eye className="w-3.5 h-3.5" />
          View
        </button>
        <button className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-all">
          <Download className="w-3.5 h-3.5" />
        </button>
        <button className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function ActivityTimeline({ projects }) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Activity Timeline</h3>
      <div className="space-y-5">
        {projects.length > 0 ? (
          projects.map((project, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                {i !== projects.length - 1 && (
                  <div className="w-0.5 h-full bg-gradient-to-b from-blue-500 to-purple-600 mt-2"></div>
                )}
              </div>
              <div className="flex-1 pb-5">
                <h4 className="text-white font-medium text-sm mb-1">{project.name} Completed</h4>
                <p className="text-slate-500 text-xs mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
                <div className="bg-slate-800/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">
                    Successfully built and ready for deployment
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-400 text-center py-6 text-sm">No activity yet</p>
        )}
      </div>
    </div>
  );
}

function FeaturePill({ icon, text }) {
  return (
    <div className="flex items-center gap-1.5 text-slate-300 text-sm">
      <span className="text-emerald-400">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

export default Dashboard;