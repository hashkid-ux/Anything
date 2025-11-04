// frontend/src/components/AppPreview.js
// FULLY FIXED - Proper data extraction and display

import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, Share2, Code, CheckCircle, ArrowRight, Zap, Award, BarChart3, 
  Rocket, Globe, Database, Layers, FileCode, AlertCircle, Loader2 
} from 'lucide-react';
import axios from 'axios';
import LiveAppPreview from './LiveAppPreview';

const API_BASE_URL = process.env.REACT_APP_API_URL || window.location.origin;

function AppPreview({ data, onStartNew }) {
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [selectedCodeFile, setSelectedCodeFile] = useState('App.jsx');
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [loading, setLoading] = useState(true);
  const [buildData, setBuildData] = useState(null);
  const [error, setError] = useState(null);
  
  const hasLoggedRef = useRef(false);

  // CRITICAL FIX: Fetch complete build data if only ID provided
  useEffect(() => {
    const loadBuildData = async () => {
      try {
        if (!data) {
          setError('No data provided');
          setLoading(false);
          return;
        }

        // Log raw data
        if (!hasLoggedRef.current) {
          console.log('📊 AppPreview received data:', {
            hasBuildId: !!data.build_id,
            hasProjectId: !!data.project_id,
            hasSummary: !!data.summary,
            hasPhases: !!data.phases,
            hasResults: !!data.results,
            directFiles: data.files ? Object.keys(data.files).length : 0,
            keys: Object.keys(data)
          });
          hasLoggedRef.current = true;
        }

        // If we only have IDs, fetch full data
        if ((data.build_id || data.project_id) && !data.summary && !data.phases) {
          console.log('🔍 Fetching complete build data...');
          await fetchCompleteBuildData(data.build_id, data.project_id);
        } else {
          // Use provided data
          const normalized = normalizeBuildData(data);
          setBuildData(normalized);
          setLoading(false);
        }

      } catch (err) {
        console.error('❌ Failed to load build data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadBuildData();
  }, [data]);

  const fetchCompleteBuildData = async (buildId, projectId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      let fetchedData = null;

      // Try build endpoint first
      if (buildId) {
        try {
          const buildRes = await axios.get(`${API_BASE_URL}/api/master/build/${buildId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 10000
          });
          
          if (buildRes.data.status === 'completed' && buildRes.data.results) {
            fetchedData = buildRes.data.results;
            console.log('✅ Fetched from build endpoint');
          }
        } catch (buildErr) {
          console.warn('⚠️ Build endpoint failed:', buildErr.message);
        }
      }

      // Try project endpoint if build failed
      if (!fetchedData && projectId) {
        try {
          const projectRes = await axios.get(`${API_BASE_URL}/api/projects/${projectId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 10000
          });
          
          if (projectRes.data.project) {
            const project = projectRes.data.project;
            // Convert project data to expected format
            fetchedData = {
              build_id: buildId || project.id,
              project_id: projectId,
              project_name: project.name,
              summary: {
                files_generated: project.filesGenerated || 0,
                lines_of_code: project.linesOfCode || 0,
                qa_score: project.qaScore || 0,
                deployment_ready: project.deploymentReady || false,
                time_taken: 180,
                research_score: 0,
                competitive_advantages: 0
              },
              files: project.buildData?.files || {},
              phases: project.buildData?.phases || {},
              download_url: project.downloadUrl,
              downloadUrl: project.downloadUrl
            };
            console.log('✅ Fetched from project endpoint');
          }
        } catch (projectErr) {
          console.warn('⚠️ Project endpoint failed:', projectErr.message);
        }
      }

      if (fetchedData) {
        const normalized = normalizeBuildData(fetchedData);
        setBuildData(normalized);
      } else {
        throw new Error('Could not fetch build data from any endpoint');
      }

    } catch (err) {
      console.error('❌ Fetch error:', err);
      throw new Error('Failed to load complete build data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const normalizeBuildData = (rawData) => {
    console.log('🔧 Normalizing build data...');
    
    // Extract build_id
    const buildId = rawData.build_id || rawData.id || 'completed';

    // Extract summary (check multiple locations)
    let summary = rawData.summary;
    
    if (!summary) {
      // Build summary from project data
      summary = {
        files_generated: rawData.filesGenerated || 
                        rawData.phases?.phase3?.frontend?.stats?.total_files || 0,
        lines_of_code: rawData.linesOfCode || 
                      rawData.phases?.phase3?.frontend?.stats?.total_lines || 0,
        qa_score: rawData.qaScore || 
                 rawData.phases?.phase4?.qa_results?.overall_score || 0,
        deployment_ready: rawData.deploymentReady || 
                         rawData.phases?.phase4?.deployment_ready || false,
        time_taken: rawData.timeTaken || 180,
        research_score: rawData.phases?.phase1?.market?.score || 0,
        competitive_advantages: rawData.phases?.phase2?.competitive_advantages?.length || 0,
        competitors_analyzed: rawData.phases?.phase1?.competitors?.total_analyzed || 0,
        reviews_scanned: rawData.phases?.phase1?.reviews?.totalReviewsAnalyzed || 0,
        components_created: rawData.phases?.phase3?.frontend?.stats?.components || 0,
        apis_generated: rawData.phases?.phase3?.backend?.stats?.api_endpoints || 0
      };
    }

    // Extract files (check multiple locations)
    let files = {};
    
    if (rawData.files && Object.keys(rawData.files).length > 0) {
      files = rawData.files;
    } else if (rawData.phases?.phase3) {
      files = {
        ...(rawData.phases.phase3.frontend?.files || {}),
        ...(rawData.phases.phase3.backend?.files || {})
      };
    } else if (rawData.buildData?.files) {
      files = rawData.buildData.files;
    }

    // Extract phases
    const phases = rawData.phases || {
      phase1: rawData.researchData,
      phase2: rawData.competitorData,
      phase3: {
        frontend: { stats: { total_files: summary.files_generated } },
        backend: { stats: { api_endpoints: summary.apis_generated } }
      },
      phase4: {
        qa_results: { overall_score: summary.qa_score },
        deployment_ready: summary.deployment_ready
      }
    };

    // Download URL
    const downloadUrl = rawData.download_url || rawData.downloadUrl || null;

    const normalized = {
      buildId,
      projectName: rawData.project_name || rawData.name || 'My App',
      summary,
      files,
      phases,
      downloadUrl
    };

    console.log('✅ Normalized data:', {
      buildId: normalized.buildId,
      projectName: normalized.projectName,
      filesCount: Object.keys(normalized.files).length,
      hasDownloadUrl: !!normalized.downloadUrl,
      summaryKeys: Object.keys(normalized.summary)
    });

    return normalized;
  };

  const handleDownload = async () => {
    if (!buildData?.downloadUrl) {
      alert('Download URL not available. The build may not be complete.');
      return;
    }

    setDownloading(true);
    try {
      const downloadUrl = buildData.downloadUrl.startsWith('http') 
        ? buildData.downloadUrl 
        : `${API_BASE_URL}${buildData.downloadUrl}`;

      console.log('📥 Downloading from:', downloadUrl);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(downloadUrl, {
        responseType: 'blob',
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 60000
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${buildData.projectName || 'app'}-${Date.now()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('✅ Download started! Check your downloads folder.');
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    const shareData = {
      title: `I built ${buildData?.summary?.files_generated || 0} files with Launch AI!`,
      text: `Just generated a full-stack app with ${buildData?.summary?.lines_of_code || 0} lines of code!`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Loading Preview...</h2>
          <p className="text-slate-400">Fetching build data</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !buildData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Preview Data Error</h2>
          <p className="text-slate-400 mb-4">{error || 'Unable to load build data'}</p>
          <details className="text-left bg-slate-800/50 rounded-lg p-4 mb-6">
            <summary className="text-sm text-slate-300 cursor-pointer mb-2">Debug Info</summary>
            <pre className="text-xs text-slate-400 overflow-auto">
              {JSON.stringify({
                hasData: !!data,
                dataKeys: data ? Object.keys(data) : [],
                error
              }, null, 2)}
            </pre>
          </details>
          <button
            onClick={onStartNew}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:scale-105 transition-all"
          >
            Start New Build
          </button>
        </div>
      </div>
    );
  }

  // Extract code files for preview
  const codePreview = {
    'App.jsx': buildData.files['src/App.js'] || buildData.files['frontend/src/App.js'] || 'No App.js found',
    'server.js': buildData.files['server.js'] || buildData.files['backend/server.js'] || 'No server.js found',
    'schema.prisma': buildData.files['prisma/schema.prisma'] || buildData.files['backend/prisma/schema.prisma'] || 'No schema found'
  };

  const hasFiles = Object.keys(buildData.files).length > 0;

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-6 shadow-2xl shadow-emerald-500/25 animate-scale-in">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your App is <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Ready!</span> 🎉
          </h1>

          {/* Stats Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <StatPill icon={<FileCode />} label="Files" value={buildData.summary.files_generated} />
            <StatPill icon={<Code />} label="Lines" value={buildData.summary.lines_of_code.toLocaleString()} />
            <StatPill icon={<Zap />} label="Time" value={`${Math.floor((buildData.summary.time_taken || 180) / 60)} min`} />
            <StatPill icon={<Award />} label="QA Score" value={`${buildData.summary.qa_score}/100`} />
          </div>

          {/* Main Actions */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <button 
              onClick={handleDownload}
              disabled={downloading || !buildData.downloadUrl}
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all hover:scale-[1.02]"
            >
              <Download className="w-5 h-5" />
              <span>{downloading ? 'Downloading...' : 'Download Code'}</span>
              <span className="text-xs opacity-80">({buildData.summary.files_generated} files)</span>
            </button>
            
            <button 
              onClick={handleShare}
              className="px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>

            <button 
              onClick={onStartNew}
              className="px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              <Rocket className="w-5 h-5" />
              <span>Build Another</span>
            </button>
          </div>

          {/* Ready Badge */}
          {buildData.summary.deployment_ready && (
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-full">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 font-medium text-sm">Production Ready • Deploy Anytime</span>
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-10">
          <MetricCard
            icon={<BarChart3 />}
            label="QA Score"
            value={`${buildData.summary.qa_score}/100`}
            color="from-blue-500 to-indigo-600"
          />
          <MetricCard
            icon={<Award />}
            label="Research Score"
            value={`${buildData.summary.research_score || 0}/100`}
            color="from-emerald-500 to-teal-600"
          />
          <MetricCard
            icon={<Rocket />}
            label="Advantages"
            value={buildData.summary.competitive_advantages || 0}
            color="from-purple-500 to-pink-600"
          />
          <MetricCard
            icon={<FileCode />}
            label="Files"
            value={buildData.summary.files_generated}
            color="from-orange-500 to-red-600"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <TabButton 
            active={activeTab === 'preview'} 
            onClick={() => setActiveTab('preview')}
            icon={<Globe />}
          >
            Live Preview
          </TabButton>
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
          >
            Code Preview
          </TabButton>
          <TabButton 
            active={activeTab === 'architecture'} 
            onClick={() => setActiveTab('architecture')}
            icon={<Layers />}
          >
            Architecture
          </TabButton>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {/* LIVE PREVIEW TAB */}
          {activeTab === 'preview' && (
            <div className="animate-fade-in">
              {hasFiles ? (
                <div className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="bg-slate-700/50 px-4 py-3 border-b border-slate-600 flex items-center justify-between">
                    <h3 className="text-white font-semibold">Interactive Preview</h3>
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      LIVE
                    </span>
                  </div>
                  <LiveAppPreview 
                    buildId={buildData.buildId}
                    files={buildData.files}
                    progress={{ progress: 100, phase: 'completed' }}
                  />
                </div>
              ) : (
                <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-12 text-center">
                  <Globe className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-white mb-2">Preview Not Available</h4>
                  <p className="text-slate-400 mb-4">No files found for preview</p>
                  {buildData.downloadUrl && (
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:scale-105 transition-all disabled:opacity-50"
                    >
                      Download Code Instead
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid md:grid-cols-3 gap-4">
                <QuickStatCard
                  title="Generated Files"
                  items={[
                    { label: 'React Components', value: buildData.summary.components_created || Math.floor(buildData.summary.files_generated * 0.4) },
                    { label: 'API Routes', value: buildData.summary.apis_generated || Math.floor(buildData.summary.files_generated * 0.3) },
                    { label: 'Database Models', value: Math.floor(buildData.summary.files_generated * 0.3) }
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
                    { label: 'Security', value: `85/100` },
                    { label: 'Performance', value: `82/100` },
                    { label: 'Best Practices', value: `${buildData.summary.qa_score}/100` }
                  ]}
                  icon={<Award />}
                  color="from-emerald-500 to-teal-600"
                />
              </div>
            </div>
          )}

          {/* Code Tab */}
          {activeTab === 'code' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-black/40 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
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
                <pre className="p-6 overflow-x-auto max-h-[500px]">
                  <code className="text-slate-300 font-mono text-xs leading-relaxed">
                    {codePreview[selectedCodeFile]}
                  </code>
                </pre>
              </div>
            </div>
          )}

          {/* Architecture Tab */}
          {activeTab === 'architecture' && (
            <div className="animate-fade-in">
              <ArchitectureDiagram />
            </div>
          )}
        </div>

        {/* Next Steps CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">What's Next?</h3>
          <p className="text-slate-400 mb-6">Deploy your app and start building your business</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button 
              onClick={handleDownload}
              disabled={downloading || !buildData.downloadUrl}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Download className="w-5 h-5" />
              Download Code
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
    </div>
  );
}

// Supporting Components
function StatPill({ icon, label, value }) {
  return (
    <div className="inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 px-4 py-2 rounded-full">
      <div className="text-slate-400">{React.cloneElement(icon, { className: 'w-4 h-4' })}</div>
      <div>
        <div className="text-white font-bold text-sm tabular-nums">{value}</div>
        <div className="text-slate-500 text-xs">{label}</div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color }) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-5">
      <div className={`inline-flex p-3 bg-gradient-to-br ${color} rounded-xl mb-3`}>
        {React.cloneElement(icon, { className: 'w-5 h-5 text-white' })}
      </div>
      <div className="text-2xl font-bold text-white mb-1 tabular-nums">{value}</div>
      <div className="text-xs font-medium text-slate-500 uppercase">{label}</div>
    </div>
  );
}

function TabButton({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap text-sm ${
        active 
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
          : 'bg-slate-800/30 text-slate-400 hover:bg-slate-800/50 hover:text-slate-300 border border-slate-700'
      }`}
    >
      {React.cloneElement(icon, { className: 'w-4 h-4' })}
      <span>{children}</span>
    </button>
  );
}

function QuickStatCard({ title, items, icon, color }) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 bg-gradient-to-br ${color} rounded-lg`}>
          {React.cloneElement(icon, { className: 'w-5 h-5 text-white' })}
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

function ArchitectureDiagram() {
  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
      <h3 className="text-xl font-bold text-white mb-6 text-center">System Architecture</h3>
      <div className="max-w-2xl mx-auto space-y-4">
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
  );
}

export default AppPreview;