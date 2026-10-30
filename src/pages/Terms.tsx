import logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePrices } from '../hooks/usePrices';

export default function Terms() {
  const prices = usePrices();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <img src={logo} alt="Selliberation" className="h-10 w-auto object-contain" />
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
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-400 mb-10">Last updated: June 2026</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By registering an account or using the Selliberation platform ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not use the Platform.
            </p>
            <p className="mt-3">
              We reserve the right to update these Terms at any time. Continued use of the Platform after changes are posted constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Eligibility</h2>
            <p>
              You must be at least 16 years of age to use Selliberation. By creating an account, you confirm that you meet this requirement and that all information you provide is accurate and truthful.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Account Registration</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately at <a href="mailto:support@selliberation.co" className="text-amber-400 hover:underline">support@selliberation.co</a> if you suspect unauthorised access to your account.
            </p>
            <p className="mt-3">
              We reserve the right to suspend or terminate accounts that provide false information, violate these Terms, or engage in fraudulent activity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Subscriptions and Payments</h2>
            <p className="mb-3">Selliberation offers four subscription levels:</p>
            <ul className="space-y-2 list-disc list-inside text-gray-300 mb-4">
              <li><span className="text-white font-medium">Fish (🐟):</span> ₦{prices.fish.toLocaleString()} / month — includes a 7-day free trial on first sign-up.</li>
              <li><span className="text-white font-medium">Dolphin (🐬):</span> ₦{prices.dolphin.toLocaleString()} / month.</li>
              <li><span className="text-white font-medium">Shark (🦈):</span> ₦{prices.shark.toLocaleString()} / month.</li>
              <li><span className="text-white font-medium">Whale (🐋):</span> ₦{prices.whale.toLocaleString()} / month.</li>
            </ul>
            <p>
              All payments are processed securely through Paystack. Subscriptions are billed on a monthly recurring basis. By subscribing, you authorise Selliberation to charge your chosen payment method each month until you cancel.
            </p>
            <p className="mt-3">
              The 7-day free trial is available to new users on the Fish level only. No payment is required during the trial period. After the trial ends, access is suspended until a subscription is activated.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Refund Policy</h2>
            <p>
              Due to the digital nature of our content, all subscription payments are non-refundable once access to course materials has been granted. If you believe you have been charged in error, contact us within 7 days of the charge at <a href="mailto:support@selliberation.co" className="text-amber-400 hover:underline">support@selliberation.co</a> and we will review your case.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Course Access and Content</h2>
            <p>
              Access to courses is granted based on your active subscription level. Upgrading your subscription unlocks the corresponding stage's content immediately. Downgrading or cancelling your subscription will restrict access to content above your current level at the end of the billing period.
            </p>
            <p className="mt-3">
              All course content on the Platform is the intellectual property of Selliberation. You may not copy, distribute, reproduce, or resell any content without prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Affiliate and Referral Programme</h2>
            <p>
              Selliberation operates a 6-level affiliate commission programme. By participating, you agree to the following:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-gray-300">
              <li>Commissions are earned only when referred users make paid subscription purchases.</li>
              <li>You must hold an active paid subscription to earn and receive commissions. Free trial users are excluded from the commission chain.</li>
              <li>Commission rates are set by Selliberation and may be adjusted at any time with notice.</li>
              <li>Referral fraud — including self-referrals, fake registrations, or any manipulation of the referral system — will result in immediate account termination and forfeiture of all pending commissions.</li>
              <li>Commissions are paid out upon request, subject to a minimum withdrawal threshold, and are processed to your registered Nigerian bank account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Withdrawals</h2>
            <p>
              Withdrawal requests are reviewed and processed manually. We aim to process approved withdrawals within 3–5 business days. Selliberation reserves the right to delay or withhold withdrawals pending review if there is suspected fraud or a policy violation.
            </p>
            <p className="mt-3">
              You are responsible for ensuring that your bank account details are accurate. Selliberation is not liable for funds sent to incorrect account details provided by you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Prohibited Conduct</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="space-y-2 list-disc list-inside text-gray-300">
              <li>Share your account credentials with any other person.</li>
              <li>Use the Platform for any unlawful purpose.</li>
              <li>Attempt to gain unauthorised access to any part of the Platform or its infrastructure.</li>
              <li>Upload or transmit harmful, offensive, or misleading content through the chat or any other feature.</li>
              <li>Manipulate the referral or commission system in any way.</li>
              <li>Impersonate any person or entity or misrepresent your affiliation with Selliberation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Intellectual Property</h2>
            <p>
              All content on the Platform, including but not limited to course videos, written materials, logos, and branding, is owned by or licensed to Selliberation. Nothing in these Terms grants you any right to use our intellectual property other than as explicitly permitted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Disclaimers</h2>
            <p>
              Selliberation provides educational content and income-earning tools. We do not guarantee any specific financial results or income from participating in the Platform. Earnings depend on individual effort, skill development, and market conditions.
            </p>
            <p className="mt-3">
              The Platform is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free access to the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Selliberation shall not be liable for any indirect, incidental, or consequential damages arising from your use of or inability to use the Platform, even if we have been advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">13. Termination</h2>
            <p>
              You may cancel your account at any time by contacting support. We reserve the right to suspend or permanently terminate your account, with or without notice, for violation of these Terms or conduct that we determine to be harmful to the Platform or its users.
            </p>
            <p className="mt-3">
              Upon termination, your access to course content and any unpaid commissions pending review may be forfeited at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">14. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes arising from these Terms shall be resolved in the courts of Nigeria.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">15. Contact Us</h2>
            <p>For any questions regarding these Terms, please reach out:</p>
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
          <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
