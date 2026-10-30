import { useState } from 'react';
import { Loader, X } from 'lucide-react';
import { paymentApi } from '../services/api';
import type { Renewal, StageKey } from '../types';
import { STAGE_INFO, naira } from '../utils/stages';
import RenewalOptions from './RenewalOptions';
import { usePrices } from '../hooks/usePrices';

interface Props {
  stage: StageKey;
  // What the user is doing, for the wording only.
  action: 'upgrade' | 'renew' | 'pay';
  onClose: () => void;
}

// Asks how to renew, then sends the logged-in user to Paystack for one month of a stage.
export default function PayStageDialog({ stage, action, onClose }: Props) {
  const info = STAGE_INFO[stage];
  const price = usePrices()[stage];
  const [renewal, setRenewal] = useState<Renewal>('auto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const title = action === 'upgrade'
    ? `Upgrade to ${info.label}`
    : action === 'renew' ? `Renew ${info.label}` : `Get ${info.label}`;

  const pay = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await paymentApi.initStageUpgrade(stage, renewal);
      window.location.href = res.data.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{info.icon} {title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {naira(price)} per month · unlocks {info.label} and every stage below it
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <RenewalOptions value={renewal} onChange={setRenewal} />

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

        <button
          onClick={pay}
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
        >
          {loading ? <><Loader size={16} className="animate-spin" /> Opening Paystack…</> : <>Continue to payment — {naira(price)}</>}
        </button>
      </div>
    </div>
  );
}
