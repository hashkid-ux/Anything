import React, { useState, useEffect } from 'react';
import { 
  Rocket, Plus, Folder, Download, Eye, Trash2, Crown, Zap, 
  TrendingUp, Clock, Code, Users, DollarSign, Target, Award,
  Activity, BarChart3, Calendar, CheckCircle, AlertCircle,
  ArrowRight, Sparkles, Package, Globe, Database, Layers
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
      free: { icon: Zap, color: 'from-gray-500 to-gray-600', label: 'Free', textColor: 'text-gray-400' },
      starter: { icon: Rocket, color: 'from-blue-500 to-cyan-600', label: 'Starter', textColor: 'text-blue-400' },
      premium: { icon: Crown, color: 'from-purple-500 to-pink-600', label: 'Premium', textColor: 'text-purple-400' }
    };
    return configs[tier] || configs.free;
  };

  const tierConfig = getTierConfig(user.tier);
  const TierIcon = tierConfig.icon;

  // Mock analytics data
  const analytics = {
    appsBuilt: projects.length,
    totalUsers: projects.length * 245,
    revenue: projects.length * 1234,
    successRate: 98
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
                Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{user.name.split(' ')[0]}</span>! 👋
              </h1>
              <p className="text-xl text-gray-400">
                {user.credits > 0 
                  ? `You have ${user.credits} builds remaining. Let's create something amazing!` 
                  : 'Upgrade to continue building amazing apps'}
              </p>
            </div>

            {/* Quick Action Button */}
            <button
              onClick={onBuildNew}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-6 h-6" />
              <span>Build New App</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity -z-10"></div>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<Zap className="w-8 h-8" />}
            label="Credits"
            value={user.credits}
            subtext="Builds remaining"
            color="from-yellow-500 to-orange-600"
            trend={user.credits > 5 ? "healthy" : "low"}
          />
          <StatCard
            icon={<Folder className="w-8 h-8" />}
            label="Projects"
            value={analytics.appsBuilt}
            subtext="Apps built"
            color="from-blue-500 to-cyan-600"
            trend="up"
          />
          <StatCard
            icon={<Users className="w-8 h-8" />}
            label="Total Users"
            value={analytics.totalUsers.toLocaleString()}
            subtext="Across all apps"
            color="from-purple-500 to-pink-600"
            trend="up"
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            label="Revenue"
            value={`${analytics.revenue.toLocaleString()}`}
            subtext="Generated"
            color="from-green-500 to-emerald-600"
            trend="up"
          />
        </div>

        {/* Credits Warning */}
        {user.credits <= 3 && user.tier === 'free' && (
          <div className="mb-8 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 backdrop-blur-xl border-2 border-orange-500/50 rounded-3xl p-8 animate-pulse-glow">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-orange-500 rounded-2xl">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white mb-2">
                    ⚠️ Running Low on Credits
                  </h3>
                  <p className="text-gray-200 text-lg">
                    You have <span className="font-bold text-orange-400">{user.credits} builds</span> remaining. 
                    Upgrade now to get unlimited builds and premium features!
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenPricing}
                className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-2xl whitespace-nowrap flex items-center gap-2"
              >
                <Crown className="w-6 h-6" />
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* View Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <ViewTab 
            active={activeView === 'overview'} 
            onClick={() => setActiveView('overview')}
            icon={<BarChart3 />}
          >
            Overview
          </ViewTab>
          <ViewTab 
            active={activeView === 'projects'} 
            onClick={() => setActiveView('projects')}
            icon={<Folder />}
            badge={projects.length}
          >
            Projects
          </ViewTab>
          <ViewTab 
            active={activeView === 'activity'} 
            onClick={() => setActiveView('activity')}
            icon={<Activity />}
          >
            Activity
          </ViewTab>
        </div>

        {/* Content Area */}
        {activeView === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
              <QuickActionCard
                icon={<Rocket />}
                title="Start Building"
                description="Create a new app with AI agents"
                color="from-blue-500 to-cyan-600"
                onClick={onBuildNew}
              />
              <QuickActionCard
                icon={<Crown />}
                title="Upgrade Plan"
                description="Unlock unlimited builds & features"
                color="from-purple-500 to-pink-600"
                onClick={onOpenPricing}
              />
              <QuickActionCard
                icon={<Award />}
                title="View Analytics"
                description="Track your app performance"
                color="from-green-500 to-emerald-600"
                onClick={() => setActiveView('activity')}
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Activity className="w-7 h-7 text-blue-400" />
                  Recent Activity
                </h3>
                <button className="text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors">
                  View All →
                </button>
              </div>
              <div className="space-y-4">
                {projects.length > 0 ? (
                  projects.slice(0, 5).map((project, i) => (
                    <ActivityItem
                      key={i}
                      icon={<CheckCircle className="w-5 h-5 text-green-400" />}
                      title={`Built ${project.name}`}
                      time={new Date(project.created_at).toLocaleDateString()}
                      status="completed"
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                      <Activity className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400">No activity yet. Build your first app!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeView === 'projects' && (
          <div className="animate-fade-in">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
                <p className="text-gray-400 mt-6 text-lg">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 rounded-full mb-8">
                  <Folder className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">No Projects Yet</h3>
                <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                  Start building your first app with our AI-powered platform!
                </p>
                <button
                  onClick={onBuildNew}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-2xl"
                >
                  <Plus className="w-6 h-6" />
                  Build Your First App
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Upgrade CTA - Bottom */}
        {user.tier === 'free' && (
          <div className="mt-16 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-purple-600/20 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl p-12 text-center relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10">
              <div className="inline-flex p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-6">
                <Crown className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-black text-white mb-4">
                Unlock Premium Features
              </h3>
              <p className="text-gray-200 text-lg mb-8 max-w-2xl mx-auto">
                Get unlimited builds, priority AI processing, live monitoring, and dedicated support
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Unlimited Builds</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Priority Support</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Advanced Analytics</span>
                </div>
              </div>
              <button
                onClick={onOpenPricing}
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-2xl transition-all hover:scale-105 shadow-2xl"
              >
                <Crown className="w-6 h-6" />
                View Pricing Plans
                <ArrowRight className="w-6 h-6" />
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
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:scale-105 transition-all group">
      <div className={`inline-flex p-4 bg-gradient-to-br ${color} rounded-2xl mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="text-4xl font-black text-white mb-1 tabular-nums">{value}</div>
      <div className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-xs text-gray-500">{subtext}</div>
      {trend && trend !== 'low' && (
        <div className="mt-2 flex items-center gap-1 text-green-400 text-xs font-semibold">
          <TrendingUp className="w-3 h-3" />
          <span>Trending up</span>
        </div>
      )}
      {trend === 'low' && (
        <div className="mt-2 flex items-center gap-1 text-orange-400 text-xs font-semibold">
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
      className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all whitespace-nowrap ${
        active 
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl scale-105' 
          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
      }`}
    >
      {icon}
      <span>{children}</span>
      {badge !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          active ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-400'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function QuickActionCard({ icon, title, description, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group text-left bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/30 transition-all hover:scale-105"
    >
      <div className={`inline-flex p-4 bg-gradient-to-br ${color} rounded-2xl mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
      <p className="text-gray-400 text-sm">{description}</p>
    </button>
  );
}

function ActivityItem({ icon, title, time, status }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
      <div className="p-2 bg-white/10 rounded-lg">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-white font-semibold">{title}</p>
        <p className="text-gray-400 text-sm">{time}</p>
      </div>
      <span className="text-xs font-semibold text-green-400 uppercase">
        {status}
      </span>
    </div>
  );
}

function ProjectCard({ project, onSelect }) {
  return (
    <div 
      onClick={onSelect}
      className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-purple-500/50 transition-all cursor-pointer hover:scale-105"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
            {project.name}
          </h3>
          <p className="text-gray-400 text-sm">
            {new Date(project.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="px-3 py-1.5 bg-green-500/20 border border-green-500/50 rounded-full">
          <span className="text-green-400 text-xs font-bold">READY</span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
        <div className="flex items-center gap-1">
          <Globe className="w-4 h-4" />
          <span>React</span>
        </div>
        <div className="flex items-center gap-1">
          <Layers className="w-4 h-4" />
          <span>Node.js</span>
        </div>
        <div className="flex items-center gap-1">
          <Database className="w-4 h-4" />
          <span>PostgreSQL</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all">
          <Eye className="w-4 h-4" />
          View
        </button>
        <button className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
          <Download className="w-4 h-4" />
        </button>
        <button className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ActivityTimeline({ projects }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
      <h3 className="text-2xl font-bold text-white mb-8">Activity Timeline</h3>
      <div className="space-y-6">
        {projects.length > 0 ? (
          projects.map((project, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                {i !== projects.length - 1 && (
                  <div className="w-0.5 h-full bg-gradient-to-b from-blue-500 to-purple-600 mt-2"></div>
                )}
              </div>
              <div className="flex-1 pb-6">
                <h4 className="text-white font-bold mb-1">{project.name} Completed</h4>
                <p className="text-gray-400 text-sm mb-2">
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-300 text-sm">
                    Successfully built and ready for deployment
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center py-8">No activity yet</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;