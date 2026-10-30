import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Save, Check, AlertCircle, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { studentApi, paymentApi } from '../../services/api';
import PayStageDialog from '../../components/PayStageDialog';
import { STAGE_INFO, formatDate, naira, stageKeyFromNumber } from '../../utils/stages';

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [renewOpen, setRenewOpen] = useState(false);
  const [payFishOpen, setPayFishOpen] = useState(false);
  const onTrial = user?.subscription === 'trial' && !!user.trialEndsAt && new Date(user.trialEndsAt) > new Date();
  const [turningOff, setTurningOff] = useState(false);
  const [planMsg, setPlanMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const stageKey = stageKeyFromNumber(user?.stage ?? 0);
  const stage = stageKey ? STAGE_INFO[stageKey] : null;

  const turnOffAutoRenew = async () => {
    setPlanMsg(null);
    setTurningOff(true);
    try {
      const res = await paymentApi.turnOffAutoRenew();
      await refreshUser();
      setPlanMsg({ type: 'success', text: res.message });
    } catch (err) {
      setPlanMsg({ type: 'error', text: err instanceof Error ? err.message : 'Could not turn off automatic renewal' });
    } finally {
      setTurningOff(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileSaving(true);
    try {
      await studentApi.updateProfile({ name, phone });
      await refreshUser();
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (newPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    setPwSaving(true);
    try {
      await studentApi.changePassword(currentPassword, newPassword);
      setPwMsg({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwMsg({ type: 'error', text: err.message || 'Failed to update password' });
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account preferences</p>
      </div>

      {/* My plan */}
      {renewOpen && stageKey && (
        <PayStageDialog stage={stageKey} action="renew" onClose={() => setRenewOpen(false)} />
      )}
      {payFishOpen && (
        <PayStageDialog stage="fish" action="pay" onClose={() => setPayFishOpen(false)} />
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <CreditCard className="text-amber-500" size={20} />
          <h2 className="text-lg font-bold">My Plan</h2>
        </div>
        <div className="p-5 space-y-4">
          {planMsg && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${planMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {planMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
              {planMsg.text}
            </div>
          )}

          {stage && stageKey ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Current plan</p>
                <p className="text-lg font-bold text-gray-900">
                  {stage.icon} {stage.label} <span className="text-sm font-normal text-gray-500">· {naira(stage.price)}/month</span>
                </p>
                {user?.paidUp ? (
                  <p className="text-sm text-gray-600">
                    {user.autoRenewActive ? 'Renews automatically on ' : 'Paid until '}
                    <span className="font-medium">{formatDate(user.paidUntil)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-red-600">Ended {formatDate(user?.paidUntil)} — renew to unlock your courses again.</p>
                )}
                <p className="text-xs text-gray-400">
                  Renewal: {user?.autoRenewActive ? 'automatic (card)' : 'manual — we remind you before it ends'}
                </p>
              </div>
              <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                {!user?.autoRenewActive && (
                  <button onClick={() => setRenewOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 rounded-lg">
                    {user?.paidUp ? 'Renew for another month' : `Renew ${stage.label}`}
                  </button>
                )}
                {user?.autoRenewActive && (
                  <button onClick={turnOffAutoRenew} disabled={turningOff} className="border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60 font-medium px-5 py-2.5 rounded-lg">
                    {turningOff ? 'Turning off…' : 'Turn off automatic renewal'}
                  </button>
                )}
                {stageKey !== 'whale' && (
                  <Link to="/dashboard/courses" className="text-sm text-amber-600 hover:underline">Upgrade to a higher stage →</Link>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Current plan</p>
                <p className="font-semibold text-gray-900">{user?.subscription === 'trial' ? '🐟 Free trial (Fish)' : 'No active plan'}</p>
                {user?.trialEndsAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(user.trialEndsAt) > new Date() ? 'Trial ends' : 'Trial ended'} {formatDate(user.trialEndsAt)}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                {onTrial ? (
                  <>
                    <button onClick={() => setPayFishOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 rounded-lg">
                      Pay for Fish now — {naira(STAGE_INFO.fish.price)}/month
                    </button>
                    <p className="text-xs text-gray-400 sm:text-right">Your paid month starts when the trial ends.</p>
                    <Link to="/dashboard/courses" className="text-sm text-amber-600 hover:underline">Or choose a higher stage →</Link>
                  </>
                ) : (
                  <Link to="/dashboard/courses" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 rounded-lg">
                    Choose a plan
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <User className="text-amber-500" size={20} />
          <h2 className="text-lg font-bold">Profile Information</h2>
        </div>
        <form onSubmit={handleProfileSave} className="p-5 space-y-4">
          {profileMsg && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
              profileMsg.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {profileMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
              {profileMsg.text}
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Referral Code</label>
              <input
                type="text"
                value={user?.referralCode}
                disabled
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 font-mono text-amber-600"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={profileSaving}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-lg flex items-center gap-2"
          >
            <Save size={18} />
            {profileSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <Lock className="text-amber-500" size={20} />
          <h2 className="text-lg font-bold">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordSave} className="p-5 space-y-4">
          {pwMsg && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
              pwMsg.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {pwMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
              {pwMsg.text}
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={pwSaving}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-lg flex items-center gap-2"
          >
            <Lock size={18} />
            {pwSaving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
