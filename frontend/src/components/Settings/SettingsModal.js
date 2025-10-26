import React, { useState, useEffect } from 'react';
import { X, User, Bell, Lock, Shield, Trash2, Save, Loader2, Check, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

function SettingsModal({ isOpen, onClose, user, onUpdate }) {
  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Form states
  const [accountForm, setAccountForm] = useState({
    name: user?.name || '',
    avatar: user?.avatar || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrent: false,
    showNew: false
  });

  const [notifPrefs, setNotifPrefs] = useState({
    email: true,
    push: true,
    builds: true,
    payments: true,
    marketing: false
  });

  const [deleteForm, setDeleteForm] = useState({
    password: '',
    confirmText: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/settings');
      setSettings(response.data.settings);
      setAccountForm({
        name: response.data.settings.name,
        avatar: response.data.settings.avatar || ''
      });
      setNotifPrefs(response.data.settings.notifications);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveAccount = async () => {
    setSaving(true);
    try {
      const response = await axios.put('/api/settings/account', accountForm);
      showMessage('Account settings saved');
      onUpdate?.(response.data.user);
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('Passwords do not match', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage('Password must be at least 6 characters', 'error');
      return;
    }

    setSaving(true);
    try {
      await axios.post('/api/settings/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      showMessage('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrent: false,
        showNew: false
      });
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await axios.put('/api/settings/notifications', notifPrefs);
      showMessage('Notification preferences saved');
    } catch (error) {
      showMessage('Failed to save preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    
    if (deleteForm.confirmText !== 'DELETE MY ACCOUNT') {
      showMessage('Please type the confirmation text', 'error');
      return;
    }

    if (!window.confirm('This action cannot be undone. Are you absolutely sure?')) {
      return;
    }

    setSaving(true);
    try {
      await axios.delete('/api/settings/account', {
        data: {
          password: deleteForm.password,
          confirmText: deleteForm.confirmText
        }
      });
      
      localStorage.clear();
      window.location.href = '/';
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to delete account', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle }
  ];

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
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`mx-6 mt-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/30' 
              : 'bg-red-500/10 border border-red-500/30'
          }`}>
            {message.type === 'success' ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            )}
            <span className={message.type === 'success' ? 'text-green-300' : 'text-red-300'}>
              {message.text}
            </span>
          </div>
        )}

        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-64 p-6 border-b md:border-b-0 md:border-r border-slate-800">
            <div className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
            ) : (
              <>
                {/* Account Tab */}
                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={accountForm.name}
                            onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={settings?.email}
                            disabled
                            className="w-full bg-slate-800/30 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-500 cursor-not-allowed"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Email cannot be changed. Contact support if needed.
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-2">
                            Avatar URL (optional)
                          </label>
                          <input
                            type="url"
                            value={accountForm.avatar}
                            onChange={(e) => setAccountForm({ ...accountForm, avatar: e.target.value })}
                            placeholder="https://example.com/avatar.jpg"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
                          />
                        </div>

                        {accountForm.avatar && (
                          <div className="flex items-center gap-3">
                            <img 
                              src={accountForm.avatar} 
                              alt="Avatar preview"
                              className="w-16 h-16 rounded-xl object-cover"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                            <span className="text-sm text-slate-400">Avatar Preview</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleSaveAccount}
                      disabled={saving}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Notification Preferences</h3>
                      <p className="text-sm text-slate-400 mb-6">Choose how you want to be notified</p>

                      <div className="space-y-4">
                        <ToggleOption
                          label="Email Notifications"
                          description="Receive notifications via email"
                          checked={notifPrefs.email}
                          onChange={(checked) => setNotifPrefs({ ...notifPrefs, email: checked })}
                        />
                        <ToggleOption
                          label="Push Notifications"
                          description="Browser push notifications (when available)"
                          checked={notifPrefs.push}
                          onChange={(checked) => setNotifPrefs({ ...notifPrefs, push: checked })}
                        />
                        <ToggleOption
                          label="Build Updates"
                          description="Notify when builds complete"
                          checked={notifPrefs.builds}
                          onChange={(checked) => setNotifPrefs({ ...notifPrefs, builds: checked })}
                        />
                        <ToggleOption
                          label="Payment Updates"
                          description="Notify about payments and billing"
                          checked={notifPrefs.payments}
                          onChange={(checked) => setNotifPrefs({ ...notifPrefs, payments: checked })}
                        />
                        <ToggleOption
                          label="Marketing Emails"
                          description="Product updates and tips"
                          checked={notifPrefs.marketing}
                          onChange={(checked) => setNotifPrefs({ ...notifPrefs, marketing: checked })}
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSaveNotifications}
                      disabled={saving}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Preferences
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Change Password</h3>
                      <p className="text-sm text-slate-400 mb-6">
                        {settings?.provider === 'google' || settings?.provider === 'github'
                          ? 'You\'re using OAuth login. Password change is not available.'
                          : 'Update your password to keep your account secure'}
                      </p>

                      {settings?.provider === 'email' && (
                        <form onSubmit={handleChangePassword} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                              Current Password
                            </label>
                            <div className="relative">
                              <input
                                type={passwordForm.showCurrent ? 'text' : 'password'}
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                required
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 pr-12 text-white focus:outline-none focus:border-purple-500 transition-colors"
                              />
                              <button
                                type="button"
                                onClick={() => setPasswordForm({ ...passwordForm, showCurrent: !passwordForm.showCurrent })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                              >
                                {passwordForm.showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                              New Password
                            </label>
                            <div className="relative">
                              <input
                                type={passwordForm.showNew ? 'text' : 'password'}
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                required
                                minLength={6}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 pr-12 text-white focus:outline-none focus:border-purple-500 transition-colors"
                              />
                              <button
                                type="button"
                                onClick={() => setPasswordForm({ ...passwordForm, showNew: !passwordForm.showNew })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                              >
                                {passwordForm.showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                              required
                              minLength={6}
                              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                          >
                            {saving ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Changing...
                              </>
                            ) : (
                              <>
                                <Lock className="w-4 h-4" />
                                Change Password
                              </>
                            )}
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Linked Accounts */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Linked Accounts</h3>
                      <div className="space-y-3">
                        <LinkedAccount
                          provider="Google"
                          connected={!!settings?.googleId}
                          email={settings?.email}
                        />
                        <LinkedAccount
                          provider="GitHub"
                          connected={!!settings?.githubId}
                          username={settings?.githubUsername}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Danger Zone Tab */}
                {activeTab === 'danger' && (
                  <div className="space-y-6">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        Delete Account
                      </h3>
                      <p className="text-sm text-slate-400 mb-6">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>

                      <form onSubmit={handleDeleteAccount} className="space-y-4">
                        {settings?.provider === 'email' && (
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                              Confirm Password
                            </label>
                            <input
                              type="password"
                              value={deleteForm.password}
                              onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })}
                              required
                              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500 transition-colors"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-2">
                            Type "DELETE MY ACCOUNT" to confirm
                          </label>
                          <input
                            type="text"
                            value={deleteForm.confirmText}
                            onChange={(e) => setDeleteForm({ ...deleteForm, confirmText: e.target.value })}
                            required
                            placeholder="DELETE MY ACCOUNT"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500 transition-colors font-mono"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={saving || deleteForm.confirmText !== 'DELETE MY ACCOUNT'}
                          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              Delete My Account
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleOption({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-white font-medium">{label}</div>
        <div className="text-sm text-slate-400">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-purple-600' : 'bg-slate-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function LinkedAccount({ provider, connected, email, username }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
          <span className="text-lg">{provider === 'Google' ? '🔵' : '⚫'}</span>
        </div>
        <div>
          <div className="text-white font-medium">{provider}</div>
          <div className="text-xs text-slate-400">
            {connected ? (email || username || 'Connected') : 'Not connected'}
          </div>
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

export default SettingsModal;