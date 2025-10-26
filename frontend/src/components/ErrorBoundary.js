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

    // Send to error tracking service (e.g., Sentry)
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
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 -left-48 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="relative z-10 max-w-4xl w-full">
            {/* Error Card */}
            <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-2 border-red-500/30 rounded-3xl p-8 md:p-12 shadow-2xl animate-scale-in">
              {/* Icon */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-full mb-6 animate-bounce shadow-2xl shadow-red-500/50">
                  <AlertTriangle className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                  Oops! Something Broke 💥
                </h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  Don't worry, our AI agents are still learning. This isn't your fault - let's get you back on track!
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <button
                  onClick={this.handleReset}
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-6 py-4 rounded-2xl transition-all hover:scale-105 shadow-2xl flex items-center justify-center gap-3"
                >
                  <Home className="w-5 h-5" />
                  <span>Go Home</span>
                </button>
                <button
                  onClick={this.handleReload}
                  className="bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/30 text-white font-bold px-6 py-4 rounded-2xl transition-all hover:scale-105 flex items-center justify-center gap-3"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Reload Page</span>
                </button>
                <a
                  href="mailto:support@launch-ai.com"
                  className="bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/30 text-white font-bold px-6 py-4 rounded-2xl transition-all hover:scale-105 flex items-center justify-center gap-3"
                >
                  <Mail className="w-5 h-5" />
                  <span>Contact Us</span>
                </a>
              </div>

              {/* Error Details Toggle */}
              {isDevelopment && this.state.error && (
                <div className="space-y-4">
                  <button
                    onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                    className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-6 py-4 text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Bug className="w-5 h-5 text-red-400" />
                      <span className="text-white font-semibold">
                        {this.state.showDetails ? 'Hide' : 'Show'} Error Details (Dev Mode)
                      </span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${this.state.showDetails ? 'rotate-180' : ''}`} />
                  </button>

                  {this.state.showDetails && (
                    <div className="bg-black/40 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 animate-slide-down">
                      {/* Error Message */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-red-400 font-bold text-sm uppercase tracking-wide">Error Message</h3>
                          <button
                            onClick={this.copyErrorToClipboard}
                            className="text-xs text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            Copy Details
                          </button>
                        </div>
                        <pre className="text-red-300 font-mono text-sm overflow-auto bg-red-500/10 p-4 rounded-xl">
                          {this.state.error.toString()}
                        </pre>
                      </div>

                      {/* Component Stack */}
                      {this.state.errorInfo?.componentStack && (
                        <div>
                          <h3 className="text-orange-400 font-bold text-sm uppercase tracking-wide mb-2">Component Stack</h3>
                          <pre className="text-gray-300 font-mono text-xs overflow-auto max-h-64 bg-orange-500/10 p-4 rounded-xl leading-relaxed">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}

                      {/* Additional Info */}
                      <div className="mt-4 grid md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-xl p-4">
                          <p className="text-gray-400 text-xs mb-1">Browser</p>
                          <p className="text-white text-sm font-mono">{navigator.userAgent.split(' ').slice(0, 3).join(' ')}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <p className="text-gray-400 text-xs mb-1">URL</p>
                          <p className="text-white text-sm font-mono truncate">{window.location.href}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Production Message */}
              {!isDevelopment && (
                <div className="bg-blue-500/20 border-2 border-blue-500/30 rounded-2xl p-6">
                  <h4 className="text-blue-300 font-bold mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    What happened?
                  </h4>
                  <p className="text-blue-200 text-sm leading-relaxed mb-4">
                    Our AI-powered platform encountered an unexpected issue. This has been automatically reported to our team, 
                    and we're working on a fix.
                  </p>
                  <div className="flex items-start gap-3 text-sm text-blue-200">
                    <span className="font-bold">Error ID:</span>
                    <code className="flex-1 bg-blue-500/20 px-3 py-1 rounded font-mono">
                      {Date.now().toString(36).toUpperCase()}
                    </code>
                  </div>
                </div>
              )}

              {/* Helpful Tips */}
              <div className="mt-8 grid md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h4 className="text-white font-bold mb-2 text-sm">Quick Fixes</h4>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      <span>Try refreshing the page</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      <span>Clear your browser cache</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      <span>Check your internet connection</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h4 className="text-white font-bold mb-2 text-sm">Need Help?</h4>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>Email: support@launch-ai.com</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>Discord: Community Support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>Docs: docs.launch-ai.com</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Footer Note */}
              <p className="text-center text-gray-500 text-sm mt-8">
                This error has been logged and our team will investigate it. Thank you for your patience! 🙏
              </p>
            </div>
          </div>

          <style jsx>{`
            @keyframes slide-down {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .animate-slide-down {
              animation: slide-down 0.3s ease-out;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;