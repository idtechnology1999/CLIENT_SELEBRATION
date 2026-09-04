import logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <img src={logo} alt="Selebration" className="h-10 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-300 hover:text-white hidden sm:block">Login</Link>
            <Link to="/register" className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold px-4 py-2 rounded-lg">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-32 pb-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-400 mb-10">Last updated: June 2026</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
            <p>
              Selliberation ("we", "our", or "us") is committed to protecting the privacy of our users. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our platform at <span className="text-amber-400">selliberation.co</span> and its associated services.
            </p>
            <p className="mt-3">
              By registering or using Selliberation, you agree to the collection and use of information as described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect the following types of information when you use our platform:</p>
            <ul className="space-y-2 list-disc list-inside text-gray-300">
              <li><span className="text-white font-medium">Account Information:</span> Your full name, email address, and phone number, provided at registration.</li>
              <li><span className="text-white font-medium">Authentication Data:</span> Encrypted passwords and session tokens. We never store plaintext passwords.</li>
              <li><span className="text-white font-medium">Payment Information:</span> Payment references and transaction status processed through Paystack. We do not store your card details — these are handled entirely by Paystack.</li>
              <li><span className="text-white font-medium">Usage Data:</span> Your course progress, stage level, subscription status, and activity on the platform.</li>
              <li><span className="text-white font-medium">Referral Data:</span> Your referral code and the accounts you have referred.</li>
              <li><span className="text-white font-medium">Chat Messages:</span> Messages sent through the in-platform support chat.</li>
              <li><span className="text-white font-medium">Bank Account Details:</span> Account number, bank name, and account name, collected only when you submit a withdrawal request.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Information</h2>
            <ul className="space-y-2 list-disc list-inside text-gray-300">
              <li>To create and manage your account.</li>
              <li>To verify your identity via email OTP during registration.</li>
              <li>To process payments and verify subscription status through Paystack.</li>
              <li>To track and pay out referral commissions.</li>
              <li>To process withdrawal requests to your bank account.</li>
              <li>To send you important account notifications (e.g., email verification, password reset).</li>
              <li>To provide customer support through the live chat feature.</li>
              <li>To improve platform performance and user experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. How We Store Your Data</h2>
            <p>
              Your data is stored on secure servers. Session tokens are stored in your browser's local storage and are used to authenticate your requests. Tokens expire after 30 days, after which you will be required to log in again.
            </p>
            <p className="mt-3">
              We take reasonable technical and organisational measures to protect your personal information against unauthorised access, loss, or misuse.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Sharing Your Information</h2>
            <p className="mb-3">We do not sell or rent your personal information to third parties. We may share your data only in the following circumstances:</p>
            <ul className="space-y-2 list-disc list-inside text-gray-300">
              <li><span className="text-white font-medium">Paystack:</span> Payment processing. Your payment information is governed by <a href="https://paystack.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Paystack's Privacy Policy</a>.</li>
              <li><span className="text-white font-medium">Legal requirements:</span> If required by law or to protect the rights and safety of our users or the public.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Referral Program</h2>
            <p>
              When you join using a referral link, we record the relationship between your account and the referrer's account for the purpose of calculating and paying commissions. This is limited to internal account identifiers and is not shared publicly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="space-y-2 list-disc list-inside text-gray-300">
              <li>Access the personal information we hold about you.</li>
              <li>Request correction of inaccurate information.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>Withdraw consent for marketing communications at any time.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at <a href="mailto:support@selliberation.co" className="text-amber-400 hover:underline">support@selliberation.co</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Cookies</h2>
            <p>
              We do not use tracking cookies. We use browser local storage solely to maintain your login session. We do not use third-party advertising or analytics cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Children's Privacy</h2>
            <p>
              Selliberation is not intended for users under the age of 16. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can remove it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of the platform after changes are posted constitutes your acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or how your data is handled, please contact us:
            </p>
            <div className="mt-3 bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-1">
              <p><span className="text-gray-400">Email:</span> <a href="mailto:support@selliberation.co" className="text-amber-400 hover:underline">support@selliberation.co</a></p>
              <p><span className="text-gray-400">Platform:</span> <span className="text-white">Selliberation</span></p>
            </div>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          &copy; 2026 Selliberation. All rights reserved. &nbsp;·&nbsp;
          <Link to="/" className="hover:text-white">Home</Link>
          &nbsp;·&nbsp;
          <Link to="/login" className="hover:text-white">Login</Link>
        </div>
      </div>
    </div>
  );
}
