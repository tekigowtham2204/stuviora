export const metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <>
      <h1>Terms of service</h1>
      <p className="meta">Last updated: June 2026</p>

      <p>
        Stuviora is a marketplace that connects college students in India with clients who want to hire them for freelance work. By creating an account or using the platform, you agree to these terms.
      </p>

      <h2>1. Eligibility</h2>
      <p>
        Students must be currently enrolled in a recognised Indian college or university and sign up using a verified institutional email. Clients must be 18 years or older, or a registered business. Stuviora reserves the right to refuse service or remove accounts that violate eligibility or local laws.
      </p>

      <h2>2. The platform&apos;s role</h2>
      <p>
        Stuviora is a marketplace and escrow facilitator. We are not an employer of students and not a party to the work agreement itself. We do, however, hold funds in escrow, run automated quality checks on deliverables, and mediate disputes in good faith.
      </p>

      <h2>3. Payments, fees, and escrow</h2>
      <p>
        Clients pay the full job amount into Razorpay-managed escrow at the time of hire. On approval (or 72 hours after the AI gate passes a delivery, whichever is sooner), the funds split as follows:
      </p>
      <ul>
        <li><strong>85%</strong> to the student, via their linked UPI or bank account.</li>
        <li><strong>15%</strong> commission to Stuviora.</li>
        <li>GST and TDS are applied per Indian law where applicable.</li>
      </ul>

      <h2>4. The AI quality gate</h2>
      <p>
        Every delivery is reviewed by an AI quality gate before the client sees it. The gate scores work for completeness, alignment to the brief, and originality. Submissions that fail are returned to the student with specific fixes. The AI is a tool to protect both sides; it is not an arbiter of taste, and the client retains final say on acceptance.
      </p>

      <h2>5. Disputes</h2>
      <p>
        If a client and student cannot agree on acceptance, either party may open a dispute within the order. Stuviora&apos;s admin team reviews evidence from both sides within 48 hours and resolves the matter. Commission is held until resolution and may be partially or fully reversed.
      </p>

      <h2>6. Prohibited use</h2>
      <ul>
        <li>Off-platform payments or attempts to bypass Stuviora&apos;s escrow and commission.</li>
        <li>Plagiarised or fully AI-generated work passed off as the student&apos;s own.</li>
        <li>Misrepresentation of identity, college, or skills.</li>
        <li>Any use that violates Indian law or third-party rights.</li>
      </ul>

      <h2>7. Limitation of liability</h2>
      <p>
        Stuviora&apos;s liability is limited to the platform commission collected on the order in question. We are not liable for indirect damages, lost profits, or consequential losses arising from a freelance engagement.
      </p>

      <h2>8. Changes to these terms</h2>
      <p>
        We may update these terms from time to time. Material changes will be communicated via email and an in-app notice at least 14 days before they take effect.
      </p>
    </>
  );
}
