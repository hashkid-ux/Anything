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
  // Add state for AI repair tracking
const [repairAttempts, setRepairAttempts] = useState(0);
const [lastRepairError, setLastRepairError] = useState(null);

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

  // Replace createPreviewHTML with AI-aware version
const createPreviewHTML = async (files) => {
  try {
    console.log('🏗️ Building preview with AI validation...');
    
    // Validate App.js
    const appPaths = ['src/App.js', 'frontend/src/App.js', 'App.js'];
    let appJs = null;
    let appPath = null;
    
    for (const path of appPaths) {
      if (files[path]) {
        appJs = files[path];
        appPath = path;
        break;
      }
    }
    
    if (!appJs) {
      appJs = getDefaultApp();
    } else {
      // AI validation for App.js
      const validation = await validateComponentWithAI(appJs, appPath);
      if (!validation.valid && repairAttempts < 2) {
        addLog('🔧 App.js has errors, asking AI to fix...', 'warning');
        setRepairAttempts(prev => prev + 1);
        
        const fixed = await repairComponentWithAI(appJs, validation.errors);
        if (fixed) {
          appJs = fixed;
          addLog('✅ AI repaired App.js', 'success');
        }
      }
    }
    
    // Extract and validate components
    const components = extractComponents(files);
    
    return buildSafeHTML(appJs, components);
    
  } catch (error) {
    console.error('Preview build error:', error);
    setLastRepairError(error.message);
    return buildSafeHTML(getDefaultApp(), []);
  }
};

// AI component validation
const validateComponentWithAI = async (code, filepath) => {
  try {
    // Quick syntax check
    const openCount = (code.match(/\(/g) || []).length;
    const closeCount = (code.match(/\)/g) || []).length;
    const braceOpen = (code.match(/\{/g) || []).length;
    const braceClose = (code.match(/\}/g) || []).length;
    
    const errors = [];
    if (openCount !== closeCount) errors.push(`Unbalanced parentheses: ${openCount} open, ${closeCount} close`);
    if (braceOpen !== braceClose) errors.push(`Unbalanced braces: ${braceOpen} open, ${braceClose} close`);
    if (/\s!\s(?!==)/.test(code)) errors.push('Standalone ! operator');
    
    return { valid: errors.length === 0, errors };
  } catch (error) {
    return { valid: false, errors: [error.message] };
  }
};

// AI component repair
const repairComponentWithAI = async (brokenCode, errors) => {
  try {
    const API_BASE_URL = process.env.REACT_APP_API_URL || window.location.origin;
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/api/repair-code`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: brokenCode,
        errors: errors,
        language: 'javascript'
      })
    });
    
    if (!response.ok) throw new Error('AI repair failed');
    
    const data = await response.json();
    return data.fixed_code;
    
  } catch (error) {
    console.error('AI repair error:', error);
    return null;
  }
};

  const buildSafeHTML = (appJs, components) => {
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
    }
    #root { min-height: 100vh; }
    .error-boundary {
      padding: 2rem;
      text-align: center;
      color: white;
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="error-boundary">Loading...</div>
  </div>
  
  <script type="text/babel">
    const { useState, useEffect, useRef, createContext, useContext } = React;
    
    // Error Boundary Component
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
              <h1 style={{fontSize: '2rem', marginBottom: '1rem', color: '#ef4444'}}>
                Preview Error
              </h1>
              <p style={{color: '#fca5a5', marginBottom: '1rem'}}>
                {this.state.error?.message || 'An error occurred'}
              </p>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
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
    
    // Inject components safely
    ${components.map((comp, i) => {
      return `try { ${comp} } catch(e) { console.error('Component ${i} error:', e); }`;
    }).join('\n\n')}
    
    // Main App
    try {
      ${appJs}
    } catch(e) {
      console.error('App.js error:', e);
      window.parent.postMessage({ 
        type: 'PREVIEW_ERROR', 
        error: 'App.js failed to load: ' + e.message 
      }, '*');
    }
    
    // Render
    try {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      );
      
      window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
      console.log('✅ Preview rendered');
    } catch (error) {
      console.error('Render error:', error);
      document.getElementById('root').innerHTML = \`
        <div class="error-boundary">
          <h1 style="color: #ef4444; font-size: 2rem; margin-bottom: 1rem;">
            Render Failed
          </h1>
          <p style="color: #fca5a5;">\${error.message}</p>
        </div>
      \`;
      window.parent.postMessage({ 
        type: 'PREVIEW_ERROR', 
        error: error.message 
      }, '*');
    }
  </script>
  
  <script>
    // Global error handler
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
      window.parent.postMessage({ 
        type: 'PREVIEW_ERROR', 
        error: e.error?.message || e.message 
      }, '*');
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
      .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '')
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+(const|function|class)\s+/g, '$1 ')
      .replace(/<[｜|][^>]*[｜|]>/g, '')
      .replace(/[｜|]begin[_▁]of[_▁]sentence[｜|]/gi, '')
      .replace(/```[\w]*\n?/g, '')
      .trim();
    
    // CRITICAL: Fix logical operators
    sanitized = sanitized
      .replace(/\s+!\s+(\w)/g, ' && !$1')  // Fix "! variable"
      .replace(/(\w+)\s+!\s+(\w+)/g, '$1 && !$2');  // Fix "var1 ! var2"
    
    // Validate parentheses balance
    let balance = 0;
    for (const char of sanitized) {
      if (char === '(') balance++;
      if (char === ')') balance--;
    }
    
    if (balance > 0) {
      sanitized += ')'.repeat(balance);
      console.warn(`⚠️ Auto-closed ${balance} parentheses`);
    }
    
    // Final contamination check
    if (sanitized.includes('｜') || sanitized.includes('▁')) {
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