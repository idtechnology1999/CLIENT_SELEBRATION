import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { userAuthApi } from '../services/api';
import logo from '../assets/logo.png';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-gray-800 rounded-2xl p-8 border border-gray-700 text-center space-y-4">
          <p className="text-red-400 text-sm">Invalid or missing reset link. Please request a new one.</p>
          <Link to="/forgot-password" className="text-amber-500 hover:underline text-sm block">
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await userAuthApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center mb-8">
          <img src={logo} alt="Selebration" className="h-14 w-auto object-contain mx-auto" />
        </Link>

        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <span className="text-2xl">✅</span>
              </div>
              <h1 className="text-xl font-bold text-white">Password Reset!</h1>
              <p className="text-gray-400 text-sm">
                Your password has been updated. Redirecting you to sign in...
              </p>
              <Link to="/login" className="block text-amber-500 hover:underline text-sm">
                Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-1">Reset Password</h1>
              <p className="text-gray-400 text-sm mb-6">Enter your new password below.</p>

              {error && (
                <div className="bg-red-900/40 border border-red-500/40 text-red-400 px-4 py-3 rounded-lg mb-5 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-2 text-sm">Confirm New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-gray-900 font-bold py-3 rounded-lg transition-colors"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>

              <p className="text-gray-400 text-center mt-6 text-sm">
                <Link to="/login" className="text-amber-500 hover:underline">Back to Sign In</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
