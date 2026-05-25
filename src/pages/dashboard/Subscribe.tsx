import { Check } from 'lucide-react';
import SubscribeButton from '../../components/SubscribeButton';

const features = [
  'Unlock all course modules & videos',
  'Access your referral link & start earning',
  'Earn up to 65% commission per referral',
  'Withdraw your earnings anytime',
  'Exclusive content & new courses',
  'Priority support',
];

export default function Subscribe() {
  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Subscribe to Unlock Earning</h1>
      <p className="text-gray-500 mb-8">One simple plan. Full access. Start earning today.</p>

      <div className="bg-white rounded-2xl border-2 border-amber-500 shadow-lg overflow-hidden">
        <div className="bg-amber-500 px-6 py-5 text-white">
          <p className="text-sm font-semibold uppercase tracking-wide mb-1">Monthly Plan</p>
          <p className="text-4xl font-bold">₦5,000<span className="text-lg font-normal">/month</span></p>
          <p className="text-amber-100 text-sm mt-1">Cancel anytime</p>
        </div>

        <div className="px-6 py-6 space-y-3">
          {features.map(f => (
            <div key={f} className="flex items-center gap-3">
              <Check size={18} className="text-amber-500 shrink-0" />
              <span className="text-gray-700 text-sm">{f}</span>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6">
          <SubscribeButton
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl text-sm"
            label="Subscribe Now — ₦5,000/mo"
          />
        </div>
      </div>
    </div>
  );
}
