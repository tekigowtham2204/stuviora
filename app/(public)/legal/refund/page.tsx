export const metadata = { title: "Refund policy" };

export default function RefundPolicyPage() {
  return (
    <>
      <h1>Refund policy</h1>
      <p className="meta">Last updated: June 2026</p>

      <p>
        Stuviora&apos;s pay-on-delivery model is designed so neither side loses money to the other&apos;s bad faith. Your payment is only a hold until the work is delivered and passes the AI gate; you are charged on delivery, and work that never passes is never charged.
      </p>

      <h2>First-job money-back guarantee</h2>
      <p>
        If your <strong>first hire</strong> on Stuviora delivers work that fails our AI quality gate three times, the held authorization is voided and you are charged nothing, automatically. The student receives clear feedback and is suspended from accepting new jobs pending review.
      </p>

      <h2>Standard refunds</h2>
      <ul>
        <li><strong>Before delivery:</strong> if a student does not begin work within 48 hours, the authorization is released and you are charged nothing.</li>
        <li><strong>Fails the gate:</strong> work that cannot pass the AI gate after its revision attempts is never captured, so there is nothing to refund.</li>
        <li><strong>After delivery:</strong> you have a 72-hour window to request a fix. Doing so refunds the capture while the student reworks it through the gate; you are charged again only if the new delivery passes.</li>
      </ul>

      <h2>How refunds are processed</h2>
      <p>
        Refunds are issued through Razorpay to the original payment method. UPI and netbanking refunds typically settle in 2 to 5 business days; cards in 5 to 7 business days. Where the platform commission was already settled, it is reversed alongside the refund.
      </p>

      <h2>Out of scope</h2>
      <p>
        Refunds are not available for: delivered work whose 72-hour window has passed, changes in scope that the client requested mid-job, or charges that have already settled to the student after the dispute window.
      </p>
    </>
  );
}
