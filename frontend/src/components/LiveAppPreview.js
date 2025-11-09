// frontend/src/components/LiveAppPreview.js
// FULLY FIXED - Handles React Router and JSX properly

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

  useEffect(() => {
    if (files && Object.keys(files).length > 0) {
      const filesChanged = JSON.stringify(files) !== JSON.stringify(previousFilesRef.current);
      
      if (filesChanged) {
        console.log('🔄 Files changed, regenerating preview. Files count:', Object.keys(files).length);
        previousFilesRef.current = files;
        initializePreview();
      }
    }
  }, [files]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'PREVIEW_READY') {
        setPreviewReady(true);
        addLog('✅ Preview rendered successfully', 'success');
      } else if (event.data.type === 'PREVIEW_ERROR') {
        setPreviewError(event.data.error);
        addLog(`❌ Runtime Error: ${event.data.error}`, 'error');
      } else if (event.data.type === 'BABEL_ERROR') {
        setPreviewError(`JSX Compilation Error: ${event.data.error}`);
        addLog(`❌ Babel Error: ${event.data.error}`, 'error');
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const initializePreview = async () => {
    try {
      setPreviewError(null);
      setPreviewReady(false);
      addLog('🔧 Initializing browser-compatible preview...', 'info');
      
      if (!files || Object.keys(files).length === 0) {
        throw new Error('No files available for preview');
      }

      console.log('📁 Available files:', Object.keys(files));

      // Create browser-compatible preview HTML
      const html = createBrowserPreviewHTML(files);
      
      // Create blob URL
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Clean up old URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setPreviewUrl(url);
      addLog('✅ Preview ready!', 'success');
      
    } catch (error) {
      console.error('❌ Preview initialization error:', error);
      setPreviewError(error.message);
      addLog(`❌ Error: ${error.message}`, 'error');
    }
  };

  const createBrowserPreviewHTML = (files) => {
    try {
      addLog('🎨 Generating browser preview...', 'info');
      
      // Find App.js
      const appPaths = ['src/App.js', 'frontend/src/App.js', 'App.js'];
      let appJs = null;
      
      for (const path of appPaths) {
        if (files[path]) {
          appJs = files[path];
          addLog(`✅ Found ${path}`, 'success');
          break;
        }
      }
      
      if (!appJs) {
        addLog('⚠️ App.js not found, using default', 'warning');
        appJs = getDefaultApp();
      } else {
        // Strip imports and fix React Router
        appJs = fixAppJsForBrowser(appJs);
      }
      
      // Extract components
      const components = extractComponents(files);
      
      const html = buildBrowserHTML(appJs, components);
      addLog('✅ Browser-compatible HTML generated', 'success');
      
      return html;
      
    } catch (error) {
      console.error('Preview build error:', error);
      return buildBrowserHTML(getDefaultApp(), []);
    }
  };

  const fixAppJsForBrowser = (code) => {
    let fixed = code;
    
    // Remove all imports
    fixed = fixed.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '');
    
    // Check if it uses React Router
    const usesRouter = fixed.includes('<Router') || fixed.includes('<Routes') || fixed.includes('<Route');
    
    if (usesRouter) {
      // Strip Router components but keep the content
      fixed = fixed
        .replace(/<Router[^>]*>/g, '<>')
        .replace(/<\/Router>/g, '</>')
        .replace(/<Routes[^>]*>/g, '<>')
        .replace(/<\/Routes>/g, '</>')
        .replace(/<Route\s+path="[^"]*"\s+element=\{([^}]+)\}\s*\/>/g, '$1');
    }
    
    // Remove export statements
    fixed = fixed.replace(/export\s+default\s+/g, '');
    
    return fixed.trim();
  };

  const buildBrowserHTML = (appJs, components) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: system-ui, -apple-system, sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      overflow-x: hidden;
    }
    #root { min-height: 100vh; }
    .error-boundary {
      padding: 2rem;
      text-align: center;
      color: white;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="error-boundary">
      <div style="font-size: 3rem; margin-bottom: 1rem;">⚛️</div>
      <div style="font-size: 1.25rem; margin-bottom: 0.5rem;">Loading Preview...</div>
      <div style="font-size: 0.875rem; color: rgba(255,255,255,0.7);">Compiling React components</div>
    </div>
  </div>
  
  <script type="text/babel" data-type="module">
    const { useState, useEffect, useRef, createContext, useContext } = React;
    
    // Error Boundary
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }
      
      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }
      
      componentDidCatch(error, errorInfo) {
        console.error('React Error:', error, errorInfo);
        window.parent.postMessage({ 
          type: 'PREVIEW_ERROR', 
          error: error.message 
        }, '*');
      }
      
      render() {
        if (this.state.hasError) {
          return (
            <div className="error-boundary">
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>❌</div>
              <h1 style={{fontSize: '2rem', marginBottom: '1rem', color: '#ef4444'}}>
                Preview Error
              </h1>
              <p style={{color: '#fca5a5', marginBottom: '1rem', maxWidth: '500px'}}>
                {this.state.error?.message || 'An error occurred'}
              </p>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Reload Preview
              </button>
            </div>
          );
        }
        
        return this.props.children;
      }
    }
    
    // Components
    ${components.map((comp, i) => {
      return `// Component ${i + 1}\n${comp}`;
    }).join('\n\n')}
    
    // Main App
    ${appJs}
    
    // Render
    try {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      );
      
      setTimeout(() => {
        window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
        console.log('✅ Preview rendered successfully');
      }, 500);
      
    } catch (error) {
      console.error('Render error:', error);
      document.getElementById('root').innerHTML = \`
        <div class="error-boundary">
          <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
          <h1 style="color: #ef4444; font-size: 2rem; margin-bottom: 1rem;">
            Render Failed
          </h1>
          <p style="color: #fca5a5; max-width: 500px;">\${error.message}</p>
        </div>
      \`;
      window.parent.postMessage({ 
        type: 'PREVIEW_ERROR', 
        error: error.message 
      }, '*');
    }
  </script>
  
  <script>
    // Global error handlers
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error || e.message);
      
      // Check if it's a Babel compilation error
      if (e.message && e.message.includes('Unexpected token')) {
        window.parent.postMessage({ 
          type: 'BABEL_ERROR', 
          error: 'JSX compilation failed. Check your component syntax.' 
        }, '*');
      } else {
        window.parent.postMessage({ 
          type: 'PREVIEW_ERROR', 
          error: e.error?.message || e.message 
        }, '*');
      }
    });
    
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled rejection:', e.reason);
      window.parent.postMessage({ 
        type: 'PREVIEW_ERROR', 
        error: e.reason?.message || 'Promise rejection' 
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
      (path.endsWith('.jsx') || path.endsWith('.js')) &&
      !path.includes('App.js')
    );
    
    console.log('🔍 Component files found:', componentPaths);
    
    componentPaths.forEach(path => {
      try {
        const content = files[path];
        
        // Skip contaminated files
        if (content.includes('｜') || content.includes('▁') || content.includes('<|')) {
          console.warn(`⚠️ Skipping contaminated file: ${path}`);
          return;
        }
        
        const cleaned = sanitizeCode(content);
        
        if (cleaned && cleaned.trim().length > 50) {
          components.push(`// ${path}\n${cleaned}`);
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
        // Remove export default
        .replace(/export\s+default\s+/g, '')
        // Remove export const/function
        .replace(/export\s+(const|function|class)\s+/g, '$1 ')
        // Remove artifacts
        .replace(/<[｜|][^>]*[｜|]>/g, '')
        .replace(/[｜|]begin[_▁]of[_▁]sentence[｜|]/gi, '')
        .replace(/```[\w]*\n?/g, '')
        .trim();
      
      // Final contamination check
      if (sanitized.includes('｜') || sanitized.includes('▁') || sanitized.includes('<|')) {
        console.error('❌ Code still contaminated, skipping');
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
    const log = { message, type, timestamp: new Date().toISOString() };
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
  const availableFiles = files ? Object.keys(files).filter(path => 
    path.endsWith('.js') || path.endsWith('.jsx')
  ) : [];

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-[60]' : 'relative'} bg-slate-900 rounded-xl overflow-hidden`}>
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TabButton active={activeTab === 'preview'} onClick={() => setActiveTab('preview')} icon={<Eye className="w-4 h-4" />}>
              Preview
            </TabButton>
            <TabButton active={activeTab === 'code'} onClick={() => setActiveTab('code')} icon={<Code className="w-4 h-4" />}>
              Code
            </TabButton>
            <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<Zap className="w-4 h-4" />}>
              Logs
            </TabButton>
          </div>

          {activeTab === 'preview' && (
            <div className="flex items-center gap-2">
              {Object.entries(viewportSizes).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setPreviewMode(key)}
                    className={`p-2 rounded-lg transition-all ${
                      previewMode === key ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                    title={config.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-2">
            {activeTab === 'preview' && (
              <>
                <button onClick={handleRefresh} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all" title="Refresh">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </>
            )}
            
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

      {/* Content */}
      <div className="h-[600px] bg-slate-900">
        {activeTab === 'preview' && (
          <div className="h-full flex items-center justify-center p-4">
            {previewError ? (
              <div className="text-center max-w-md">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Preview Error</h3>
                <p className="text-red-300 text-sm mb-4">{previewError}</p>
                <button onClick={initializePreview} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all">
                  Try Again
                </button>
              </div>
            ) : previewUrl ? (
              <div className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300" style={{ width: currentViewport.width, height: currentViewport.height, maxWidth: '100%', maxHeight: '100%' }}>
                <iframe
                  ref={iframeRef}
                  src={previewUrl}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                  title="Live Preview"
                />
              </div>
            ) : (
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Initializing preview...</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'code' && (
          <div className="h-full flex">
            <div className="w-64 bg-slate-800/50 border-r border-slate-700 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Files ({availableFiles.length})</h3>
                {availableFiles.map((path) => (
                  <button
                    key={path}
                    onClick={() => setSelectedFile(path)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-mono transition-all mb-1 truncate ${
                      selectedFile === path ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                    title={path}
                  >
                    {path.split('/').pop()}
                  </button>
                ))}
              </div>
            </div>
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
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${
                    log.type === 'error' ? 'bg-red-500/10 border border-red-500/30' : 
                    log.type === 'success' ? 'bg-green-500/10 border border-green-500/30' : 
                    'bg-slate-800/50 border border-slate-700'
                  }`}>
                    <span className="text-slate-500 text-[10px] mt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`flex-1 ${
                      log.type === 'error' ? 'text-red-300' : 
                      log.type === 'success' ? 'text-green-300' : 
                      'text-slate-300'
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
          <span>Browser Preview</span>
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
        active ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
      }`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

export default LiveAppPreview;
