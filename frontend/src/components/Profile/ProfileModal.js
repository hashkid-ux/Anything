// src/components/Profile/ProfileModal.js
// PRODUCTION-READY - No overflow, fully responsive

import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Crown, Github, CheckCircle, Activity, TrendingUp, Download, DollarSign, Loader2 } from 'lucide-react';
import axios from 'axios';
import ModalWrapper from '../ModalWrapper';

function ProfileModal({ isOpen, onClose, user }) {
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profileRes, analyticsRes, billingRes] = await Promise.all([
        axios.get('/api/profile'),
        axios.get('/api/profile/analytics?days=30'),
        axios.get('/api/profile/billing')
      ]);

      setProfile(profileRes.data.profile);
      setAnalytics(analyticsRes.data.analytics);
      setBilling(billingRes.data.billing);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierConfig = (tier) => {
    const configs = {
      free: { icon: User, color: 'from-slate-600 to-slate-700', label: 'Free', textColor: 'text-slate-400' },
      starter: { icon: TrendingUp, color: 'from-blue-600 to-indigo-600', label: 'Starter', textColor: 'text-blue-400' },
      premium: { icon: Crown, color: 'from-purple-600 to-pink-600', label: 'Premium', textColor: 'text-purple-400' }
    };
    return configs[tier] || configs.free;
  };

  const tierConfig = getTierConfig(profile?.tier);
  const TierIcon = tierConfig.icon;

  return (
    <ModalWrapper 
      isOpen={isOpen} 
      onClose={onClose}
      maxWidth="max-w-4xl"
    >
      {/* Header with Avatar - FIXED: Now responsive */}
      <div className="p-4 sm:p-6 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Avatar */}
          {profile?.avatar ? (
            <img 
              src={profile.avatar} 
              alt={profile.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          )}
          
          {/* Info - FIXED: Breaks properly on mobile */}
          <div className="flex-1 min-w-0 w-full">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 break-words">{profile?.name}</h2>
            <p className="text-slate-400 text-sm break-all">{profile?.email}</p>
            
            {/* Badges - FIXED: Stack on mobile */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <div className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${tierConfig.color} px-3 py-1.5 rounded-lg`}>
                <TierIcon className="w-3.5 h-3.5 text-white flex-shrink-0" />
                <span className="text-white font-bold text-xs whitespace-nowrap">{tierConfig.label}</span>
              </div>
              {profile?.emailVerified && (
                <div className="inline-flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 px-3 py-1.5 rounded-lg">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  <span className="text-green-300 font-medium text-xs whitespace-nowrap">Verified</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - FIXED: Horizontal scroll on mobile */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-800 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            Overview
          </TabButton>
          <TabButton active={activeTab === 'activity'} onClick={() => setActiveTab('activity')}>
            Activity
          </TabButton>
          <TabButton active={activeTab === 'billing'} onClick={() => setActiveTab('billing')}>
            Billing
          </TabButton>
        </div>
      </div>

      {/* Content - FIXED: Scrollable with proper padding */}
      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid - FIXED: Responsive columns */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <StatCard
                    icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
                    label="Total Projects"
                    value={profile?.stats?.totalProjects || 0}
                    color="from-blue-500 to-indigo-600"
                  />
                  <StatCard
                    icon={<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
                    label="Completed"
                    value={profile?.stats?.completedProjects || 0}
                    color="from-green-500 to-emerald-600"
                  />
                  <StatCard
                    icon={<Download className="w-4 h-4 sm:w-5 sm:h-5" />}
                    label="Credits"
                    value={profile?.credits || 0}
                    color="from-purple-500 to-pink-600"
                  />
                  <StatCard
                    icon={<DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />}
                    label="Spent"
                    value={`₹${(profile?.stats?.totalRevenue || 0).toLocaleString()}`}
                    color="from-orange-500 to-red-600"
                  />
                </div>

                {/* Account Info - FIXED: Responsive text */}
                <div className="bg-slate-800/30 rounded-xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Account Information</h3>
                  <div className="space-y-3">
                    <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={profile?.email} />
                    <InfoRow icon={<Calendar className="w-4 h-4" />} label="Member Since" value={new Date(profile?.createdAt).toLocaleDateString()} />
                    <InfoRow icon={<Activity className="w-4 h-4" />} label="Last Login" value={profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleDateString() : 'N/A'} />
                    {profile?.provider && (
                      <InfoRow icon={<User className="w-4 h-4" />} label="Login Method" value={profile.provider.charAt(0).toUpperCase() + profile.provider.slice(1)} />
                    )}
                  </div>
                </div>

                {/* Linked Accounts - FIXED: Mobile friendly */}
                <div className="bg-slate-800/30 rounded-xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Linked Accounts</h3>
                  <div className="space-y-3">
                    <LinkedAccountRow
                      provider="Google"
                      connected={!!profile?.googleId}
                      icon="🔵"
                    />
                    <LinkedAccountRow
                      provider="GitHub"
                      connected={!!profile?.githubId}
                      username={profile?.githubUsername}
                      icon={<Github className="w-5 h-5" />}
                    />
                  </div>
                </div>

                {/* Subscription Info */}
                {profile?.subscriptionStatus && (
                  <div className="bg-slate-800/30 rounded-xl p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Subscription</h3>
                    <div className="space-y-3">
                      <InfoRow icon={<Crown className="w-4 h-4" />} label="Plan" value={tierConfig.label} />
                      <InfoRow icon={<CheckCircle className="w-4 h-4" />} label="Status" value={profile.subscriptionStatus} />
                      {profile.subscriptionEnd && (
                        <InfoRow icon={<Calendar className="w-4 h-4" />} label="Renews On" value={new Date(profile.subscriptionEnd).toLocaleDateString()} />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6">
                {/* Analytics - FIXED: Responsive grid */}
                {analytics && (
                  <div className="bg-slate-800/30 rounded-xl p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Last 30 Days</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                      <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold text-white">{analytics.totals.buildsStarted}</div>
                        <div className="text-[10px] sm:text-xs text-slate-400 mt-1">Builds Started</div>
                      </div>
                      <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold text-green-400">{analytics.totals.buildsCompleted}</div>
                        <div className="text-[10px] sm:text-xs text-slate-400 mt-1">Completed</div>
                      </div>
                      <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold text-red-400">{analytics.totals.buildsFailed}</div>
                        <div className="text-[10px] sm:text-xs text-slate-400 mt-1">Failed</div>
                      </div>
                      <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold text-purple-400">{analytics.successRate}%</div>
                        <div className="text-[10px] sm:text-xs text-slate-400 mt-1">Success Rate</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                <div className="bg-slate-800/30 rounded-xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Recent Activity</h3>
                  {profile?.recentActivity && profile.recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {profile.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3 py-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm break-words">{activity.description}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{new Date(activity.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No recent activity</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
                {/* Billing Summary - FIXED: Responsive cards */}
                <div className="bg-slate-800/30 rounded-xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Billing Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <div className="text-xs sm:text-sm text-slate-400 mb-1">Total Spent</div>
                      <div className="text-xl sm:text-2xl font-bold text-white break-words">
                        ₹{(billing?.totalSpent || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <div className="text-xs sm:text-sm text-slate-400 mb-1">Total Payments</div>
                      <div className="text-xl sm:text-2xl font-bold text-white">
                        {billing?.payments?.length || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment History */}
                <div className="bg-slate-800/30 rounded-xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Payment History</h3>
                  {billing?.payments && billing.payments.length > 0 ? (
                    <div className="space-y-3">
                      {billing.payments.map((payment) => (
                        <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-slate-700 last:border-0">
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium text-sm break-words">{payment.plan}</div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {new Date(payment.date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-left sm:text-right flex-shrink-0">
                            <div className="text-white font-semibold text-sm">₹{payment.amount.toLocaleString()}</div>
                            <div className={`text-xs mt-0.5 ${
                              payment.status === 'captured' ? 'text-green-400' :
                              payment.status === 'failed' ? 'text-red-400' :
                              'text-yellow-400'
                            }`}>
                              {payment.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No payment history</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ModalWrapper>
  );
}

// Supporting Components
function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap
        min-w-[80px] touch-manipulation
        ${active
          ? 'bg-purple-600 text-white'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }
      `}
    >
      {children}
    </button>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-slate-800/30 rounded-xl p-3 sm:p-4">
      <div className={`inline-flex p-2 bg-gradient-to-br ${color} rounded-lg mb-2`}>
        {icon}
      </div>
      <div className="text-xl sm:text-2xl font-bold text-white mb-1 break-words">{value}</div>
      <div className="text-[10px] sm:text-xs text-slate-400">{label}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2">
      <div className="flex items-center gap-2 text-slate-400">
        <span className="flex-shrink-0">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-white font-medium text-sm break-words sm:text-right">{value}</span>
    </div>
  );
}

function LinkedAccountRow({ provider, connected, icon, username }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
          {typeof icon === 'string' ? <span>{icon}</span> : icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-medium break-words">{provider}</div>
          {username && <div className="text-xs text-slate-400 truncate">{username}</div>}
        </div>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
        connected
          ? 'bg-green-500/20 text-green-300'
          : 'bg-slate-700 text-slate-400'
      }`}>
        {connected ? 'Connected' : 'Not Connected'}
      </div>
    </div>
  );
}

export default ProfileModal;