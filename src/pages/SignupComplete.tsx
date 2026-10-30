import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader, XCircle, Clock } from 'lucide-react';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import { signupApi, getSignupToken, setSignupToken, clearSignupToken, type SignupState } from '../services/api';
import { STAGE_INFO, isStageKey } from '../utils/stages';

// After Paystack: check the payment, then confirm the email with a code (which logs them in).
type View = 'checking' | 'error' | 'no-session' | SignupState | 'confirmed';

const POLL_MS = 5000;
const MAX_POLLS = 120; // ~10 minutes
const RESEND_SECONDS = 60;

export default function SignupComplete() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const [view, setView] = useState<View>(() => (getSignupToken() ? 'checking' : 'no-session'));
  const [stage, setStage] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [polls, setPolls] = useState(0);

  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [notice, setNotice] = useState('');
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

  const [changingEmail, setChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);

  const check = useCallback(async () => {
    try {
      const res = await signupApi.status();
      const d = res.data;
      setStage(d.stage);
      if (d.email) setEmail(d.email);
      if (d.state === 'paid' && d.emailVerified) {
        clearSignupToken();
        setView('confirmed');
      } else {
        if (d.state === 'failed') clearSignupToken();
        setView(d.state);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please refresh.');
      setView('error');
    }
  }, []);

  // First check when the page opens.
  useEffect(() => {
    if (!getSignupToken()) return;
    const t = setTimeout(check, 0);
    return () => clearTimeout(t);
  }, [check]);

  // Payment still processing (e.g. bank transfer): check again every few seconds.
  useEffect(() => {
    if (view !== 'pending' || polls >= MAX_POLLS) return;
    const t = setTimeout(() => { setPolls(n => n + 1); check(); }, POLL_MS);
    return () => clearTimeout(t);
  }, [view, polls, check]);

  // Count down until "Resend code" is allowed again.
  useEffect(() => {
    if (view !== 'paid' || resendIn <= 0) return;
    const t = setTimeout(() => setResendIn(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [view, resendIn]);

  const plan = isStageKey(stage) ? STAGE_INFO[stage] : null;
  const planName = plan ? `${plan.label} plan` : 'plan';

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');
    setNotice('');
    setVerifying(true);
    try {
      const res = await signupApi.verify(code);
      loginWithToken(res.token, res.data);
      navigate('/dashboard/courses', { replace: true });
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : 'Could not confirm the code.');
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setCodeError('');
    setNotice('');
    try {
      await signupApi.resendCode();
      setNotice(`A new code has been sent to ${email}.`);
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : 'Could not send a new code.');
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');
    setNotice('');
    setSavingEmail(true);
    try {
      const res = await signupApi.changeEmail(newEmail);
      setSignupToken(res.data.signupToken);
      setEmail(res.data.email);
      setChangingEmail(false);
      setNewEmail('');
      setCode('');
      setResendIn(RESEND_SECONDS);
      setNotice(`We sent a new code to ${res.data.email}.`);
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : 'Could not change the email.');
    } finally {
      setSavingEmail(false);
    }
  };

  const restartLink = isStageKey(stage) && stage !== 'fish' ? `/register?plan=${stage}` : '/register';
  const inputClass = 'w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500';

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center mb-8">
          <img src={logo} alt="Selliberation" className="h-14 w-auto object-contain mx-auto" />
        </Link>
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 text-white">

          {view === 'checking' && (
            <div className="text-center space-y-3">
              <Loader className="mx-auto text-amber-500 animate-spin" size={44} />
              <h1 className="text-xl font-bold">Checking your payment…</h1>
              <p className="text-gray-400 text-sm">This only takes a moment.</p>
            </div>
          )}

          {view === 'pending' && (
            <div className="text-center space-y-3">
              <Clock className="mx-auto text-amber-500" size={44} />
              <h1 className="text-xl font-bold">Waiting for your payment to confirm…</h1>
              <p className="text-gray-400 text-sm">
                {polls >= MAX_POLLS
                  ? "It's taking longer than usual. You can close this page — log in later and we'll pick up where you left off."
                  : 'Bank transfers can take a few minutes. Keep this page open; it updates by itself.'}
              </p>
            </div>
          )}

          {view === 'failed' && (
            <div className="text-center space-y-4">
              <XCircle className="mx-auto text-red-400" size={44} />
              <h1 className="text-xl font-bold">Payment not completed</h1>
              <p className="text-gray-400 text-sm">Your registration has been cancelled. You can start again.</p>
              <Link to={restartLink} className="inline-block bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold px-6 py-3 rounded-lg">
                Start again
              </Link>
            </div>
          )}

          {view === 'paid' && (
            <div className="space-y-5">
              <div className="text-center">
                <CheckCircle className="mx-auto text-green-400 mb-3" size={44} />
                <h1 className="text-xl font-bold">Payment received</h1>
                <p className="text-gray-300 text-sm mt-2">
                  Your {planName} is paid. Enter the 6-digit code we sent to{' '}
                  <span className="text-amber-400 font-semibold break-all">{email}</span> to confirm your email.
                </p>
              </div>

              {codeError && <p className="bg-red-900/40 border border-red-500/40 text-red-300 px-4 py-3 rounded-lg text-sm">{codeError}</p>}
              {notice && <p className="bg-green-900/30 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg text-sm">{notice}</p>}

              {changingEmail ? (
                <form onSubmit={handleChangeEmail} className="space-y-3">
                  <label className="block text-gray-400 text-sm">Correct email address</label>
                  <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className={inputClass} placeholder="you@example.com" required />
                  <div className="flex gap-3">
                    <button type="submit" disabled={savingEmail} className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-gray-900 font-bold py-3 rounded-lg">
                      {savingEmail ? 'Saving…' : 'Update & send code'}
                    </button>
                    <button type="button" onClick={() => setChangingEmail(false)} className="px-4 py-3 rounded-lg border border-gray-600 text-gray-300 hover:text-white">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerify} className="space-y-4">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    aria-label="6-digit code"
                    className={`${inputClass} text-center text-2xl tracking-widest`}
                    required
                  />
                  <button type="submit" disabled={verifying || code.length < 6} className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-gray-900 font-bold py-3 rounded-lg">
                    {verifying ? 'Confirming…' : 'Confirm email'}
                  </button>
                  <div className="flex items-center justify-between text-sm">
                    <button type="button" onClick={handleResend} disabled={resendIn > 0} className="text-amber-400 hover:underline disabled:text-gray-500 disabled:no-underline">
                      {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
                    </button>
                    <button type="button" onClick={() => { setChangingEmail(true); setNewEmail(email); }} className="text-gray-400 hover:text-white">
                      Wrong email? Change it
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {view === 'confirmed' && (
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto text-green-400" size={44} />
              <h1 className="text-xl font-bold">Your email is already confirmed</h1>
              <Link to="/login" className="inline-block bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold px-6 py-3 rounded-lg">Log in</Link>
            </div>
          )}

          {view === 'no-session' && (
            <div className="text-center space-y-4">
              <h1 className="text-xl font-bold">Finish your sign-up</h1>
              <p className="text-gray-400 text-sm">Log in with the email and password you signed up with to continue.</p>
              <Link to="/login" className="inline-block bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold px-6 py-3 rounded-lg">Log in</Link>
            </div>
          )}

          {view === 'error' && (
            <div className="text-center space-y-4">
              <XCircle className="mx-auto text-red-400" size={44} />
              <p className="text-gray-300 text-sm">{error}</p>
              <button onClick={() => { setView('checking'); check(); }} className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold px-6 py-3 rounded-lg">
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
