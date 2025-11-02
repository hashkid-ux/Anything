import React, { useState, useEffect } from 'react';
import { X, Check, Crown, Zap, Loader, Sparkles, Shield, Rocket, Star, TrendingUp, Users, Award } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function PricingModal({ isOpen, onClose, currentTier, onUpgradeSuccess }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly or annual
  const [showTooltip, setShowTooltip] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${API_URL}/api/payments/plans`);
      const data = await response.json();
      setPlans(data.plans);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const handleUpgrade = async (plan) => {
    setLoading(true);
    setSelectedPlan(plan.id);

    try {
      const orderResponse = await fetch(`${API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ plan: plan.id })
      });

      const orderData = await orderResponse.json();
      const { order, razorpay_key } = orderData;

      const options = {
        key: razorpay_key,
        amount: order.amount,
        currency: order.currency,
        name: 'Launch AI',
        description: `${plan.name} Plan Subscription`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyResponse = await fetch(`${API_URL}/api/payments/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: plan.id
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              const user = JSON.parse(localStorage.getItem('user'));
              user.tier = plan.id;
              user.credits = plan.credits;
              localStorage.setItem('user', JSON.stringify(user));

              onUpgradeSuccess(plan.id);
              onClose();
            }
          } catch (error) {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          email: JSON.parse(localStorage.getItem('user'))?.email || ''
        },
        theme: {
          color: '#6366F1'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            setSelectedPlan(null);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/90 via-slate-900/95 to-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-700/50 rounded-3xl max-w-7xl w-full shadow-2xl shadow-purple-500/10 relative my-8">
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative p-8 md:p-12">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all duration-200 group border border-slate-700/50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          </button>

          {/* Header Section */}
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">Trusted by 10,000+ Developers</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Choose Your Perfect Plan
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Transform your ideas into production-ready apps with AI-powered development. Start building in minutes.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <span className={`text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-14 h-7 bg-slate-700 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${billingCycle === 'annual' ? 'translate-x-7' : ''}`} />
            </button>
            <span className={`text-sm font-medium transition-colors ${billingCycle === 'annual' ? 'text-white' : 'text-slate-500'}`}>
              Annual
            </span>
            <span className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-300">
              Save 20%
            </span>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Free Plan */}
            <PlanCard
              name="Free"
              price="₹0"
              priceUsd="$0"
              period="/forever"
              icon={<Zap className="w-6 h-6" />}
              description="Perfect for trying out Launch AI"
              features={[
                { text: '3 app builds', highlight: false },
                { text: 'Market research tools', highlight: false },
                { text: 'Basic code generation', highlight: false },
                { text: 'Community support', highlight: false },
                { text: 'Public projects only', highlight: false }
              ]}
              current={currentTier === 'free'}
              recommended={false}
              onSelect={() => {}}
              disabled={true}
              buttonText="Current Plan"
              color="from-slate-600 to-slate-700"
              tier="free"
            />

            {/* Starter Plan */}
            <PlanCard
              name="Starter"
              price={billingCycle === 'monthly' ? '₹2,499' : '₹1,999'}
              priceUsd={billingCycle === 'monthly' ? '$30' : '$24'}
              period={billingCycle === 'monthly' ? '/month' : '/month'}
              originalPrice={billingCycle === 'annual' ? '₹2,499' : null}
              icon={<Rocket className="w-6 h-6" />}
              description="Best for indie developers and small teams"
              features={[
                { text: '100 builds per month', highlight: true },
                { text: 'Full code generation', highlight: false },
                { text: 'Automated QA testing', highlight: false },
                { text: 'Deployment guides', highlight: false },
                { text: 'Email support (24h response)', highlight: false },
                { text: 'Download source code', highlight: false },
                { text: 'Version control integration', highlight: false }
              ]}
              current={currentTier === 'starter'}
              recommended={true}
              onSelect={() => handleUpgrade({ id: 'starter', name: 'Starter' })}
              loading={loading && selectedPlan === 'starter'}
              disabled={currentTier === 'premium'}
              color="from-blue-600 to-indigo-600"
              tier="starter"
            />

            {/* Premium Plan */}
            <PlanCard
              name="Premium"
              price={billingCycle === 'monthly' ? '₹8,299' : '₹6,639'}
              priceUsd={billingCycle === 'monthly' ? '$100' : '$80'}
              period={billingCycle === 'monthly' ? '/month' : '/month'}
              originalPrice={billingCycle === 'annual' ? '₹8,299' : null}
              icon={<Crown className="w-6 h-6" />}
              description="For professionals and scaling businesses"
              features={[
                { text: 'Unlimited builds', highlight: true },
                { text: 'Priority AI models (GPT-4, Claude)', highlight: true },
                { text: 'Live app monitoring & analytics', highlight: false },
                { text: 'Priority support (2h response)', highlight: false },
                { text: 'Full API access', highlight: false },
                { text: 'White-label customization', highlight: false },
                { text: 'Custom integrations', highlight: false },
                { text: 'Dedicated account manager', highlight: true }
              ]}
              current={currentTier === 'premium'}
              recommended={false}
              onSelect={() => handleUpgrade({ id: 'premium', name: 'Premium' })}
              loading={loading && selectedPlan === 'premium'}
              premium={true}
              color="from-purple-600 via-pink-600 to-purple-600"
              tier="premium"
            />
          </div>

          {/* Feature Comparison Section */}
          <div className="mb-12 p-6 bg-slate-800/30 border border-slate-700/50 rounded-2xl backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Why Upgrade?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-4">
                  <TrendingUp className="w-7 h-7 text-purple-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">10x Faster Development</h4>
                <p className="text-sm text-slate-400">Build apps in hours, not weeks. Our AI handles the heavy lifting.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-blue-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Enterprise-Grade Quality</h4>
                <p className="text-sm text-slate-400">Production-ready code with built-in testing and security.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-emerald-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Expert Support</h4>
                <p className="text-sm text-slate-400">Get help from real developers who understand your challenges.</p>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="border-t border-slate-700/50 pt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mb-3">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-sm font-semibold text-white mb-1">Secure Payments</div>
                <div className="text-xs text-slate-500">256-bit SSL encryption</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-3">
                  <Award className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-sm font-semibold text-white mb-1">Razorpay Protected</div>
                <div className="text-xs text-slate-500">Trusted payment gateway</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-3">
                  <Star className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-sm font-semibold text-white mb-1">Cancel Anytime</div>
                <div className="text-xs text-slate-500">No questions asked</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-pink-400" />
                </div>
                <div className="text-sm font-semibold text-white mb-1">10K+ Users</div>
                <div className="text-xs text-slate-500">Join our community</div>
              </div>
            </div>
          </div>

          {/* Money Back Guarantee */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400">
              <span className="text-emerald-400 font-semibold">30-day money-back guarantee.</span> Not satisfied? Get a full refund, no questions asked.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCard({ 
  name, 
  price, 
  priceUsd, 
  period, 
  originalPrice,
  icon, 
  description,
  features, 
  current, 
  recommended, 
  onSelect, 
  loading, 
  disabled,
  premium,
  buttonText,
  color,
  tier
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative rounded-2xl p-8 transition-all duration-300 ${
        premium 
          ? 'bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-purple-600/10 border-2 border-purple-500/40 scale-[1.02] shadow-2xl shadow-purple-500/20' 
          : current
          ? 'bg-slate-800/50 border-2 border-emerald-500/40 shadow-xl shadow-emerald-500/10'
          : 'bg-slate-800/40 border-2 border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/60'
      } ${isHovered && !current && !disabled ? 'scale-[1.02] shadow-xl' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Recommended Badge */}
      {recommended && !current && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-blue-400/30">
            <Star className="w-3 h-3 fill-current" />
            MOST POPULAR
          </div>
        </div>
      )}

      {/* Current Badge */}
      {current && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-emerald-400/30">
            <Check className="w-3 h-3" />
            CURRENT PLAN
          </div>
        </div>
      )}

      {/* Icon */}
      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 bg-gradient-to-br ${color} shadow-lg`}>
        <div className="text-white">
          {icon}
        </div>
      </div>

      {/* Name & Description */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>

      {/* Price */}
      <div className="mb-8">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-4xl font-bold text-white">{price}</span>
          <span className="text-slate-500 text-base font-medium">{period}</span>
        </div>
        <div className="flex items-center gap-2">
          {originalPrice && (
            <span className="text-sm text-slate-500 line-through">{originalPrice}</span>
          )}
          <span className="text-sm text-slate-400">{priceUsd} USD</span>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3.5 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-slate-300 text-sm group">
            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
              feature.highlight 
                ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30' 
                : 'bg-slate-700/50 border border-slate-600/50'
            }`}>
              <Check className={`w-3 h-3 ${feature.highlight ? 'text-purple-400' : 'text-emerald-400'}`} />
            </div>
            <span className={`${feature.highlight ? 'text-white font-medium' : ''}`}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* Button */}
      <button
        onClick={onSelect}
        disabled={disabled || loading || current}
        className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-base shadow-lg ${
          current
            ? 'bg-emerald-500/20 text-emerald-300 cursor-not-allowed border-2 border-emerald-500/30'
            : disabled
            ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed border-2 border-slate-600/30'
            : premium
            ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white border-2 border-purple-400/30 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-2 border-blue-400/30 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5'
        }`}
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : current ? (
          <>
            <Check className="w-5 h-5" />
            <span>Active Plan</span>
          </>
        ) : disabled ? (
          <span>Downgrade Not Available</span>
        ) : (
          <>
            <span>{buttonText || 'Upgrade Now'}</span>
            <Sparkles className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Additional Info */}
      {!current && !disabled && (
        <p className="text-center text-xs text-slate-500 mt-4">
          {tier === 'free' ? 'No credit card required' : 'Instant activation • Cancel anytime'}
        </p>
      )}
    </div>
  );
}

export default PricingModal;