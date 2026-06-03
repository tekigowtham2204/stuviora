export const metadata = { title: "Refund policy" };

export default function RefundPolicyPage() {
  return (
    <>
      <h1>Refund policy</h1>
      <p className="meta">Last updated: June 2026</p>

      <p>
        Stuviora&apos;s escrow model is designed so neither side loses money to the other&apos;s bad faith. Funds remain locked until the work is delivered, AI-reviewed, and accepted (or auto-released after 72 hours).
      </p>

      <h2>First-job money-back guarantee</h2>
      <p>
        If your <strong>first hire</strong> on Stuviora delivers work that fails our AI quality gate three times, or that the gate explicitly flags as plagiarised or AI-generated without disclosure, you receive a full refund of the job amount, no questions asked. The student receives clear feedback and is suspended from accepting new jobs pending review.
      </p>

      <h2>Standard refunds</h2>
      <ul>
        <li><strong>Before work starts:</strong> if a student does not begin work within 48 hours of the order being created, you can cancel for a full refund.</li>
        <li><strong>During work:</strong> you may request a refund by opening a dispute. An admin reviews evidence within 48 hours and may issue a full or partial refund based on work completed.</li>
        <li><strong>After delivery:</strong> approval is final, but you have a 72-hour review window in which to approve or request revisions.</li>
      </ul>

      <h2>How refunds are processed</h2>
      <p>
        Refunds are issued through Razorpay to the original payment method. UPI and netbanking refunds typically settle in 2 to 5 business days; cards in 5 to 7 business days. Where the platform commission was already settled, it is reversed alongside the refund.
      </p>

      <h2>Out of scope</h2>
      <p>
        Refunds are not available for: completed work that the client approved, changes in scope that the client requested mid-job, or cancellations attributable solely to the client&apos;s inaction beyond the 72-hour window.
      </p>
    </>
  );
}
