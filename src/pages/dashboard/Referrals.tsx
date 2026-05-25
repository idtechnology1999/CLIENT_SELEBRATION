import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Copy, QrCode, Users, TrendingUp, Gift, AlertCircle, Lock } from 'lucide-react';
import { studentApi, publicApi } from '../../services/api';

interface ReferralData {
  referralCode: string;
  totalReferrals: number;
  stage: number;
  directReferrals: {
    id: string;
    name: string;
    email: string;
    stage: number;
    subscription: string;
    joined: string;
  }[];
}

const DEFAULT_RATES = [65, 15, 5, 3, 2, 1];

const COURSE_LEVELS = [
  { key: 'free',  label: 'Free',           price: 0,      icon: '🟢', color: 'green' },
  { key: 'fish',  label: 'Become a Fish',  price: 5000,   icon: '🐟', color: 'blue'  },
  { key: 'shark', label: 'Become a Shark', price: 15000,  icon: '🦈', color: 'purple'},
  { key: 'whale', label: 'Become a Whale', price: 150000, icon: '🐋', color: 'amber' },
];

export default function Referrals() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commissionRates, setCommissionRates] = useState<number[]>(DEFAULT_RATES);

  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    Promise.allSettled([
      studentApi.getReferrals(),
      publicApi.getSettings(),
    ]).then(([referralsResult, settingsResult]) => {
      if (referralsResult.status === 'fulfilled') {
        setData(referralsResult.value.data);
      } else {
        setError(referralsResult.reason?.message || 'Failed to load referrals');
      }
      if (settingsResult.status === 'fulfilled') {
        const s = settingsResult.value.data;
        if (s.commissionRates?.length) setCommissionRates(s.commissionRates);
      }
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Referral Hub</h1>
        <p className="text-gray-500">Share your link and earn commissions</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
          <AlertCircle size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="rounded-xl p-6 text-white bg-gradient-to-r from-amber-500 to-amber-600">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">Your Referral Link</h2>
            <p className="text-amber-100 mb-4">Share this link with friends and earn up to 65% commission!</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/70"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium bg-white text-amber-600 hover:bg-gray-100"
              >
                <Copy size={16} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center">
            <QrCode className="text-amber-600" size={80} />
          </div>
        </div>
      </div>

      {/* Upgrade notice for free trial users */}
      {user?.subscription === 'trial' && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-4 rounded-xl text-sm">
          <Lock size={16} className="shrink-0 mt-0.5" />
          <p>You are on a <strong>free trial</strong>. You can share your referral link, but your commissions will only be counted once you upgrade to a paid course level.</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600" size={20} />
            </div>
            <span className="text-gray-500">Total Referrals</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{loading ? '—' : data?.totalReferrals ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <span className="text-gray-500">Direct (Level 1)</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{loading ? '—' : data?.directReferrals.length ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Gift className="text-purple-600" size={20} />
            </div>
            <span className="text-gray-500">Your Level</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {loading ? '—' : COURSE_LEVELS[(data?.stage ?? user?.stage ?? 0)]?.label ?? `Stage ${data?.stage ?? 0}`}
          </p>
        </div>
      </div>

      {/* Course level prices */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-bold mb-1">Course Levels & Prices</h2>
        <p className="text-sm text-gray-400 mb-4">When someone you refer buys any of these, you earn commission based on your level in their referral chain.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COURSE_LEVELS.map(lvl => {
            const earned65 = lvl.price > 0 ? Math.floor(lvl.price * 0.65) : null;
            return (
              <div key={lvl.key} className="border border-gray-100 rounded-xl p-4 text-center">
                <span className="text-2xl">{lvl.icon}</span>
                <p className="font-semibold text-sm mt-2 text-gray-800">{lvl.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {lvl.price === 0 ? 'Free' : `₦${lvl.price.toLocaleString()}`}
                </p>
                {earned65 && (
                  <p className="text-xs font-semibold text-amber-600 mt-1">
                    You earn ₦{earned65.toLocaleString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3">* "You earn" shows your Level 1 (65%) share when a direct referral buys that course.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold">Your Direct Referrals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Subscription</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Joined</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : !data?.directReferrals.length ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">No referrals yet. Share your link to get started!</td></tr>
              ) : data.directReferrals.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold">
                        {r.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded text-sm capitalize ${
                      r.subscription === 'active' ? 'bg-green-100 text-green-700' :
                      r.subscription === 'trial' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {r.subscription}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{r.joined}</td>
                  <td className="px-5 py-4 text-gray-600">Stage {r.stage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-bold mb-1">Commission Structure</h2>
        <p className="text-sm text-gray-400 mb-4">Your cut when someone in your referral chain makes a purchase.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Your Level</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-600">Rate</th>
                {COURSE_LEVELS.filter(l => l.price > 0).map(l => (
                  <th key={l.key} className="px-4 py-2 text-right font-semibold text-gray-600">{l.icon} {l.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {commissionRates.map((rate, i) => (
                <tr key={i} className={i === 0 ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-3 font-medium text-gray-800">Level {i + 1}{i === 0 ? ' (Direct)' : ''}</td>
                  <td className="px-4 py-3 text-center font-bold text-amber-600">{rate}%</td>
                  {COURSE_LEVELS.filter(l => l.price > 0).map(l => (
                    <td key={l.key} className="px-4 py-3 text-right text-gray-600">
                      ₦{Math.floor(l.price * rate / 100).toLocaleString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-3">You must have a paid course to earn commissions. Free trial users are skipped in the commission chain.</p>
      </div>
    </div>
  );
}
