import React, { useState, useEffect } from 'react';
import { 
  Rocket, Plus, Folder, Download, Eye, Trash2, 
  Crown, Zap, TrendingUp, Clock, Code 
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Dashboard({ user, onLogout, onBuildNew, onOpenPricing }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getTierBadge = (tier) => {
    const badges = {
      free: { icon: Zap, color: 'bg-gray-500', label: 'Free' },
      starter: { icon: Rocket, color: 'bg-blue-500', label: 'Starter' },
      premium: { icon: Crown, color: 'bg-purple-500', label: 'Premium' }
    };
    return badges[tier] || badges.free;
  };

  const tierBadge = getTierBadge(user.tier);
  const TierIcon = tierBadge.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Launch AI</h1>
                <p className="text-xs text-gray-400">Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${tierBadge.color} px-4 py-2 rounded-lg`}>
                <TierIcon className="w-4 h-4 text-white" />
                <span className="text-white font-semibold text-sm">{tierBadge.label}</span>
              </div>
              <button
                onClick={onLogout}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Zap className="w-6 h-6" />}
            label="Credits Remaining"
            value={user.credits || 0}
            color="from-yellow-500 to-orange-500"
          />
          <StatCard
            icon={<Folder className="w-6 h-6" />}
            label="Total Projects"
            value={projects.length}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Success Rate"
            value="98%"
            color="from-green-500 to-emerald-500"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Time Saved"
            value={`${projects.length * 6}mo`}
            color="from-purple-500 to-pink-500"
          />
        </div>

        {/* Credits Warning */}
        {user.credits <= 3 && user.tier === 'free' && (
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-500/50 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  ⚠️ Running Low on Credits
                </h3>
                <p className="text-gray-300">
                  You have {user.credits} builds remaining. Upgrade to get unlimited builds!
                </p>
              </div>
              <button
                onClick={onOpenPricing}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-6 py-3 rounded-xl transition-all whitespace-nowrap"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">Your Projects</h2>
          <button
            onClick={onBuildNew}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Build New App</span>
          </button>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-gray-400 mt-4">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6">
              <Folder className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Projects Yet</h3>
            <p className="text-gray-400 mb-6">Start building your first app with AI!</p>
            <button
              onClick={onBuildNew}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-xl inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Build Your First App</span>
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {/* Upgrade CTA */}
        {user.tier === 'free' && (
          <div className="mt-12 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-purple-500/50 rounded-2xl p-8 text-center">
            <Crown className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Unlock Premium Features
            </h3>
            <p className="text-gray-300 mb-6">
              Get unlimited builds, priority support, and advanced features
            </p>
            <button
              onClick={onOpenPricing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-4 rounded-xl inline-flex items-center gap-2"
            >
              <Crown className="w-5 h-5" />
              <span>View Plans</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${color} rounded-xl mb-4`}>
        {icon}
      </div>
      <div className="text-gray-400 text-sm mb-1">{label}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

function ProjectCard({ project }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
            {project.name}
          </h3>
          <p className="text-gray-400 text-sm">
            Created {new Date(project.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold">
          READY
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Code className="w-4 h-4" />
        <span>React + Node.js</span>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-all">
          <Eye className="w-4 h-4" />
          <span>View</span>
        </button>
        <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all">
          <Download className="w-4 h-4" />
        </button>
        <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default Dashboard;