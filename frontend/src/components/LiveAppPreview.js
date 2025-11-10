// frontend/src/components/LiveAppPreview.js
import React, { useState, useMemo } from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';
import { 
  Monitor, Smartphone, Tablet, Maximize2, Minimize2, 
  RefreshCw, Code, Eye, Zap 
} from 'lucide-react';

function LiveAppPreview({ buildId, files, progress }) {
  const [activeTab, setActiveTab] = useState('preview');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [key, setKey] = useState(0);

  // Convert files to Sandpack format
  const sandpackFiles = useMemo(() => {
    if (!files || Object.keys(files).length === 0) {
      return {
        '/App.js': `export default function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Preview Loading...</h1>
    </div>
  );
}`
      };
    }

    const converted = {};
    Object.entries(files).forEach(([path, content]) => {
      // Normalize path
      let normalizedPath = path
        .replace(/^(frontend\/)?src\//, '/')
        .replace(/^backend\//, '/');
      
      if (!normalizedPath.startsWith('/')) {
        normalizedPath = '/' + normalizedPath;
      }

      converted[normalizedPath] = content;
    });

    return converted;
  }, [files]);

  const viewportSizes = {
    desktop: { width: '100%', height: '600px', icon: Monitor },
    tablet: { width: '768px', height: '600px', icon: Tablet },
    mobile: { width: '375px', height: '600px', icon: Smartphone }
  };

  const currentViewport = viewportSizes[previewMode];
  const ViewportIcon = currentViewport.icon;

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-[60] bg-slate-900' : 'relative'} rounded-xl overflow-hidden`}>
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
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button onClick={() => setKey(k => k + 1)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-slate-900" style={{ height: isFullscreen ? 'calc(100vh - 120px)' : '600px' }}>
        {activeTab === 'preview' && (
          <div className="h-full flex items-center justify-center p-4">
            <div className="transition-all duration-300" style={{ width: currentViewport.width, height: currentViewport.height, maxWidth: '100%', maxHeight: '100%' }}>
              <Sandpack
                key={key}
                files={sandpackFiles}
                template="react"
                theme="dark"
                options={{
                  showNavigator: false,
                  showTabs: false,
                  showLineNumbers: false,
                  editorHeight: '100%',
                  editorWidthPercentage: 0,
                  autorun: true,
                  autoReload: true
                }}
                customSetup={{
                  dependencies: {
                    'react': '^18.2.0',
                    'react-dom': '^18.2.0',
                    'react-router-dom': '^6.0.0'
                  }
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <Sandpack
            key={key}
            files={sandpackFiles}
            template="react"
            theme="dark"
            options={{
              showNavigator: true,
              showTabs: true,
              showLineNumbers: true,
              editorHeight: isFullscreen ? 'calc(100vh - 120px)' : '600px',
              editorWidthPercentage: 60,
              autorun: false
            }}
          />
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-800/50 border-t border-slate-700 px-4 py-2 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>React 18 + Sandpack</span>
          <span>•</span>
          <span>{Object.keys(sandpackFiles).length} files</span>
        </div>
        <div className="flex items-center gap-2">
          <ViewportIcon className="w-3 h-3" />
          <span>{previewMode}</span>
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
