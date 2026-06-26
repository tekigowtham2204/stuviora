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
        Stuviora is a marketplace and payment facilitator. We are not an employer of students and not a party to the work agreement itself. We do, however, authorize and capture payments, run automated quality checks on deliverables, and resolve disputes through automated policy. Stuviora operates without manual reviewers or mediators.
      </p>

      <h2>3. Payments, fees, and the pay-on-delivery model</h2>
      <p>
        At the time of hire, the client authorizes the full job amount through Razorpay as a hold; nothing is charged yet. The charge (capture) happens automatically when the AI quality gate passes a delivery, so the client pays on receipt of quality-checked work. If the work cannot pass the gate after its revision attempts, the authorization is voided and the client is not charged. Once captured, the funds split as follows:
      </p>
      <ul>
        <li><strong>85%</strong> to the student, via their linked UPI or bank account.</li>
        <li><strong>15%</strong> commission to Stuviora.</li>
        <li>GST and TDS are applied per Indian law where applicable.</li>
      </ul>

      <h2>4. The AI quality gate</h2>
      <p>
        Every delivery is reviewed by an AI quality gate before the client sees it. The gate scores the quality of the work for completeness, alignment to the brief, and originality, and is the automated acceptance step: passing work is delivered and charged, failing work is returned to the student with specific fixes. There is no human reviewer.
      </p>

      <h2>5. Disputes</h2>
      <p>
        After delivery the client has a 72-hour window. Within it, the client may request a fix: the capture is refunded and the student reworks the delivery through the gate, with the client charged again only if it passes. Work that fails the gate past its final revision is refunded automatically. Resolution is by automated policy, not staff mediation.
      </p>

      <h2>6. Prohibited use</h2>
      <ul>
        <li>Off-platform payments or attempts to bypass Stuviora&apos;s payment flow and commission.</li>
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
