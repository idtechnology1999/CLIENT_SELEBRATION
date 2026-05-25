import { useState } from 'react';
import { CreditCard, Loader } from 'lucide-react';
import { paymentApi } from '../services/api';

interface Props {
  className?: string;
  label?: string;
}

export default function SubscribeButton({ className = '', label = 'Subscribe Now — ₦5,000/mo' }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await paymentApi.initSubscription();
      // Redirect to Paystack checkout
      window.location.href = res.data.authorizationUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to start payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <p className="text-red-600 text-sm mb-2 text-center">{error}</p>
      )}
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className={`flex items-center justify-center gap-2 font-bold disabled:opacity-60 transition-colors ${className}`}
      >
        {loading
          ? <><Loader size={18} className="animate-spin" /> Processing...</>
          : <><CreditCard size={18} /> {label}</>
        }
      </button>
    </div>
  );
}
