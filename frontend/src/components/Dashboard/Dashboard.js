// frontend/src/components/Dashboard/Dashboard.js
// FIXED: Properly pass complete data to preview

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

  const API_BASE_URL = process.env.REACT_APP_API_URL || window.location.origin;

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const projectsRes = await axios.get(`${API_BASE_URL}/api/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProjects(projectsRes.data.projects || []);

      try {
        const overviewRes = await axios.get(`${API_BASE_URL}/api/dashboard/overview`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setDashboardStats(overviewRes.data.stats);
      } catch (err) {
        console.warn('Dashboard stats not available:', err);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // REPLACE handleResumeBuilding in Dashboard.js
const handleResumeBuilding = async (project) => {
  console.log('🔄 Attempting to resume build:', project.id);
  
  // Use buildId from project object FIRST (it's already loaded)
  let buildId = project.id;
  console.log("build_id: ",buildId)
  
  if (!buildId) {
    console.warn('No build_id in project.buildData, checking API...');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/api/projects/${project.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      console.log('📦 API response:', response.data); // DEBUG
      buildId = response.data.project?.buildData?.build_id;
    } catch (error) {
      console.error('API fetch failed:', error);
    }
  }
  
  if (!buildId) {
    console.error('❌ No build ID found anywhere');
    if (!window.confirm('Build ID missing. Start new build?')) return;
    handleRetryBuild(project);
    return;
  }
  
  // Verify build exists in backend cache
  try {
    const token = localStorage.getItem('token');
    const buildCheck = await axios.get(
      `${API_BASE_URL}/api/master/build/${buildId}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    if (buildCheck.data.status === 'building') {
      // Update URL with build params
      const url = new URL(window.location);
      url.searchParams.set('resumeBuild', buildId);
      url.searchParams.set('projectId', project.id);
      window.history.pushState({}, '', url);
      
      window.dispatchEvent(new CustomEvent('resumeBuilding', { 
        detail: { 
          buildId: buildId,
          projectId: project.id,
          prompt: project.description || project.prompt,
          projectName: project.name,
          currentProgress: buildCheck.data.progress || 0
        } 
      }));
      return;
    }
    
    if (buildCheck.data.status === 'completed') {
      handleViewPreview(project);
      return;
    }
    
  } catch (error) {
    console.warn('⚠️ Build expired (24h cache limit):', error.message);
  }
  
  // Build expired - offer retry
  if (!window.confirm('Build session expired (24h limit). Start new build?')) return;
  handleRetryBuild(project);
};

  const handleRetryBuild = async (project) => {
    setRetrying(prev => ({ ...prev, [project.id]: true }));
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_BASE_URL}/api/master/build`,
        {
          projectId: project.id,
          projectName: project.name,
          description: project.description || project.prompt,
          framework: project.framework || 'react',
          database: project.database || 'postgresql',
          targetPlatform: project.targetPlatform || 'web'
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert(`Build restarted! Build ID: ${response.data.build_id}`);
      
      sessionStorage.setItem('currentBuildId', response.data.build_id);
      sessionStorage.setItem('currentProjectId', project.id);
      
      handleResumeBuilding(project);
      
    } catch (error) {
      console.error('Retry failed:', error);
      alert('Failed to retry build: ' + (error.response?.data?.error || error.message));
    } finally {
      setRetrying(prev => ({ ...prev, [project.id]: false }));
    }
  };

  // FIXED: Properly load and pass complete build data
  const handleViewPreview = async (project) => {
  try {

    console.log('📊 Loading preview for project:', project.id);
    
    // Validate project has required data
    if (!project.generatedFiles || Object.keys(project.generatedFiles).length === 0) {
      alert('⚠️ No files available for preview. Project may still be building or failed.');
      return;
    }

    // Build COMPLETE data structure with validation
    const previewData = {
      build_id: project.buildData?.build_id || project.id,
      project_id: project.id,
      project_name: project.name,
      
      // FILES - Direct from database
      files: project.generatedFiles || {},
      
      // SUMMARY - Build from multiple sources with fallbacks
      summary: {
        files_generated: project.filesGenerated || 
                        project.fileStats?.total_files || 
                        Object.keys(project.generatedFiles || {}).length,
        
        lines_of_code: project.linesOfCode || 
                      project.buildData?.summary?.lines_of_code || 
                      0,
        
        qa_score: project.qaScore || 
                 project.buildData?.summary?.qa_score || 
                 project.buildData?.phases?.phase4?.qa_results?.overall_score || 
                 0,
        
        deployment_ready: project.deploymentReady !== undefined 
                         ? project.deploymentReady 
                         : project.buildData?.summary?.deployment_ready || 
                           project.buildData?.phases?.phase4?.deployment_ready || 
                           false,
        
        // Research data
        competitors_analyzed: project.researchData?.competitors?.total_analyzed || 
                             project.researchData?._fullData?.competitor_analyses?.length || 
                             project.buildData?.summary?.competitors_analyzed || 
                             0,
        
        reviews_scanned: project.researchData?.reviews?.totalReviewsAnalyzed || 
                        project.researchData?._fullData?.review_summary?.totalReviewsAnalyzed || 
                        project.buildData?.summary?.reviews_scanned || 
                        0,
        
        // Strategy data
        competitive_advantages: project.competitorData?.competitive_advantages?.length || 
                               project.buildData?.summary?.competitive_advantages || 
                               0,
        
        // Code generation data
        components_created: project.buildData?.phases?.phase3?.frontend?.stats?.components || 
                           project.buildData?.summary?.components_created || 
                           0,
        
        apis_generated: project.buildData?.phases?.phase3?.backend?.stats?.api_endpoints || 
                       project.buildData?.summary?.apis_generated || 
                       0,
        
        // Time tracking
        time_taken: project.completedAt && project.createdAt 
                   ? Math.round((new Date(project.completedAt) - new Date(project.createdAt)) / 1000)
                   : project.buildData?.summary?.time_taken || 
                     180,
        
        tier: project.buildData?.summary?.tier || 'free'
      },
      
      // PHASES - Reconstruct from database with validation
      phases: {
        phase1: project.researchData || {
          market: null,
          competitors: null,
          reviews: null,
          trends: null,
          dateContext: null
        },
        
        phase2: project.competitorData || {
          competitive_advantages: [],
          ux_strategy: {},
          features_prioritized: []
        },
        
        phase3: {
          frontend: {
            files: extractFrontendFiles(project.generatedFiles),
            stats: {
              total_files: project.fileStats?.frontend_files || 0,
              components: project.buildData?.phases?.phase3?.frontend?.stats?.components || 0,
              total_lines: Math.floor((project.linesOfCode || 0) * 0.6) // Estimate 60% frontend
            }
          },
          backend: {
            files: extractBackendFiles(project.generatedFiles),
            stats: {
              total_files: project.fileStats?.backend_files || 0,
              api_endpoints: project.buildData?.phases?.phase3?.backend?.stats?.api_endpoints || 0,
              total_lines: Math.floor((project.linesOfCode || 0) * 0.4) // Estimate 40% backend
            }
          },
          database: project.buildData?.phases?.phase3?.database || {
            migrations: [],
            prisma_schema: null,
            seeds: null
          }
        },
        
        phase4: {
          qa_results: {
            overall_score: project.qaScore || 0,
            tests_created: project.buildData?.phases?.phase4?.qa_results?.tests_created || 0
          },
          deployment_ready: project.deploymentReady || false
        }
      },
      
      // DOWNLOAD URL
      downloadUrl: project.downloadUrl || `/api/master/download/${project.id}`,
      
      // Metadata
      timestamp: project.completedAt || project.createdAt,
      status: 'completed'
    };
    
    // Validation checks
    const validation = {
      hasFiles: Object.keys(previewData.files).length > 0,
      hasResearchData: !!previewData.phases.phase1.market,
      hasCompetitorData: !!previewData.phases.phase2.competitive_advantages,
      hasSummary: previewData.summary.files_generated > 0,
      filesCount: Object.keys(previewData.files).length
    };
    
    console.log('✅ Preview data validated:', validation);
    
    if (!validation.hasFiles) {
      alert('⚠️ No files available. The project may not have completed successfully.');
      return;
    }
    
    if (validation.filesCount < 5) {
      console.warn('⚠️ Low file count detected:', validation.filesCount);
    }
    
    // Dispatch to App.js
    console.log('📤 Dispatching preview event with complete data');
    window.dispatchEvent(new CustomEvent('showPreview', { 
      detail: previewData 
    }));
    
  } catch (error) {
    console.error('❌ Preview error:', error);
    alert('Failed to load preview: ' + error.message);
  }
};

// Helper: Extract frontend files from generated files
function extractFrontendFiles(files) {
  if (!files) return {};
  
  const frontendFiles = {};
  Object.entries(files).forEach(([path, content]) => {
    if (path.startsWith('src/') || 
        path.startsWith('public/') || 
        path.startsWith('frontend/') ||
        path.includes('App.js') || 
        path.includes('index.js') ||
        path.includes('components/')) {
      frontendFiles[path] = content;
    }
  });
  
  return frontendFiles;
}

// Helper: Extract backend files from generated files
function extractBackendFiles(files) {
  if (!files) return {};
  
  const backendFiles = {};
  Object.entries(files).forEach(([path, content]) => {
    if (path.startsWith('routes/') || 
        path.startsWith('controllers/') || 
        path.startsWith('middleware/') ||
        path.startsWith('backend/') ||
        path.includes('server.js')) {
      backendFiles[path] = content;
    }
  });
  
  return backendFiles;
}

  const handleDownload = async (project) => {
    try {
      if (!project.downloadUrl) {
        alert('Download not available yet');
        return;
      }

      const token = localStorage.getItem('token');
      
      const downloadUrl = project.downloadUrl.startsWith('http') 
        ? project.downloadUrl 
        : `${API_BASE_URL}${project.downloadUrl}`;

      console.log('📥 Downloading from:', downloadUrl);

      await axios.post(
        `${API_BASE_URL}/api/projects/${project.id}/download`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const response = await axios.get(downloadUrl, {
        responseType: 'blob',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${project.name}-${Date.now()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('✅ Download started! Check your downloads folder.');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_BASE_URL}/api/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      await loadDashboardData();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete project');
    }
  };

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
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
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

        {buildingProjects.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              Building Now ({buildingProjects.length})
            </h3>
            <div className="space-y-4">
              {buildingProjects.map(project => (
                <BuildingProjectCard 
                  key={project.id} 
                  project={project}
                  onResume={() => handleResumeBuilding(project)}
                />
              ))}
            </div>
          </div>
        )}

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

function BuildingProjectCard({ project, onResume }) {
  return (
    <button
      onClick={onResume}
      className="w-full bg-slate-800/30 border-2 border-blue-500/50 rounded-xl p-5 animate-pulse-slow hover:bg-slate-800/50 hover:border-blue-500/70 transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
          <div className="text-left">
            <h4 className="text-lg font-semibold text-white">{project.name}</h4>
            <p className="text-xs text-slate-400">Click to resume</p>
          </div>
        </div>
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
      <div className="flex items-center justify-between text-sm">
        <p className="text-slate-400">
          <Clock className="w-3 h-3 inline mr-1" />
          Started {new Date(project.createdAt).toLocaleTimeString()}
        </p>
        <div className="flex items-center gap-2 text-blue-400 group-hover:text-blue-300">
          <Play className="w-4 h-4" />
          <span className="text-xs font-medium">Resume</span>
        </div>
      </div>
    </button>
  );
}

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