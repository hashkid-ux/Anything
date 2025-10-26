import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Mail, FileText, ChevronDown } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    if (window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  copyErrorToClipboard = () => {
    const errorText = `
Error: ${this.state.error?.toString()}
Stack: ${this.state.errorInfo?.componentStack}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}
Time: ${new Date().toISOString()}
    `.trim();

    navigator.clipboard.writeText(errorText).then(() => {
      alert('Error details copied to clipboard!');
    });
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900 relative overflow-hidden">
          {/* Subtle Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-1/4 -left-48 w-96 h-96 bg-red-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-3xl w-full">
            {/* Error Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-10 shadow-2xl">
              {/* Icon */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full mb-6 shadow-2xl shadow-red-500/25">
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Oops! Something Went Wrong
                </h1>
                <p className="text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
                  Don't worry, our AI agents are still learning. This isn't your fault - let's get you back on track!
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-3 gap-3 mb-8">
                <button
                  onClick={this.handleReset}
                  className="group flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-4 py-3 rounded-xl transition-all hover:scale-[1.02]"
                >
                  <Home className="w-4 h-4" />
                  <span>Go Home</span>
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-white font-semibold px-4 py-3 rounded-xl transition-all hover:scale-[1.02]"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reload</span>
                </button>
                <a
                  href="mailto:support@launch-ai.com"
                  className="flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-white font-semibold px-4 py-3 rounded-xl transition-all hover:scale-[1.02]"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact</span>
                </a>
              </div>

              {/* Error Details Toggle */}
              {isDevelopment && this.state.error && (
                <div className="space-y-3">
                  <button
                    onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                    className="w-full flex items-center justify-between bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-left transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Bug className="w-4 h-4 text-red-400" />
                      <span className="text-white font-medium text-sm">
                        {this.state.showDetails ? 'Hide' : 'Show'} Error Details (Dev Mode)
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${this.state.showDetails ? 'rotate-180' : ''}`} />
                  </button>

                  {this.state.showDetails && (
                    <div className="bg-black/40 backdrop-blur-sm border border-red-500/20 rounded-xl p-5">
                      {/* Error Message */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-red-400 font-semibold text-xs uppercase">Error Message</h3>
                          <button
                            onClick={this.copyErrorToClipboard}
                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Copy
                          </button>
                        </div>
                        <pre className="text-red-300 font-mono text-xs overflow-auto bg-red-500/10 p-3 rounded-lg max-h-32">
                          {this.state.error.toString()}
                        </pre>
                      </div>

                      {/* Component Stack */}
                      {this.state.errorInfo?.componentStack && (
                        <div>
                          <h3 className="text-orange-400 font-semibold text-xs uppercase mb-2">Component Stack</h3>
                          <pre className="text-slate-300 font-mono text-xs overflow-auto max-h-48 bg-orange-500/10 p-3 rounded-lg leading-relaxed">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}

                      {/* Additional Info */}
                      <div className="mt-4 grid md:grid-cols-2 gap-3">
                        <div className="bg-slate-800/30 rounded-lg p-3">
                          <p className="text-slate-500 text-xs mb-1">Browser</p>
                          <p className="text-white text-xs font-mono truncate">{navigator.userAgent.split(' ').slice(0, 3).join(' ')}</p>
                        </div>
                        <div className="bg-slate-800/30 rounded-lg p-3">
                          <p className="text-slate-500 text-xs mb-1">URL</p>
                          <p className="text-white text-xs font-mono truncate">{window.location.href}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Production Message */}
              {!isDevelopment && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
                  <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    What happened?
                  </h4>
                  <p className="text-blue-200 text-sm leading-relaxed mb-3">
                    Our AI-powered platform encountered an unexpected issue. This has been automatically reported to our team.
                  </p>
                  <div className="flex items-start gap-2 text-xs text-blue-200">
                    <span className="font-semibold">Error ID:</span>
                    <code className="flex-1 bg-blue-500/20 px-2 py-1 rounded font-mono">
                      {Date.now().toString(36).toUpperCase()}
                    </code>
                  </div>
                </div>
              )}

              {/* Helpful Tips */}
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-3 text-sm">Quick Fixes</h4>
                  <ul className="space-y-2 text-slate-400 text-xs">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">•</span>
                      <span>Try refreshing the page</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">•</span>
                      <span>Clear your browser cache</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">•</span>
                      <span>Check your internet</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-3 text-sm">Need Help?</h4>
                  <ul className="space-y-2 text-slate-400 text-xs">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>support@launch-ai.com</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>Discord Community</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>docs.launch-ai.com</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <p className="text-center text-slate-500 text-xs mt-6">
                This error has been logged. Our team will investigate it. Thank you for your patience! 🙏
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;