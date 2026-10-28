import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { paymentApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type Status = 'verifying' | 'success' | 'failed';

export default function SubscribeCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<Status>('verifying');
  const [message, setMessage] = useState('');

  // Paystack references can only be verified once, so never check the same one twice
  // (e.g. on re-renders, or React's double-run of effects in development).
  const verifiedRef = useRef<string | null>(null);

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    const type = searchParams.get('type');

    if (reference && verifiedRef.current === reference) return;
    verifiedRef.current = reference;

    if (!reference) {
      setStatus('failed');
      setMessage('No payment reference found. Please try again.');
      return;
    }

    const fail = (err: any) => {
      setStatus('failed');
      setMessage(err.message || 'Payment verification failed. Contact support if you were charged.');
    };

    if (searchParams.get('cancelled')) {
      setStatus('failed');
      setMessage('You cancelled the payment. Nothing was charged.');
      return;
    }

    if (type === 'module') {
      paymentApi.verifyModulePayment(reference)
        .then(res => { setStatus('success'); setMessage(res.message || 'Module unlocked!'); })
        .catch(fail);
    } else {
      // Stage payments (upgrade, renewal). Safe even if Paystack's webhook got there first.
      paymentApi.verifyStageUpgrade(reference)
        .then(async res => { await refreshUser(); setStatus('success'); setMessage(res.message || 'Plan active!'); })
        .catch(fail);
    }
  }, [searchParams, refreshUser]);

  const isModule = searchParams.get('type') === 'module';
  const isStage = searchParams.get('type') !== 'module';

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center max-w-md w-full">
        {status === 'verifying' && (
          <>
            <Loader className="mx-auto text-amber-500 mb-4 animate-spin" size={52} />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying Payment...</h2>
            <p className="text-gray-500">Please wait while we confirm your payment with Paystack.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto text-green-500 mb-4" size={52} />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {isModule ? 'Module Unlocked!' : isStage ? 'Plan Active!' : 'Payment Confirmed!'}
            </h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <button
              onClick={() => navigate('/dashboard/courses')}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-xl"
            >
              Back to Courses
            </button>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="mx-auto text-red-500 mb-4" size={52} />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Not Confirmed</h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/dashboard/courses')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl"
              >
                Back to Courses
              </button>
              <button
                onClick={() => navigate('/dashboard/courses')}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl"
              >
                Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
