import React, { useState, useEffect } from 'react';
import { 
  Rocket, Plus, Folder, Download, Eye, Trash2, Crown, Zap, 
  TrendingUp, Code, Users, DollarSign, Target, Award,
  Activity, BarChart3, CheckCircle, AlertCircle,
  ArrowRight, Globe, Database, Layers, ExternalLink, Clock,
  Calendar, Sparkles, Package, Shield, Bell, Settings, Loader2
} from 'lucide-react';
import axios from 'axios';

function Dashboard({ user, onLogout, onBuildNew, onOpenPricing }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [selectedProject, setSelectedProject] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load projects
      const projectsRes = await axios.get('/api/projects');
      setProjects(projectsRes.data.projects || []);

      // Load dashboard overview
      const overviewRes = await axios.get('/api/dashboard/overview');
      setDashboardStats(overviewRes.data.stats);

      // Load analytics
      const analyticsRes = await axios.get('/api/dashboard/analytics', {
        params: { days: 30 }
      });
      setAnalytics(analyticsRes.data);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await axios.delete(`/api/projects/${projectId}`);
      // Reload projects
      const projectsRes = await axios.get('/api/projects');
      setProjects(projectsRes.data.projects || []);
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
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

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

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
            value={dashboardStats?.totalProjects || 0}
            subtext="Apps built"
            color="from-blue-500 to-indigo-600"
            trend="up"
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="Completed"
            value={dashboardStats?.completedProjects || 0}
            subtext="Successful builds"
            color="from-emerald-500 to-teal-600"
            trend="up"
          />
          <StatCard
            icon={<Download className="w-5 h-5" />}
            label="Downloads"
            value={dashboardStats?.totalDownloads || 0}
            subtext="Code packages"
            color="from-purple-500 to-pink-600"
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
            active={activeView === 'analytics'} 
            onClick={() => setActiveView('analytics')}
            icon={<Activity className="w-4 h-4" />}
          >
            Analytics
          </ViewTab>
        </div>

        {/* Content Area */}
        {activeView === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Recent Projects */}
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Folder className="w-5 h-5 text-blue-400" />
                  Recent Projects
                </h3>
                <button 
                  onClick={() => setActiveView('projects')}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {projects.length > 0 ? (
                  projects.slice(0, 5).map((project) => (
                    <ProjectRow key={project.id} project={project} />
                  ))
                ) : (
                  <div className="text-center py-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-700/30 rounded-full mb-3">
                      <Folder className="w-6 h-6 text-slate-500" />
                    </div>
                    <p className="text-slate-400 text-sm">No projects yet. Build your first app!</p>
                    <button
                      onClick={onBuildNew}
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:scale-105 transition-all"
                    >
                      Start Building
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            {analytics && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Last 30 Days
                  </h3>
                  <div className="space-y-4">
                    <StatRow 
                      label="Builds Started"
                      value={analytics.totals?.buildsStarted || 0}
                    />
                    <StatRow 
                      label="Builds Completed"
                      value={analytics.totals?.buildsCompleted || 0}
                    />
                    <StatRow 
                      label="Success Rate"
                      value={`${Math.round((analytics.totals?.buildsCompleted / (analytics.totals?.buildsStarted || 1)) * 100)}%`}
                    />
                  </div>
                </div>

                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-400" />
                    Account Status
                  </h3>
                  <div className="space-y-4">
                    <StatRow 
                      label="Tier"
                      value={tierConfig.label}
                      valueColor={tierConfig.textColor}
                    />
                    <StatRow 
                      label="Member Since"
                      value={new Date(user.createdAt).toLocaleDateString()}
                    />
                    {user.subscriptionEnd && (
                      <StatRow 
                        label="Subscription Ends"
                        value={new Date(user.subscriptionEnd).toLocaleDateString()}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === 'projects' && (
          <div className="animate-fade-in">
            {projects.length === 0 ? (
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
                    onDelete={handleDeleteProject}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'analytics' && analytics && (
          <div className="animate-fade-in space-y-6">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Build Activity (Last 30 Days)</h3>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <MetricBox
                  label="Total Builds"
                  value={analytics.totals?.buildsStarted || 0}
                  icon={<Rocket className="w-5 h-5" />}
                  color="from-blue-500 to-indigo-600"
                />
                <MetricBox
                  label="Completed"
                  value={analytics.totals?.buildsCompleted || 0}
                  icon={<CheckCircle className="w-5 h-5" />}
                  color="from-emerald-500 to-teal-600"
                />
                <MetricBox
                  label="Failed"
                  value={analytics.totals?.buildsFailed || 0}
                  icon={<AlertCircle className="w-5 h-5" />}
                  color="from-red-500 to-orange-600"
                />
              </div>
            </div>
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

function ProjectRow({ project }) {
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'text-emerald-400';
      case 'building': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/20 rounded-lg hover:bg-slate-800/40 transition-colors">
      <div className="p-2 bg-slate-700/30 rounded-lg">
        <Folder className="w-4 h-4 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">{project.name}</p>
        <p className="text-slate-500 text-xs">{new Date(project.createdAt).toLocaleDateString()}</p>
      </div>
      <span className={`text-xs font-medium uppercase ${getStatusColor(project.status)}`}>
        {project.status}
      </span>
    </div>
  );
}

function ProjectCard({ project, onDelete }) {
  return (
    <div className="group bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-5 hover:bg-slate-800/50 hover:border-slate-600 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors truncate">
            {project.name}
          </h3>
          <p className="text-slate-500 text-xs flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className={`px-2.5 py-1 rounded-lg ${
          project.status === 'completed' ? 'bg-emerald-500/20 border border-emerald-500/30' :
          project.status === 'building' ? 'bg-blue-500/20 border border-blue-500/30' :
          'bg-red-500/20 border border-red-500/30'
        }`}>
          <span className={`text-xs font-semibold ${
            project.status === 'completed' ? 'text-emerald-400' :
            project.status === 'building' ? 'text-blue-400' :
            'text-red-400'
          }`}>
            {project.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
        <div className="flex items-center gap-1">
          <Globe className="w-3.5 h-3.5" />
          <span>{project.framework || 'React'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Database className="w-3.5 h-3.5" />
          <span>{project.database || 'PostgreSQL'}</span>
        </div>
      </div>

      <div className="flex gap-2">
        {project.status === 'completed' && (
          <>
            <button className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all">
              <Eye className="w-3.5 h-3.5" />
              View
            </button>
            <button className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-all">
              <Download className="w-3.5 h-3.5" />
            </button>
          </>
        )}
        <button 
          onClick={() => onDelete(project.id)}
          className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function StatRow({ label, value, valueColor }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={`font-semibold ${valueColor || 'text-white'}`}>{value}</span>
    </div>
  );
}

function MetricBox({ label, value, icon, color }) {
  return (
    <div className="text-center p-6 bg-slate-800/20 rounded-xl">
      <div className={`inline-flex p-3 bg-gradient-to-br ${color} rounded-xl mb-3`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
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