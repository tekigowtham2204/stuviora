export const metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy policy</h1>
      <p className="meta">Last updated: June 2026 · DPDP Act 2023 compliant</p>

      <p>
        This policy explains what personal information Stuviora collects, how we use it, and the rights you have under the Digital Personal Data Protection Act 2023.
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li><strong>Account data:</strong> name, email, role, college, stream, year, city.</li>
        <li><strong>Verification data:</strong> college email OTP, optional Aadhaar KYC for verified badge, PAN for tax compliance.</li>
        <li><strong>Work data:</strong> job briefs, proposals, deliverables, messages, ratings.</li>
        <li><strong>Payment data:</strong> Razorpay payment metadata, linked UPI or bank account for payouts. We do not store full card numbers.</li>
        <li><strong>Usage data:</strong> log events, device, IP address, and analytics events used to improve the product.</li>
      </ul>

      <h2>2. How we use it</h2>
      <ul>
        <li>To operate the marketplace, match jobs, run the AI quality gate, settle escrow, and pay students.</li>
        <li>To verify identity, prevent fraud, and meet tax obligations (GST invoices, TDS at applicable thresholds).</li>
        <li>To send transactional emails (OTPs, order updates, payout notices) and weekly earnings digests (opt-out at any time).</li>
      </ul>

      <h2>3. Sharing</h2>
      <p>
        We share data only with the processors required to run the platform: Supabase (database and auth), Razorpay (payments), Anthropic (AI quality gate), Resend (email), and Vercel (hosting). We do not sell personal data. We may disclose data when required by law.
      </p>

      <h2>4. Security</h2>
      <p>
        Sensitive fields (PAN, bank details) are encrypted at rest with AES-256 in Supabase Vault. Files are stored in private buckets accessed via signed URLs. We enforce row-level security on every database table; financial ledgers are reachable only by trusted server code.
      </p>

      <h2>5. Your rights under DPDP</h2>
      <ul>
        <li><strong>Access:</strong> request a copy of the personal data we hold about you.</li>
        <li><strong>Correction:</strong> update inaccurate profile or contact details directly in settings.</li>
        <li><strong>Erasure:</strong> close your account; we delete personal data within 30 days, except records we must retain for tax or legal compliance.</li>
        <li><strong>Withdraw consent:</strong> opt out of non-essential communications and analytics at any time.</li>
        <li><strong>Grievance:</strong> contact our grievance officer at privacy@stuviora.com.</li>
      </ul>

      <h2>6. Retention</h2>
      <p>
        Account data is retained for as long as your account is active. Financial records are kept for the period required by Indian tax law (currently 8 years). Anonymous analytics are kept indefinitely.
      </p>
    </>
  );
}
