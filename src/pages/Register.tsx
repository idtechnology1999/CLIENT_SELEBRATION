import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Register() {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState(refCode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP verification step
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');

  const { register, verifyEmail } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, phone, password, referralCode || undefined);
      setOtpStep(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyEmail(email, otp);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center mb-8">
          <img src={logo} alt="Selebration" className="h-14 w-auto object-contain mx-auto" />
        </Link>
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">

          {!otpStep ? (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-gray-400 mb-6">Start your 7-day free trial today</p>

              {error && (
                <div className="bg-red-900/40 border border-red-500/40 text-red-400 px-4 py-3 rounded-lg mb-5 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 pr-12"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Referral Code (Optional)</label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Enter referral code"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-gray-900 font-bold py-3 rounded-lg transition-colors"
                >
                  {loading ? 'Sending OTP...' : 'Start Free Trial'}
                </button>
              </form>
              <p className="text-gray-400 text-center mt-6">
                Already have an account? <Link to="/login" className="text-amber-500 hover:underline">Login</Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
              <p className="text-gray-400 mb-3">
                We sent a 6-digit code to <span className="text-amber-400">{email}</span>. Enter it below.
              </p>
              <p className="text-yellow-500/80 text-sm bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 mb-4">
                If you don't receive the email within a few minutes, go back and make sure your email address is correct.
              </p>

              {error && (
                <div className="bg-red-900/40 border border-red-500/40 text-red-400 px-4 py-3 rounded-lg mb-5 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-2">6-Digit OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-widest focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-gray-900 font-bold py-3 rounded-lg transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify & Create Account'}
                </button>
                <button
                  type="button"
                  onClick={() => { setOtpStep(false); setOtp(''); setError(''); }}
                  className="w-full text-gray-400 hover:text-white text-sm py-2"
                >
                  Back — change my details
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
