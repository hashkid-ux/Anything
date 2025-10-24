import React, { useState } from 'react';
import { ArrowLeft, Sparkles, TrendingUp, Users, DollarSign, AlertTriangle, Loader } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function IdeaValidator({ onComplete, userTier, onBack }) {
  const [formData, setFormData] = useState({
    idea: '',
    targetMarket: '',
    budget: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/validate/idea`, formData, {
        headers: {
          'x-user-tier': userTier
        }
      });

      onComplete(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to validate idea. Please try again.');
      console.error('Validation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const isFormValid = formData.idea.length >= 10 && formData.targetMarket.length > 0;

  return (
    <section className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-600">AI-Powered Validation</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Let's Validate Your <span className="gradient-text">Business Idea</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Get a comprehensive market analysis, competitor research, and strategic recommendations in minutes.
          </p>
        </div>

        {/* Form */}
        <div className="glass-effect rounded-2xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Idea Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What's your business idea? <span className="text-red-500">*</span>
              </label>
              <textarea
                name="idea"
                value={formData.idea}
                onChange={handleChange}
                placeholder="Example: A mobile app that connects dog owners with nearby dog walkers, featuring real-time GPS tracking and in-app payments..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
                rows="6"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Be specific! The more details you provide, the better our analysis.
              </p>
            </div>

            {/* Target Market */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Who's your target market? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="targetMarket"
                value={formData.targetMarket}
                onChange={handleChange}
                placeholder="Example: Urban millennials aged 25-40 with dogs, earning $50K+"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What's your budget? (Optional)
              </label>
              <select
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="">Select budget range</option>
                <option value="under-10k">Under $10,000</option>
                <option value="10k-50k">$10,000 - $50,000</option>
                <option value="50k-100k">$50,000 - $100,000</option>
                <option value="100k-500k">$100,000 - $500,000</option>
                <option value="500k-plus">$500,000+</option>
              </select>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-1">Validation Failed</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`w-full button-premium flex items-center justify-center gap-2 ${
                (!isFormValid || loading) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Analyzing Your Idea...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Validate My Idea (Free)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* What You'll Get */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold mb-2">Market Analysis</h3>
            <p className="text-sm text-gray-600">TAM, SAM, SOM calculations with real data</p>
          </div>
          <div className="card text-center">
            <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold mb-2">Competitor Intel</h3>
            <p className="text-sm text-gray-600">Who you're up against and how to win</p>
          </div>
          <div className="card text-center">
            <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold mb-2">Revenue Forecast</h3>
            <p className="text-sm text-gray-600">3-year projections with assumptions</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default IdeaValidator;