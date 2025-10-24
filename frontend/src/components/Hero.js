import React from 'react';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

function Hero({ onGetStarted }) {
  return (
    <section className="relative overflow-hidden px-4 py-20 lg:py-32">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-8 shadow-lg border border-gray-200">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Powered by Claude Sonnet 4.5 - The Smartest AI
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            From <span className="gradient-text">Idea to $1M</span><br />
            in 30 Days
          </h1>

          {/* Subheadline */}
          <p className="text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed">
            The only AI platform that validates your market, builds your product, 
            deploys your app, and grows your business. <span className="font-semibold text-gray-800">Not a toy. A business partner.</span>
          </p>

          {/* Social Proof */}
          <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>$50M+ Revenue Generated</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>2,847 Apps Launched</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>98% Success Rate</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button 
              onClick={onGetStarted}
              className="button-premium group"
            >
              <span className="flex items-center gap-2">
                Validate Your Idea (Free)
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button className="bg-white hover:bg-gray-50 text-gray-800 font-semibold px-8 py-4 rounded-xl shadow-md hover:shadow-xl border border-gray-200 transition-all duration-300">
              Watch Demo (2 min)
            </button>
          </div>

          {/* Trust Indicators */}
          <p className="text-sm text-gray-500">
            No credit card required • Cancel anytime • Used by YC founders
          </p>
        </div>

        {/* Preview Dashboard (Optional - can be an image or component) */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="glass-effect rounded-2xl p-8 border-2 border-white/50 shadow-2xl">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold mb-2">Your Success Dashboard</h3>
              <p className="text-gray-600">
                Real-time analytics, revenue tracking, and AI-powered growth recommendations
              </p>
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">$47K</div>
                  <div className="text-xs text-gray-500">Monthly Revenue</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">2.4K</div>
                  <div className="text-xs text-gray-500">Active Users</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">94%</div>
                  <div className="text-xs text-gray-500">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;