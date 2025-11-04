// frontend/src/components/LiveAppPreview.js
// FULLY FIXED - Production Ready with Comprehensive Error Handling

import React, { useState, useEffect, useRef } from 'react';
import { 
  Monitor, Code, Eye, Maximize2, Minimize2, RefreshCw, 
  Smartphone, Tablet, Loader2, Zap, AlertCircle, CheckCircle
} from 'lucide-react';

function LiveAppPreview({ buildId, files, progress }) {
  const [activeTab, setActiveTab] = useState('preview');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewReady, setPreviewReady] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [previewLogs, setPreviewLogs] = useState([]);
  const [selectedFile, setSelectedFile] = useState('src/App.js');
  const iframeRef = useRef(null);
  const previousFilesRef = useRef({});

  // Initialize preview when files are available
  useEffect(() => {
    if (files && Object.keys(files).length > 0) {
      // Check if files actually changed (avoid re-rendering on same files)
      const filesChanged = JSON.stringify(files) !== JSON.stringify(previousFilesRef.current);
      
      if (filesChanged) {
        console.log('🔄 Files changed, updating preview. Files count:', Object.keys(files).length);
        previousFilesRef.current = files;
        initializePreview();
      }
    }
  }, [files]);

  // Listen for iframe messages
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'PREVIEW_READY') {
        setPreviewReady(true);
        addLog('✅ Preview rendered successfully', 'success');
      } else if (event.data.type === 'PREVIEW_ERROR') {
        setPreviewError(event.data.error);
        addLog(`❌ Runtime Error: ${event.data.error}`, 'error');
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const initializePreview = async () => {
    try {
      setPreviewError(null);
      setPreviewReady(false);
      addLog('🔧 Initializing preview...', 'info');
      
      // Validate files
      if (!files || Object.keys(files).length === 0) {
        throw new Error('No files available for preview');
      }

      console.log('📁 Available files:', Object.keys(files));

      // Create preview HTML
      const html = createPreviewHTML(files);
      
      // Create blob URL
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Clean up old URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setPreviewUrl(url);
      addLog('✅ Preview HTML created', 'success');
      
    } catch (error) {
      console.error('❌ Preview initialization error:', error);
      setPreviewError(error.message);
      addLog(`❌ Error: ${error.message}`, 'error');
    }
  };

  const createPreviewHTML = (files) => {
    console.log('🏗️ Building preview HTML...');
    
    // Find App.js file (check multiple possible paths)
    const appPaths = [
      'src/App.js',
      'frontend/src/App.js', 
      'App.js',
      'src/App.jsx',
      'frontend/src/App.jsx'
    ];
    
    let appJs = null;
    let appPath = null;
    
    for (const path of appPaths) {
      if (files[path]) {
        appJs = files[path];
        appPath = path;
        break;
      }
    }
    
    // **VALIDATE: Check for contamination**
  if (appJs.includes('｜') || appJs.includes('▁')) {
    console.error('⚠️ Detected contaminated code, using fallback');
    appJs = getDefaultApp();
  }

    if (!appJs) {
      console.warn('⚠️ No App.js found, using default');
      appJs = getDefaultApp();
    } else {
      console.log('✅ Found App at:', appPath);
    }
    
    // Extract components
    const components = extractComponents(files);
    
     // **VALIDATE: Clean each component**
  const cleanComponents = components.map(comp => {
    const cleaned = sanitizeCode(comp);
    if (!cleaned || cleaned.includes('｜')) {
      console.warn('⚠️ Skipping contaminated component');
      return '';
    }
    return cleaned;
  }).filter(Boolean);


    console.log(`📦 Extracted ${components.length} components`);
    
    // Build HTML
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview - Launch AI</title>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- React 18 -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  
  <!-- Babel Standalone (for JSX transpilation) -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  
  <!-- Lucide Icons (optional) -->
  <script src="https://unpkg.com/lucide@latest"></script>
  
  <style>
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: linear-gradient(to bottom right, #0f172a, #1e1b4b);
      min-height: 100vh;
      overflow-x: hidden;
    }
    #root {
      min-height: 100vh;
    }
    /* Loading state */
    .preview-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: white;
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="preview-loading">
      <div>Loading preview...</div>
    </div>
  </div>
  
  <script type="text/babel">
    // Setup React hooks
    const { useState, useEffect, useRef } = React;
    
    // Inject components
    ${components.join('\n\n')}
    
    // Main App component
    ${sanitizeCode(appJs)}
    
    // Render App
    try {
      const container = document.getElementById('root');
      const root = ReactDOM.createRoot(container);
      
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      
      // Notify parent window
      window.parent.postMessage({ 
        type: 'PREVIEW_READY',
        timestamp: new Date().toISOString()
      }, '*');
      
      console.log('✅ Preview rendered successfully');
      
    } catch (error) {
      console.error('❌ Render error:', error);
      
      // Show error in UI
      const container = document.getElementById('root');
      container.innerHTML = \`
        <div style="padding: 2rem; color: white; text-align: center;">
          <h1 style="color: #ef4444; font-size: 1.5rem; margin-bottom: 1rem;">Preview Error</h1>
          <p style="color: #94a3b8; margin-bottom: 0.5rem;">\${error.message}</p>
          <pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 0.5rem; text-align: left; overflow-x: auto; font-size: 0.75rem; color: #f87171;">\${error.stack}</pre>
        </div>
      \`;
      
      // Notify parent
      window.parent.postMessage({ 
        type: 'PREVIEW_ERROR', 
        error: error.message,
        stack: error.stack
      }, '*');
    }
  </script>
  
  <!-- Global error handler -->
  <script>
    window.addEventListener('error', (event) => {
      console.error('❌ Global error:', event.error);
      window.parent.postMessage({ 
        type: 'PREVIEW_ERROR', 
        error: event.error?.message || event.message,
        stack: event.error?.stack
      }, '*');
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('❌ Unhandled promise rejection:', event.reason);
      window.parent.postMessage({ 
        type: 'PREVIEW_ERROR', 
        error: event.reason?.message || 'Promise rejection',
        stack: event.reason?.stack
      }, '*');
    });
  </script>
</body>
</html>`;
  };

  const extractComponents = (files) => {
  const components = [];
  const componentPaths = Object.keys(files).filter(path => 
    (path.includes('components/') || path.includes('pages/')) && 
    (path.endsWith('.jsx') || path.endsWith('.js'))
  );
  
  console.log('🔍 Component files found:', componentPaths);
  
  componentPaths.forEach(path => {
    try {
      const content = files[path];
      
      // **PRE-VALIDATE: Skip if contaminated**
      if (content.includes('｜') || content.includes('▁')) {
        console.warn(`⚠️ Skipping contaminated file: ${path}`);
        return;
      }
      
      const cleaned = sanitizeCode(content);
      
      if (cleaned && cleaned.trim().length > 0) {
        components.push(`// Component: ${path}\n${cleaned}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to process ${path}:`, error);
    }
  });
  
  return components;
};

  const sanitizeCode = (code) => {
  if (!code) return '';
  
  try {
    let sanitized = code
      // Remove imports
      .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '')
      .replace(/import\s+['"].*?['"];?\s*/g, '')
      
      // Remove exports
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+(const|function|class)\s+/g, '$1 ')
      .replace(/export\s+\{[^}]*\};?\s*/g, '')
      
      // **CRITICAL: Remove ALL tokenization artifacts**
      .replace(/<[｜|][^>]*[｜|]>/g, '')
      .replace(/[｜|]begin[_▁]of[_▁]sentence[｜|]/gi, '')
      .replace(/[｜|]end[_▁]of[_▁]turn[｜|]/gi, '')
      .replace(/[｜|]start[_▁]header[_▁]id[｜|]/gi, '')
      .replace(/[｜|]end[_▁]header[_▁]id[｜|]/gi, '')
      .replace(/[｜|][^｜|]*[｜|]/g, '')
      
      // Remove markdown
      .replace(/```(?:javascript|jsx|js|typescript|tsx)?\n?/g, '')
      .replace(/```\n?$/g, '')
      
      // Remove BOM and zero-width characters
      .replace(/^\uFEFF/, '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      
      .trim();
    
    // Validate result doesn't contain artifacts
    if (sanitized.includes('｜') || sanitized.includes('▁')) {
      console.warn('⚠️ Code still contaminated after cleaning, using fallback');
      return '';
    }
    
    return sanitized;
  } catch (error) {
    console.error('Sanitize error:', error);
    return '';
  }
};

  const getDefaultApp = () => {
    return `function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/50">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Your App is <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Live!</span>
            </h1>
            <p className="text-purple-200">Building in real-time with AI</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="text-center mb-4">
              <div className="text-6xl font-bold text-white mb-2">{count}</div>
              <div className="text-sm text-purple-300">Interactive Counter</div>
            </div>
            <button
              onClick={() => setCount(count + 1)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-xl transition-all hover:scale-105 shadow-lg"
            >
              Click Me! 🚀
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">⚛️</div>
              <div className="text-xs text-blue-200 mt-1">React 18</div>
            </div>
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">🎨</div>
              <div className="text-xs text-purple-200 mt-1">Tailwind</div>
            </div>
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">⚡</div>
              <div className="text-xs text-green-200 mt-1">Live</div>
            </div>
            <div className="bg-pink-500/20 border border-pink-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">🚀</div>
              <div className="text-xs text-pink-200 mt-1">Deploy</div>
            </div>
          </div>
          
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300 text-sm font-medium">Live Preview Active</span>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-purple-300 text-sm">Built by <span className="font-semibold">Launch AI</span> 🚀</p>
        </div>
      </div>
    </div>
  );
}`;
  };

  const addLog = (message, type = 'info') => {
    const log = {
      message,
      type,
      timestamp: new Date().toISOString()
    };
    
    setPreviewLogs(prev => [...prev, log].slice(-50));
    console.log(`[Preview ${type.toUpperCase()}]`, message);
  };

  const handleRefresh = () => {
    if (iframeRef.current && previewUrl) {
      addLog('🔄 Refreshing preview...', 'info');
      iframeRef.current.src = previewUrl;
    }
  };

  const viewportSizes = {
    desktop: { width: '100%', height: '100%', icon: Monitor, label: 'Desktop' },
    tablet: { width: '768px', height: '1024px', icon: Tablet, label: 'Tablet' },
    mobile: { width: '375px', height: '667px', icon: Smartphone, label: 'Mobile' }
  };

  const currentViewport = viewportSizes[previewMode];
  const ViewportIcon = currentViewport.icon;

  // Get available files for code viewer
  const availableFiles = files ? Object.keys(files).filter(path => 
    path.endsWith('.js') || path.endsWith('.jsx')
  ) : [];

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-[60]' : 'relative'} bg-slate-900 rounded-xl overflow-hidden`}>
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <TabButton 
              active={activeTab === 'preview'} 
              onClick={() => setActiveTab('preview')}
              icon={<Eye className="w-4 h-4" />}
            >
              Preview
            </TabButton>
            <TabButton 
              active={activeTab === 'code'} 
              onClick={() => setActiveTab('code')}
              icon={<Code className="w-4 h-4" />}
            >
              Code
            </TabButton>
            <TabButton 
              active={activeTab === 'logs'} 
              onClick={() => setActiveTab('logs')}
              icon={<Zap className="w-4 h-4" />}
            >
              Logs
            </TabButton>
          </div>

          {/* Viewport Selector (only for preview tab) */}
          {activeTab === 'preview' && (
            <div className="flex items-center gap-2">
              {Object.entries(viewportSizes).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setPreviewMode(key)}
                    className={`p-2 rounded-lg transition-all ${
                      previewMode === key 
                        ? 'bg-blue-500 text-white' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                    title={config.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {activeTab === 'preview' && (
              <>
                <button 
                  onClick={handleRefresh}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                  title="Refresh preview"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                  title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </>
            )}
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg">
              {previewReady ? (
                <>
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400 font-medium">READY</span>
                </>
              ) : previewError ? (
                <>
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-red-400 font-medium">ERROR</span>
                </>
              ) : (
                <>
                  <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                  <span className="text-xs text-blue-400 font-medium">LOADING</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="h-[600px] bg-slate-900">
        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="h-full flex items-center justify-center p-4">
            {previewError ? (
              <div className="text-center max-w-md">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Preview Error</h3>
                <p className="text-red-300 text-sm mb-4">{previewError}</p>
                <button
                  onClick={initializePreview}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all"
                >
                  Try Again
                </button>
              </div>
            ) : previewUrl ? (
              <div 
                className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300" 
                style={{ 
                  width: currentViewport.width, 
                  height: currentViewport.height, 
                  maxWidth: '100%', 
                  maxHeight: '100%' 
                }}
              >
                <iframe
                  ref={iframeRef}
                  src={previewUrl}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                  title="Live Preview"
                />
              </div>
            ) : (
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Initializing preview...</p>
                <p className="text-slate-500 text-sm mt-2">
                  {files && Object.keys(files).length > 0 
                    ? `Processing ${Object.keys(files).length} files...` 
                    : 'Waiting for files...'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Code Tab */}
        {activeTab === 'code' && (
          <div className="h-full flex">
            {/* File List */}
            <div className="w-64 bg-slate-800/50 border-r border-slate-700 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">
                  Files ({availableFiles.length})
                </h3>
                {availableFiles.length > 0 ? (
                  availableFiles.map((path) => (
                    <button
                      key={path}
                      onClick={() => setSelectedFile(path)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-mono transition-all mb-1 truncate ${
                        selectedFile === path 
                          ? 'bg-blue-500 text-white' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                      title={path}
                    >
                      {path.split('/').pop()}
                    </button>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">No files yet...</p>
                )}
              </div>
            </div>
            
            {/* Code View */}
            <div className="flex-1 overflow-auto">
              {files && files[selectedFile] ? (
                <pre className="p-6 text-slate-300 font-mono text-xs leading-relaxed">
                  <code>{files[selectedFile]}</code>
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-500">Select a file to view code</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="h-full overflow-y-auto p-4 font-mono text-xs">
            {previewLogs.length === 0 ? (
              <div className="text-center py-12">
                <Zap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500">No logs yet...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {previewLogs.map((log, i) => (
                  <div 
                    key={i} 
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      log.type === 'error' 
                        ? 'bg-red-500/10 border border-red-500/30' 
                        : log.type === 'success' 
                        ? 'bg-green-500/10 border border-green-500/30' 
                        : 'bg-slate-800/50 border border-slate-700'
                    }`}
                  >
                    <span className="text-slate-500 text-[10px] mt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`flex-1 ${
                      log.type === 'error' 
                        ? 'text-red-300' 
                        : log.type === 'success' 
                        ? 'text-green-300' 
                        : 'text-slate-300'
                    }`}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-800/50 border-t border-slate-700 px-4 py-2 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>React 18 + Tailwind CSS</span>
          <span>•</span>
          <span>Sandboxed Environment</span>
          {files && (
            <>
              <span>•</span>
              <span>{Object.keys(files).length} files loaded</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ViewportIcon className="w-3 h-3" />
          <span>{currentViewport.label}</span>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
        active 
          ? 'bg-blue-500 text-white' 
          : 'text-slate-400 hover:text-white hover:bg-slate-700'
      }`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

export default LiveAppPreview;