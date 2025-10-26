import React, { useState, useEffect } from 'react';
import { X, Check, Crown, Zap, Loader, Sparkles } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function PricingModal({ isOpen, onClose, currentTier, onUpgradeSuccess }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/payments/plans`);
      setPlans(response.data.plans);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const handleUpgrade = async (plan) => {
    setLoading(true);
    setSelectedPlan(plan.id);

    try {
      const orderResponse = await axios.post(`${API_URL}/api/payments/create-order`, {
        plan: plan.id
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const { order, razorpay_key } = orderResponse.data;

      const options = {
        key: razorpay_key,
        amount: order.amount,
        currency: order.currency,
        name: 'Launch AI',
        description: `${plan.name} Plan Subscription`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyResponse = await axios.post(
              `${API_URL}/api/payments/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: plan.id
              },
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              }
            );

            if (verifyResponse.data.success) {
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
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full p-8 relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">
            Choose Your Plan
          </h2>
          <p className="text-slate-400">
            Unlock unlimited AI-powered app building
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {/* Free Plan */}
          <PlanCard
            name="Free"
            price="₹0"
            priceUsd="$0"
            period="/forever"
            icon={<Zap className="w-6 h-6" />}
            features={[
              '3 app builds',
              'Market research',
              'Basic code generation',
              'Community support'
            ]}
            current={currentTier === 'free'}
            recommended={false}
            onSelect={() => {}}
            disabled={true}
            buttonText="Current Plan"
            color="from-slate-600 to-slate-700"
          />

          {/* Starter Plan */}
          <PlanCard
            name="Starter"
            price="₹2,499"
            priceUsd="$30"
            period="/month"
            icon={<Sparkles className="w-6 h-6" />}
            features={[
              '100 builds/month',
              'Full code generation',
              'QA testing included',
              'Deployment guides',
              'Email support',
              'Download source code'
            ]}
            current={currentTier === 'starter'}
            recommended={true}
            onSelect={() => handleUpgrade(plans.find(p => p.id === 'starter'))}
            loading={loading && selectedPlan === 'starter'}
            disabled={currentTier === 'premium'}
            color="from-blue-600 to-indigo-600"
          />

          {/* Premium Plan */}
          <PlanCard
            name="Premium"
            price="₹8,299"
            priceUsd="$100"
            period="/month"
            icon={<Crown className="w-6 h-6" />}
            features={[
              'Unlimited builds',
              'Priority AI models',
              'Live app monitoring',
              'Priority support',
              'API access',
              'White-label option',
              'Custom integrations'
            ]}
            current={currentTier === 'premium'}
            recommended={false}
            onSelect={() => handleUpgrade(plans.find(p => p.id === 'premium'))}
            loading={loading && selectedPlan === 'premium'}
            premium={true}
            color="from-purple-600 to-pink-600"
          />
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-3 gap-4 text-center text-xs text-slate-500">
          <div>
            <div className="text-xl mb-1">🔒</div>
            <div>Secure Payment</div>
          </div>
          <div>
            <div className="text-xl mb-1">💳</div>
            <div>Razorpay Protected</div>
          </div>
          <div>
            <div className="text-xl mb-1">↩️</div>
            <div>Cancel Anytime</div>
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
  icon, 
  features, 
  current, 
  recommended, 
  onSelect, 
  loading, 
  disabled,
  premium,
  buttonText,
  color
}) {
  return (
    <div className={`relative rounded-xl p-6 transition-all ${
      premium 
        ? 'bg-gradient-to-br from-purple-600/10 to-pink-600/10 border-2 border-purple-500/30 scale-105' 
        : current
        ? 'bg-slate-800/50 border-2 border-emerald-500/30'
        : 'bg-slate-800/30 border border-slate-700 hover:border-slate-600'
    }`}>
      {recommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          MOST POPULAR
        </div>
      )}

      {current && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          CURRENT PLAN
        </div>
      )}

      {/* Icon */}
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 bg-gradient-to-br ${color}`}>
        {icon}
      </div>

      {/* Name */}
      <h3 className="text-xl font-bold text-white mb-2">{name}</h3>

      {/* Price */}
      <div className="mb-5">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">{price}</span>
          <span className="text-slate-500 text-sm">{period}</span>
        </div>
        <div className="text-xs text-slate-500 mt-1">{priceUsd} USD</div>
      </div>

      {/* Features */}
      <ul className="space-y-2.5 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-slate-300 text-sm">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* Button */}
      <button
        onClick={onSelect}
        disabled={disabled || loading || current}
        className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
          current
            ? 'bg-emerald-500/20 text-emerald-300 cursor-not-allowed'
            : disabled
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
            : premium
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
        }`}
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : current ? (
          <span>✓ Active</span>
        ) : disabled ? (
          <span>Downgrade Not Available</span>
        ) : (
          <span>{buttonText || 'Upgrade Now'}</span>
        )}
      </button>
    </div>
  );
}

export default PricingModal;