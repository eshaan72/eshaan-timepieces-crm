import { useEffect, useState } from 'react';
import { KeyRound, Settings as SettingsIcon, ShieldCheck, UserCog, Info } from 'lucide-react';
import api from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

const appVersion = '1.0.0';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState({ lowStockThreshold: '5', companyName: 'Eshaan Timepieces', currency: 'USD' });
  const [users, setUsers] = useState([]);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingUser, setSavingUser] = useState('');
  const [message, setMessage] = useState('');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (authLoading) return;

    async function loadSettings() {
      try {
        setSettingsLoading(true);
        const res = await api.get('/settings');
        setSettings({
          lowStockThreshold: res.data.lowStockThreshold ?? '5',
          companyName: res.data.companyName ?? 'Eshaan Timepieces',
          currency: res.data.currency ?? 'USD',
        });
      } catch (error) {
        setMessage(error.response?.data?.error || 'Unable to load settings.');
      } finally {
        setSettingsLoading(false);
      }
    }

    async function loadUsers() {
      if (!isAdmin) return;
      try {
        setUsersLoading(true);
        const res = await api.get('/users/all');
        setUsers(res.data.items || []);
      } catch (error) {
        setMessage(error.response?.data?.error || 'Unable to load users.');
      } finally {
        setUsersLoading(false);
      }
    }

    loadSettings();
    loadUsers();
  }, [authLoading, isAdmin]);

  async function handleSettingsSubmit(event) {
    event.preventDefault();

    if (!isAdmin) {
      setMessage('Only admins can update app settings.');
      return;
    }

    try {
      setSavingSettings(true);
      const res = await api.patch('/settings', {
        lowStockThreshold: settings.lowStockThreshold,
        companyName: settings.companyName,
        currency: settings.currency,
      });

      setSettings({
        lowStockThreshold: res.data.lowStockThreshold ?? settings.lowStockThreshold,
        companyName: res.data.companyName ?? settings.companyName,
        currency: res.data.currency ?? settings.currency,
      });
      setMessage('Settings updated successfully.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Unable to save settings.');
    } finally {
      setSavingSettings(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('New passwords do not match.');
      return;
    }

    try {
      setSavingPassword(true);
      await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('Password updated successfully.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Unable to change password.');
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleUserUpdate(userId, updates) {
    try {
      setSavingUser(userId);
      await api.patch(`/users/${userId}`, updates);
      setUsers((current) => current.map((item) => (item.id === userId ? { ...item, ...updates } : item)));
      setMessage('User updated successfully.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Unable to update user.');
    } finally {
      setSavingUser('');
    }
  }

  return (
    <div className="min-h-screen bg-[#09090B] flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <SettingsIcon size={20} />
            </div>
            <div>
              <h1 className="text-white text-2xl font-semibold">Settings</h1>
              <p className="text-white/50 text-sm">Manage account access, security, and CRM preferences.</p>
            </div>
          </div>

          {message ? (
            <div className="mb-6 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              {message}
            </div>
          ) : null}

          {authLoading ? (
            <p className="text-white/40">Loading your account...</p>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6">
                <Card className="bg-[#111111] border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-base flex items-center gap-2">
                      <UserCog size={18} className="text-blue-400" />
                      Your account
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-white/70">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wide">Name</p>
                        <p className="text-white mt-1">{user?.name || '—'}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wide">Email</p>
                        <p className="text-white mt-1">{user?.email || '—'}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wide">Role</p>
                        <p className="text-white mt-1">{user?.role || '—'}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wide">Contact access</p>
                        <p className="text-white mt-1">{user?.contactAccess || '—'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#111111] border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-base flex items-center gap-2">
                      <KeyRound size={18} className="text-green-400" />
                      Change password
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white/70">Current password</Label>
                        <Input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
                          className="bg-[#1A1A1A] border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/70">New password</Label>
                        <Input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
                          className="bg-[#1A1A1A] border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/70">Confirm new password</Label>
                        <Input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
                          className="bg-[#1A1A1A] border-white/10 text-white"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={savingPassword}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-500 disabled:opacity-50"
                      >
                        {savingPassword ? 'Updating...' : 'Update password'}
                      </button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-[#111111] border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-base flex items-center gap-2">
                      <ShieldCheck size={18} className="text-amber-400" />
                      App settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {settingsLoading ? (
                      <p className="text-white/40">Loading app settings...</p>
                    ) : (
                      <form onSubmit={handleSettingsSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-white/70">Store name</Label>
                          <Input
                            value={settings.companyName}
                            onChange={(event) => setSettings({ ...settings, companyName: event.target.value })}
                            disabled={!isAdmin}
                            className="bg-[#1A1A1A] border-white/10 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white/70">Currency</Label>
                          <Input
                            value={settings.currency}
                            onChange={(event) => setSettings({ ...settings, currency: event.target.value })}
                            disabled={!isAdmin}
                            className="bg-[#1A1A1A] border-white/10 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white/70">Low stock threshold</Label>
                          <Input
                            type="number"
                            min="0"
                            value={settings.lowStockThreshold}
                            onChange={(event) => setSettings({ ...settings, lowStockThreshold: event.target.value })}
                            disabled={!isAdmin}
                            className="bg-[#1A1A1A] border-white/10 text-white"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={!isAdmin || savingSettings}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
                        >
                          {savingSettings ? 'Saving...' : 'Save settings'}
                        </button>
                      </form>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-[#111111] border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-base flex items-center gap-2">
                      <Info size={18} className="text-purple-400" />
                      App info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-white/70">
                    <p>Version: {appVersion}</p>
                    <p>Role-based masking is enforced on the backend for customer contact details and cost prices.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {isAdmin ? (
            <Card className="mt-6 bg-[#111111] border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-base">Staff management</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <p className="text-white/40">Loading staff accounts...</p>
                ) : users.length === 0 ? (
                  <p className="text-white/40">No staff accounts found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-white/70">
                      <thead>
                        <tr className="border-b border-white/10 text-white/40">
                          <th className="py-3 pr-4">Name</th>
                          <th className="py-3 pr-4">Email</th>
                          <th className="py-3 pr-4">Role</th>
                          <th className="py-3 pr-4">Status</th>
                          <th className="py-3 pr-4">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((item) => (
                          <tr key={item.id} className="border-b border-white/5 last:border-0">
                            <td className="py-3 pr-4">{item.name}</td>
                            <td className="py-3 pr-4">{item.email}</td>
                            <td className="py-3 pr-4">
                              <select
                                value={item.role}
                                onChange={(event) => setUsers((current) => current.map((entry) => entry.id === item.id ? { ...entry, role: event.target.value } : entry))}
                                className="rounded border border-white/10 bg-[#1A1A1A] px-2 py-1 text-white"
                              >
                                <option value="ADMIN">ADMIN</option>
                                <option value="SALES">SALES</option>
                                <option value="ONLY_VIEW">ONLY_VIEW</option>
                              </select>
                            </td>
                            <td className="py-3 pr-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={item.isActive}
                                  onChange={(event) => setUsers((current) => current.map((entry) => entry.id === item.id ? { ...entry, isActive: event.target.checked } : entry))}
                                />
                                <span>{item.isActive ? 'Active' : 'Inactive'}</span>
                              </label>
                            </td>
                            <td className="py-3 pr-4">
                              <button
                                type="button"
                                onClick={() => handleUserUpdate(item.id, { role: item.role, isActive: item.isActive })}
                                disabled={savingUser === item.id}
                                className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white transition hover:bg-white/20 disabled:opacity-50"
                              >
                                {savingUser === item.id ? 'Saving...' : 'Save'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>
    </div>
  );
}
