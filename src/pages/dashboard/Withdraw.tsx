import { useState, useEffect, useRef } from 'react';
import { Wallet, DollarSign, Clock, CheckCircle, XCircle, Send, AlertCircle, Loader, Pencil, Building2 } from 'lucide-react';
import { studentApi, paymentApi } from '../../services/api';

const NIGERIAN_BANKS = [
  { code: '044', name: 'Access Bank' },
  { code: '063', name: 'Access Bank (Diamond)' },
  { code: '565', name: 'Carbon (One Finance)' },
  { code: '023', name: 'Citibank Nigeria' },
  { code: '559', name: 'Coronation Bank' },
  { code: '050', name: 'Ecobank Nigeria' },
  { code: '090551', name: 'Fairmoney MFB' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '214', name: 'First City Monument Bank' },
  { code: '103', name: 'Globus Bank' },
  { code: '058', name: 'Guaranty Trust Bank' },
  { code: '030', name: 'Heritage Bank' },
  { code: '301', name: 'Jaiz Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '50211', name: 'Kuda Bank' },
  { code: '303', name: 'Lotus Bank' },
  { code: '50515', name: 'Moniepoint MFB' },
  { code: '999992', name: 'OPay' },
  { code: '107', name: 'Optimus Bank' },
  { code: '999991', name: 'PalmPay' },
  { code: '526', name: 'Parallex Bank' },
  { code: '076', name: 'Polaris Bank' },
  { code: '101', name: 'Providus Bank' },
  { code: '090175', name: 'Rubies MFB' },
  { code: '090325', name: 'Sparkle MFB' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '068', name: 'Standard Chartered Bank' },
  { code: '232', name: 'Sterling Bank' },
  { code: '100', name: 'Suntrust Bank' },
  { code: '102', name: 'Titan Trust Bank' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '033', name: 'United Bank For Africa' },
  { code: '215', name: 'Unity Bank' },
  { code: '566', name: 'VFD Microfinance Bank' },
  { code: '035', name: 'Wema Bank' },
  { code: '057', name: 'Zenith Bank' },
];

interface SavedAccount {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt: string;
}

export default function Withdraw() {
  // ── balance & history ──
  const [withdrawable, setWithdrawable] = useState(0);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // ── saved bank account ──
  const [savedAccount, setSavedAccount] = useState<SavedAccount | null>(null);
  const [editingAccount, setEditingAccount] = useState(false);

  // ── account setup form ──
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [manualEntry, setManualEntry] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // ── withdrawal request ──
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const MIN = 10000;

  const loadData = () => {
    setLoadError('');
    Promise.allSettled([
      studentApi.getDashboard(),
      studentApi.getWithdrawals(),
      studentApi.getBankAccount(),
    ]).then(([dashResult, histResult, bankResult]) => {
      if (dashResult.status === 'fulfilled') setWithdrawable(dashResult.value.data.stats.withdrawable);
      if (histResult.status === 'fulfilled') setWithdrawals(histResult.value.data);
      if (bankResult.status === 'fulfilled') {
        const b = bankResult.value.data;
        if (b.accountNumber) setSavedAccount(b);
      }
      if (dashResult.status === 'rejected') setLoadError(dashResult.reason?.message || 'Failed to load balance');
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').reduce((s, w) => s + w.amount, 0);
  const canWithdraw = withdrawable >= MIN;

  // ── account verification ──
  const verifyRequestIdRef = useRef(0);

  useEffect(() => {
    if (manualEntry) return;
    setAccountName('');
    setVerifyError('');

    if (!bankCode || accountNumber.length !== 10) return;

    verifyRequestIdRef.current += 1;
    const currentId = verifyRequestIdRef.current;

    const timer = setTimeout(async () => {
      setVerifying(true);
      try {
        const res = await paymentApi.verifyAccount(accountNumber, bankCode);
        if (verifyRequestIdRef.current !== currentId) return;
        if (res.success && res.data?.account_name) {
          setAccountName(res.data.account_name);
          setManualEntry(false);
        } else {
          setVerifyError('Could not auto-verify. Enter your account name manually below.');
          setManualEntry(true);
        }
      } catch (err: any) {
        if (verifyRequestIdRef.current !== currentId) return;
        setVerifyError('Could not auto-verify. Enter your account name manually below.');
        setManualEntry(true);
      } finally {
        if (verifyRequestIdRef.current === currentId) setVerifying(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [bankCode, accountNumber, manualEntry]);

  const handleSaveAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accountName) { setSaveError('Please verify your account first'); return; }
    setSaveError('');
    setSaving(true);
    try {
      const selectedBank = NIGERIAN_BANKS.find(b => b.code === bankCode);
      await studentApi.saveBankAccount({
        bankName: selectedBank?.name || '',
        bankCode,
        accountNumber,
        accountName,
      });
      setSavedAccount({ bankName: selectedBank?.name || '', bankCode, accountNumber, accountName });
      setEditingAccount(false);
      setBankCode('');
      setAccountNumber('');
      setAccountName('');
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save bank account');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      await studentApi.requestWithdrawal({ amount: Number(amount) });
      setSubmitted(true);
      setAmount('');
      loadData();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit withdrawal request');
    } finally {
      setSubmitting(false);
    }
  };

  const startEditAccount = () => {
    if (savedAccount) {
      setBankCode(savedAccount.bankCode);
      setAccountNumber(savedAccount.accountNumber);
      setAccountName(savedAccount.accountName);
    }
    setManualEntry(false);
    setVerifyError('');
    setEditingAccount(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Withdraw Earnings</h1>
        <p className="text-gray-500">Request a withdrawal to your bank account</p>
      </div>

      {loadError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
          <AlertCircle size={20} className="shrink-0" />
          <p>{loadError}</p>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Wallet className="text-green-600" size={20} />
            </div>
            <span className="text-gray-500">Available Balance</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{loading ? '—' : `₦${withdrawable.toLocaleString()}`}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <span className="text-gray-500">Pending Withdrawals</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{loading ? '—' : `₦${pendingWithdrawals.toLocaleString()}`}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-blue-600" size={20} />
            </div>
            <span className="text-gray-500">Min. Withdrawal</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">₦{MIN.toLocaleString()}</p>
        </div>
      </div>

      {/* ── Bank Account ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Bank Account</h2>
          {savedAccount && !editingAccount && (
            <button
              onClick={startEditAccount}
              className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              <Pencil size={14} /> Change Account
            </button>
          )}
        </div>

        {savedAccount && !editingAccount ? (
          <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
              <Building2 className="text-green-600" size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900">{savedAccount.accountName}</p>
              <p className="text-sm text-gray-600">{savedAccount.bankName}</p>
              <p className="text-sm text-gray-500 font-mono">{savedAccount.accountNumber}</p>
            </div>
            <CheckCircle className="text-green-500 shrink-0" size={20} />
          </div>
        ) : (
          <form onSubmit={handleSaveAccount} className="space-y-4">
            {!savedAccount && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                Set up your bank account once. It will be used for all future withdrawals.
              </p>
            )}
            {saveError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{saveError}</p>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Bank</label>
                <select
                  value={bankCode}
                  onChange={e => { setBankCode(e.target.value); setManualEntry(false); }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                  required
                >
                  <option value="">-- Select Bank --</option>
                  {NIGERIAN_BANKS.map(bank => (
                    <option key={bank.code} value={bank.code}>{bank.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={e => { setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10)); setManualEntry(false); }}
                  placeholder="10-digit account number"
                  maxLength={10}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Name
                {manualEntry && <span className="ml-2 text-xs text-amber-600 font-normal">(type manually)</span>}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={accountName}
                  readOnly={!manualEntry}
                  onChange={manualEntry ? e => setAccountName(e.target.value.toUpperCase()) : undefined}
                  placeholder={verifying ? 'Verifying...' : manualEntry ? 'Type your account name' : 'Auto-filled after verification'}
                  className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 ${manualEntry ? 'bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500' : 'bg-gray-50'} text-gray-700`}
                  required
                />
                {verifying && (
                  <Loader size={18} className="absolute right-3 top-3 animate-spin text-amber-500" />
                )}
              </div>
              {verifyError && (
                <p className="text-xs text-amber-700 mt-1">{verifyError}</p>
              )}
              {accountName && !manualEntry && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle size={12} /> Verified</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving || !accountName}
                className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2"
              >
                {saving ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                {saving ? 'Saving...' : 'Save Account'}
              </button>
              {editingAccount && (
                <button
                  type="button"
                  onClick={() => { setEditingAccount(false); setBankCode(''); setAccountNumber(''); setAccountName(''); }}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* ── Withdrawal Request ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold mb-4">Request Withdrawal</h2>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
            <h3 className="text-lg font-bold text-green-700 mb-2">Withdrawal Request Submitted!</h3>
            <p className="text-green-600">Your request is pending approval. You'll be notified once processed.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 text-sm text-green-700 underline"
            >
              Make another request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!savedAccount && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700 text-sm">
                Please save your bank account above before making a withdrawal request.
              </div>
            )}
            {!loading && !canWithdraw && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700 text-sm">
                Minimum withdrawal is ₦{MIN.toLocaleString()}. You need ₦{(MIN - withdrawable).toLocaleString()} more before you can withdraw.
              </div>
            )}
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {submitError}
              </div>
            )}

            {savedAccount && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 flex items-center gap-2">
                <Building2 size={15} className="text-gray-400 shrink-0" />
                Payment will be sent to <span className="font-semibold text-gray-800">{savedAccount.accountName}</span> — {savedAccount.bankName} ({savedAccount.accountNumber})
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₦)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={`Min: ₦${MIN.toLocaleString()} — Max: ₦${withdrawable.toLocaleString()}`}
                max={withdrawable}
                min={MIN}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !savedAccount || !canWithdraw}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <Send size={18} />
              {submitting ? 'Submitting...' : 'Submit Withdrawal Request'}
            </button>
          </form>
        )}
      </div>

      {/* ── History ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold">Withdrawal History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Amount</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Bank</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Account</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : withdrawals.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No withdrawals yet</td></tr>
              ) : withdrawals.map(w => (
                <tr key={w.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 text-gray-500">{new Date(w.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4 font-bold">₦{w.amount.toLocaleString()}</td>
                  <td className="px-5 py-4 text-gray-500">{w.bankName}</td>
                  <td className="px-5 py-4 text-gray-500">{w.accountNumber}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded text-sm flex items-center gap-1 w-fit ${
                      w.status === 'approved' ? 'bg-green-100 text-green-700' :
                      w.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {w.status === 'approved' && <CheckCircle size={14} />}
                      {w.status === 'pending' && <Clock size={14} />}
                      {w.status === 'rejected' && <XCircle size={14} />}
                      {w.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
