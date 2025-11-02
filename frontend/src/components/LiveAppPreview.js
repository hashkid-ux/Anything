// frontend/src/components/LiveAppPreview.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  Monitor, Code, Eye, Maximize2, Minimize2, RefreshCw, 
  Smartphone, Tablet, Loader2, Zap, X
} from 'lucide-react';

function LiveAppPreview({ buildId, files, progress }) {
  const [activeTab, setActiveTab] = useState('preview');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewReady, setPreviewReady] = useState(false);
  const [previewLogs, setPreviewLogs] = useState([]);
  const [selectedFile, setSelectedFile] = useState('src/App.js');
  const iframeRef = useRef(null);

  useEffect(() => {
    if (files && Object.keys(files).length > 0) {
      initializePreview();
    }
  }, [files]);

  const initializePreview = async () => {
    try {
      addLog('🔧 Initializing preview...', 'info');
      const html = createPreviewHTML(files);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewReady(true);
      addLog('✅ Preview ready', 'success');
    } catch (error) {
      console.error('Preview error:', error);
      addLog(`❌ Error: ${error.message}`, 'error');
    }
  };

  const createPreviewHTML = (files) => {
    const appJs = files['src/App.js'] || files['frontend/src/App.js'] || getDefaultApp();
    const components = extractComponents(files);
    
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(to bottom right, #0f172a, #1e1b4b);
      min-height: 100vh;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect } = React;
    ${components.join('\n\n')}
    ${sanitizeCode(appJs)}
    const container = document.getElementById('root');
    const root = ReactDOM.createRoot(container);
    try {
      root.render(<App />);
      window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
    } catch (error) {
      window.parent.postMessage({ type: 'PREVIEW_ERROR', error: error.message }, '*');
    }
  </script>
  <script>
    window.addEventListener('error', (e) => {
      window.parent.postMessage({ type: 'PREVIEW_ERROR', error: e.message }, '*');
    });
  </script>
</body>
</html>`;
  };

  const extractComponents = (files) => {
    const components = [];
    Object.entries(files).forEach(([path, content]) => {
      if (path.includes('components/') && (path.endsWith('.jsx') || path.endsWith('.js'))) {
        const cleaned = sanitizeCode(content);
        if (cleaned) components.push(cleaned);
      }
    });
    return components;
  };

  const sanitizeCode = (code) => {
    return code
      .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '')
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+/g, '')
      .trim();
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
              <div className="text-sm text-purple-300">Click counter</div>
            </div>
            <button
              onClick={() => setCount(count + 1)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-xl transition-all hover:scale-105 shadow-lg"
            >
              Click Me!
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
              <div className="text-xs text-green-200 mt-1">Fast</div>
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
    setPreviewLogs(prev => [...prev, { message, type, timestamp: new Date().toISOString() }].slice(-50));
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'PREVIEW_READY') {
        addLog('✅ Preview rendered', 'success');
      } else if (event.data.type === 'PREVIEW_ERROR') {
        addLog(`❌ Error: ${event.data.error}`, 'error');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const viewportSizes = {
    desktop: { width: '100%', height: '100%', icon: Monitor },
    tablet: { width: '768px', height: '1024px', icon: Tablet },
    mobile: { width: '375px', height: '667px', icon: Smartphone }
  };

  const currentViewport = viewportSizes[previewMode];
  const ViewportIcon = currentViewport.icon;

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-[60]' : 'relative'} bg-slate-900`}>
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'preview' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'code' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Code className="w-4 h-4" />
              Code
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'logs' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Zap className="w-4 h-4" />
              Logs
            </button>
          </div>

          {activeTab === 'preview' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded-lg transition-all ${previewMode === 'desktop' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewMode('tablet')}
                className={`p-2 rounded-lg transition-all ${previewMode === 'tablet' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded-lg transition-all ${previewMode === 'mobile' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {activeTab === 'preview' && (
              <>
                <button onClick={() => iframeRef.current && (iframeRef.current.src = iframeRef.current.src)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
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
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-medium">LIVE</span>
                </>
              ) : (
                <>
                  <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                  <span className="text-xs text-blue-400 font-medium">Loading</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="h-[600px] bg-slate-900">
        {activeTab === 'preview' && (
          <div className="h-full flex items-center justify-center p-4">
            {previewUrl ? (
              <div className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300" style={{ width: currentViewport.width, height: currentViewport.height, maxWidth: '100%', maxHeight: '100%' }}>
                <iframe ref={iframeRef} src={previewUrl} className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin allow-forms allow-modals" title="Live Preview" />
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
                <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Files</h3>
                {files && Object.keys(files).map((path) => (
                  <button
                    key={path}
                    onClick={() => setSelectedFile(path)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-mono transition-all mb-1 ${
                      selectedFile === path ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {path.split('/').pop()}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <pre className="p-6 text-slate-300 font-mono text-xs leading-relaxed">
                <code>{files?.[selectedFile] || '// No file selected'}</code>
              </pre>
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
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${log.type === 'error' ? 'bg-red-500/10 border border-red-500/30' : log.type === 'success' ? 'bg-green-500/10 border border-green-500/30' : 'bg-slate-800/50 border border-slate-700'}`}>
                    <span className="text-slate-500 text-[10px] mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className={`flex-1 ${log.type === 'error' ? 'text-red-300' : log.type === 'success' ? 'text-green-300' : 'text-slate-300'}`}>{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-slate-800/50 border-t border-slate-700 px-4 py-2 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>React 18 + Tailwind CSS</span>
          <span>•</span>
          <span>Sandboxed Environment</span>
        </div>
        <div className="flex items-center gap-2">
          <ViewportIcon className="w-3 h-3" />
          <span>{previewMode}</span>
        </div>
      </div>
    </div>
  );
}

export default LiveAppPreview;