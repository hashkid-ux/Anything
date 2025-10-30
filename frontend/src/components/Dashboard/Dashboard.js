import React, { useState, useEffect } from 'react';
import { 
  Rocket, Plus, Folder, Download, Eye, Trash2, Crown, Zap, 
  TrendingUp, AlertCircle, ArrowRight, Clock, RefreshCw,
  CheckCircle, XCircle, Loader2, ExternalLink, Play
} from 'lucide-react';
import axios from 'axios';

function Dashboard({ user, onLogout, onBuildNew, onOpenPricing }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState({});
  const [dashboardStats, setDashboardStats] = useState(null);

  useEffect(() => {
    loadDashboardData();
    // Poll for building projects
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const projectsRes = await axios.get('/api/projects');
      setProjects(projectsRes.data.projects || []);

      const overviewRes = await axios.get('/api/dashboard/overview');
      setDashboardStats(overviewRes.data.stats);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryBuild = async (project) => {
    setRetrying(prev => ({ ...prev, [project.id]: true }));
    try {
      // Start a new build with the same data
      const response = await axios.post('/api/master/build', {
        projectId: project.id,
        projectName: project.name,
        description: project.description || project.prompt,
        framework: project.framework || 'react',
        database: project.database || 'postgresql',
        targetPlatform: project.targetPlatform || 'web'
      });

      alert(`Build restarted! Build ID: ${response.data.build_id}`);
      
      // Reload projects
      await loadDashboardData();
    } catch (error) {
      console.error('Retry failed:', error);
      alert('Failed to retry build: ' + (error.response?.data?.error || error.message));
    } finally {
      setRetrying(prev => ({ ...prev, [project.id]: false }));
    }
  };

  const handleViewPreview = (project) => {
    // Navigate to preview by setting buildData in parent
    if (project.buildData) {
      // Create preview URL with project data
      window.location.href = `/preview/${project.id}`;
    } else {
      alert('Preview not available - build data missing');
    }
  };

  const handleDownload = async (project) => {
    try {
      if (!project.downloadUrl) {
        alert('Download not available yet');
        return;
      }

      // Track download
      await axios.post(`/api/projects/${project.id}/download`);

      // Download file
      window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${project.downloadUrl}`, '_blank');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed: ' + error.message);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/projects/${projectId}`);
      await loadDashboardData();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete project');
    }
  };

  // Group projects by status
  const buildingProjects = projects.filter(p => p.status === 'building');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const failedProjects = projects.filter(p => p.status === 'failed');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{user.name.split(' ')[0]}</span> 👋
              </h1>
              <p className="text-base text-slate-400">
                {user.credits > 0 
                  ? `${user.credits} builds remaining` 
                  : 'Upgrade to continue building'}
              </p>
            </div>

            <button
              onClick={onBuildNew}
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg transition-all hover:scale-[1.02]"
            >
              <Plus className="w-5 h-5" />
              <span>Build New App</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Zap />}
            label="Credits"
            value={user.credits}
            color="from-yellow-500 to-orange-600"
          />
          <StatCard
            icon={<Folder />}
            label="Total"
            value={projects.length}
            color="from-blue-500 to-indigo-600"
          />
          <StatCard
            icon={<CheckCircle />}
            label="Completed"
            value={completedProjects.length}
            color="from-emerald-500 to-teal-600"
          />
          <StatCard
            icon={<XCircle />}
            label="Failed"
            value={failedProjects.length}
            color="from-red-500 to-pink-600"
          />
        </div>

        {/* Building Projects (Live) */}
        {buildingProjects.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              Building Now ({buildingProjects.length})
            </h3>
            <div className="space-y-4">
              {buildingProjects.map(project => (
                <BuildingProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}

        {/* Failed Projects (With Retry) */}
        {failedProjects.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              Failed Builds ({failedProjects.length})
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {failedProjects.map(project => (
                <FailedProjectCard 
                  key={project.id} 
                  project={project}
                  onRetry={() => handleRetryBuild(project)}
                  onDelete={() => handleDeleteProject(project.id)}
                  retrying={retrying[project.id]}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Projects */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Completed ({completedProjects.length})
          </h3>
          {completedProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedProjects.map(project => (
                <CompletedProjectCard
                  key={project.id}
                  project={project}
                  onViewPreview={() => handleViewPreview(project)}
                  onDownload={() => handleDownload(project)}
                  onDelete={() => handleDeleteProject(project.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-800/30 rounded-xl">
              <Folder className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No completed projects yet</p>
              <button
                onClick={onBuildNew}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:scale-105 transition-all"
              >
                Build Your First App
              </button>
            </div>
          )}
        </div>

        {/* Upgrade CTA */}
        {user.tier === 'free' && (
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8 text-center">
            <Crown className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Unlock Unlimited Builds</h3>
            <p className="text-slate-300 mb-6">Get unlimited builds, priority support, and advanced features</p>
            <button
              onClick={onOpenPricing}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all hover:scale-[1.02]"
            >
              Upgrade Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Building Project Card
function BuildingProjectCard({ project }) {
  return (
    <div className="bg-slate-800/30 border-2 border-blue-500/50 rounded-xl p-5 animate-pulse-slow">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold text-white">{project.name}</h4>
        <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg">
          <span className="text-xs font-semibold text-blue-300">BUILDING</span>
        </div>
      </div>
      <div className="mb-3">
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
            style={{ width: `${project.buildProgress || 0}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">{project.buildProgress || 0}% complete</p>
      </div>
      <p className="text-sm text-slate-400">
        <Clock className="w-3 h-3 inline mr-1" />
        Started {new Date(project.createdAt).toLocaleTimeString()}
      </p>
    </div>
  );
}

// Failed Project Card
function FailedProjectCard({ project, onRetry, onDelete, retrying }) {
  return (
    <div className="bg-slate-800/30 border-2 border-red-500/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold text-white">{project.name}</h4>
        <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg">
          <span className="text-xs font-semibold text-red-300">FAILED</span>
        </div>
      </div>
      <p className="text-sm text-red-300 mb-4">
        <AlertCircle className="w-4 h-4 inline mr-1" />
        {project.buildData?.error || 'Build failed - click retry'}
      </p>
      <div className="flex gap-2">
        <button
          onClick={onRetry}
          disabled={retrying}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-medium rounded-lg transition-all"
        >
          {retrying ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Retrying...</>
          ) : (
            <><RefreshCw className="w-4 h-4" /> Retry Build</>
          )}
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Completed Project Card
function CompletedProjectCard({ project, onViewPreview, onDownload, onDelete }) {
  return (
    <div className="group bg-slate-800/30 border border-slate-700 rounded-xl p-5 hover:bg-slate-800/50 hover:border-slate-600 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-white mb-1 truncate">{project.name}</h4>
          <p className="text-slate-500 text-xs">
            {new Date(project.completedAt || project.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="px-2.5 py-1 bg-green-500/20 border border-green-500/30 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-400" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="bg-slate-700/30 rounded p-2">
          <div className="text-slate-500">Files</div>
          <div className="text-white font-semibold">{project.filesGenerated || 0}</div>
        </div>
        <div className="bg-slate-700/30 rounded p-2">
          <div className="text-slate-500">QA Score</div>
          <div className="text-white font-semibold">{project.qaScore || 0}/100</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onViewPreview}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-lg text-xs transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
        </button>
        <button
          onClick={onDownload}
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-all"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-slate-800/30 rounded-xl p-5">
      <div className={`inline-flex p-2.5 bg-gradient-to-br ${color} rounded-lg mb-3`}>
        {React.cloneElement(icon, { className: 'w-5 h-5 text-white' })}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-slate-400 uppercase">{label}</div>
    </div>
  );
}

export default Dashboard;