import { useState } from 'react';
import { Link } from 'react-router-dom';
import { userAuthApi } from '../services/api';
import logo from '../assets/logo.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await userAuthApi.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center mb-8">
          <img src={logo} alt="Selliberation" className="h-14 w-auto object-contain mx-auto" />
        </Link>

        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto">
                <span className="text-2xl">✉️</span>
              </div>
              <h1 className="text-xl font-bold text-white">Check your email</h1>
              <p className="text-gray-400 text-sm">
                We sent a password reset link to <span className="text-white font-medium">{email}</span>.
                Follow the link in the email to reset your password.
              </p>
              <p className="text-gray-500 text-xs">Didn't receive it? Check your spam folder.</p>
              <Link to="/login" className="block mt-4 text-amber-500 hover:underline text-sm">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-1">Forgot Password</h1>
              <p className="text-gray-400 text-sm mb-6">
                Enter your email and we'll send you a reset link.
              </p>

              {error && (
                <div className="bg-red-900/40 border border-red-500/40 text-red-400 px-4 py-3 rounded-lg mb-5 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-gray-900 font-bold py-3 rounded-lg transition-colors"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-gray-400 text-center mt-6 text-sm">
                Remember your password?{' '}
                <Link to="/login" className="text-amber-500 hover:underline">Sign In</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
