import React, { useState, useEffect } from 'react';
import { X, User, Mail, Calendar, Crown, Github, CheckCircle, Activity, TrendingUp, Download, DollarSign, Loader2 } from 'lucide-react';
import axios from 'axios';

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

  if (!isOpen) return null;

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
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl my-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {profile?.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt={profile.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{profile?.name}</h2>
                <p className="text-slate-400 text-sm">{profile?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${tierConfig.color} px-3 py-1 rounded-lg`}>
                    <TierIcon className="w-3.5 h-3.5 text-white" />
                    <span className="text-white font-bold text-xs">{tierConfig.label}</span>
                  </div>
                  {profile?.emailVerified && (
                    <div className="inline-flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 px-3 py-1 rounded-lg">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-300 font-medium text-xs">Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4 border-b border-slate-800 flex gap-2 overflow-x-auto">
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

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                      icon={<TrendingUp className="w-5 h-5" />}
                      label="Total Projects"
                      value={profile?.stats?.totalProjects || 0}
                      color="from-blue-500 to-indigo-600"
                    />
                    <StatCard
                      icon={<CheckCircle className="w-5 h-5" />}
                      label="Completed"
                      value={profile?.stats?.completedProjects || 0}
                      color="from-green-500 to-emerald-600"
                    />
                    <StatCard
                      icon={<Download className="w-5 h-5" />}
                      label="Credits"
                      value={profile?.credits || 0}
                      color="from-purple-500 to-pink-600"
                    />
                    <StatCard
                      icon={<DollarSign className="w-5 h-5" />}
                      label="Spent"
                      value={`₹${(profile?.stats?.totalRevenue || 0).toLocaleString()}`}
                      color="from-orange-500 to-red-600"
                    />
                  </div>

                  {/* Account Info */}
                  <div className="bg-slate-800/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
                    <div className="space-y-3">
                      <InfoRow icon={<Mail />} label="Email" value={profile?.email} />
                      <InfoRow icon={<Calendar />} label="Member Since" value={new Date(profile?.createdAt).toLocaleDateString()} />
                      <InfoRow icon={<Activity />} label="Last Login" value={profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleDateString() : 'N/A'} />
                      {profile?.provider && (
                        <InfoRow icon={<User />} label="Login Method" value={profile.provider.charAt(0).toUpperCase() + profile.provider.slice(1)} />
                      )}
                    </div>
                  </div>

                  {/* Linked Accounts */}
                  <div className="bg-slate-800/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Linked Accounts</h3>
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
                    <div className="bg-slate-800/30 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Subscription</h3>
                      <div className="space-y-3">
                        <InfoRow icon={<Crown />} label="Plan" value={tierConfig.label} />
                        <InfoRow icon={<CheckCircle />} label="Status" value={profile.subscriptionStatus} />
                        {profile.subscriptionEnd && (
                          <InfoRow icon={<Calendar />} label="Renews On" value={new Date(profile.subscriptionEnd).toLocaleDateString()} />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-6">
                  {/* Analytics Chart Data */}
                  {analytics && (
                    <div className="bg-slate-800/30 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Last 30 Days</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{analytics.totals.buildsStarted}</div>
                          <div className="text-xs text-slate-400">Builds Started</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{analytics.totals.buildsCompleted}</div>
                          <div className="text-xs text-slate-400">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-400">{analytics.totals.buildsFailed}</div>
                          <div className="text-xs text-slate-400">Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">{analytics.successRate}%</div>
                          <div className="text-xs text-slate-400">Success Rate</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Activity */}
                  <div className="bg-slate-800/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                    {profile?.recentActivity && profile.recentActivity.length > 0 ? (
                      <div className="space-y-3">
                        {profile.recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-center gap-3 py-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-white text-sm">{activity.description}</p>
                              <p className="text-xs text-slate-500">{new Date(activity.timestamp).toLocaleString()}</p>
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
                  {/* Billing Summary */}
                  <div className="bg-slate-800/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Billing Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Total Spent</div>
                        <div className="text-2xl font-bold text-white">
                          ₹{(billing?.totalSpent || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Total Payments</div>
                        <div className="text-2xl font-bold text-white">
                          {billing?.payments?.length || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment History */}
                  <div className="bg-slate-800/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Payment History</h3>
                    {billing?.payments && billing.payments.length > 0 ? (
                      <div className="space-y-3">
                        {billing.payments.map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
                            <div>
                              <div className="text-white font-medium">{payment.plan}</div>
                              <div className="text-xs text-slate-400">
                                {new Date(payment.date).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-semibold">₹{payment.amount.toLocaleString()}</div>
                              <div className={`text-xs ${
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
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
        active
          ? 'bg-purple-600 text-white'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-slate-800/30 rounded-xl p-4">
      <div className={`inline-flex p-2 bg-gradient-to-br ${color} rounded-lg mb-2`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-white font-medium text-sm">{value}</span>
    </div>
  );
}

function LinkedAccountRow({ provider, connected, icon, username }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
          {typeof icon === 'string' ? <span>{icon}</span> : icon}
        </div>
        <div>
          <div className="text-white text-sm font-medium">{provider}</div>
          {username && <div className="text-xs text-slate-400">{username}</div>}
        </div>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
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