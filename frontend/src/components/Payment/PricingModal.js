import React, { useState, useEffect } from 'react';
import { X, Check, Crown, Zap, Loader } from 'lucide-react';
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
      // Step 1: Create Razorpay order
      const orderResponse = await axios.post(`${API_URL}/api/payments/create-order`, {
        plan: plan.id
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const { order, razorpay_key } = orderResponse.data;

      // Step 2: Open Razorpay checkout
      const options = {
        key: razorpay_key,
        amount: order.amount,
        currency: order.currency,
        name: 'Launch AI',
        description: `${plan.name} Plan Subscription`,
        order_id: order.id,
        handler: async function (response) {
          // Step 3: Verify payment
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
              // Update user tier locally
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
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-white/20 rounded-2xl max-w-5xl w-full p-8 relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Choose Your Plan
          </h2>
          <p className="text-gray-400 text-lg">
            Upgrade to unlock unlimited app building power
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <PlanCard
            name="Free"
            price="₹0"
            priceUsd="$0"
            period="/forever"
            icon={<Zap className="w-8 h-8" />}
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
          />

          {/* Starter Plan */}
          <PlanCard
            name="Starter"
            price="₹2,499"
            priceUsd="$30"
            period="/month"
            icon={<Zap className="w-8 h-8" />}
            features={[
              '100 builds/month',
              'Full code generation',
              'QA testing',
              'Deployment guides',
              'Email support',
              'Download source code'
            ]}
            current={currentTier === 'starter'}
            recommended={true}
            onSelect={() => handleUpgrade(plans.find(p => p.id === 'starter'))}
            loading={loading && selectedPlan === 'starter'}
            disabled={currentTier === 'premium'}
          />

          {/* Premium Plan */}
          <PlanCard
            name="Premium"
            price="₹8,299"
            priceUsd="$100"
            period="/month"
            icon={<Crown className="w-8 h-8" />}
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
          />
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-center text-sm text-gray-400">
          <div>
            <div className="text-2xl font-bold text-white mb-1">🔒</div>
            <div>Secure Payment</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">💳</div>
            <div>Razorpay Protected</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">↩️</div>
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
  buttonText 
}) {
  return (
    <div className={`relative rounded-2xl p-6 transition-all ${
      premium 
        ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-2 border-purple-500/50 scale-105' 
        : current
        ? 'bg-white/10 border-2 border-green-500/50'
        : 'bg-white/5 border-2 border-white/10 hover:border-white/30'
    }`}>
      {recommended && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">
          MOST POPULAR
        </div>
      )}

      {current && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full">
          CURRENT PLAN
        </div>
      )}

      {/* Icon */}
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
        premium ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gradient-to-br from-blue-600 to-purple-600'
      }`}>
        {icon}
      </div>

      {/* Name */}
      <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white">{price}</span>
          <span className="text-gray-400">{period}</span>
        </div>
        <div className="text-sm text-gray-400 mt-1">{priceUsd} USD</div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* Button */}
      <button
        onClick={onSelect}
        disabled={disabled || loading || current}
        className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
          current
            ? 'bg-green-500/20 text-green-300 cursor-not-allowed'
            : disabled
            ? 'bg-white/10 text-gray-500 cursor-not-allowed'
            : premium
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
        }`}
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
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