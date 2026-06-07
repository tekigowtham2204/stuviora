import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import {
  Section,
  SectionEyebrow,
  SectionTitle,
  SectionLede,
} from "@/components/ui/section";

export const metadata = {
  title: "Help and FAQ",
  description:
    "Answers to the most common questions about how Stuviora works for students and clients: the AI quality gate, payments, escrow, taxes, disputes and trust tiers.",
};

interface QA {
  q: string;
  a: string;
}

const SECTIONS: { heading: string; items: QA[] }[] = [
  {
    heading: "Getting started",
    items: [
      {
        q: "Who can join Stuviora as a student?",
        a: "Any student with a recognised Indian college email on a .ac.in or .edu.in domain. We verify the email with a one-time code so clients know every freelancer is a real, enrolled student.",
      },
      {
        q: "Is it free to sign up?",
        a: "Yes. Creating an account, building a profile and bidding on jobs is free. Stuviora only earns when you do: we take a 15% platform fee out of each completed order.",
      },
      {
        q: "How long does it take to land a first job?",
        a: "It depends on your skills and how you pitch, but a complete profile with one work sample and a sharp proposal is the fastest path. The dashboard shows your next best action at each step.",
      },
    ],
  },
  {
    heading: "The AI quality gate",
    items: [
      {
        q: "What is the AI quality gate?",
        a: "Before any deliverable reaches the client, our AI reviews it against the original brief and scores it from 0 to 100. It checks completeness, whether the brief was answered and obvious quality issues. This is what makes a client trust a student they have never met.",
      },
      {
        q: "Does the AI write my work for me?",
        a: "No. The AI never produces your deliverable. It only reviews what you submit and drafts a starting proposal you edit yourself. The work, and the credit, stays yours.",
      },
      {
        q: "What happens if my submission does not pass?",
        a: "You get the specific issues the gate found and a chance to fix and resubmit. You have up to three revisions per order, and the attempt counter is shown on the submit screen.",
      },
    ],
  },
  {
    heading: "Payments and payouts",
    items: [
      {
        q: "How do payments work?",
        a: "When a client hires you, they fund a Razorpay escrow upfront. The money is held safely until you deliver. On approval you receive 85% of the order value; Stuviora keeps 15%.",
      },
      {
        q: "When do I get paid?",
        a: "As soon as the client approves your delivery. If they do not respond within 72 hours of a passing submission, the payment auto-releases to you so you are never left waiting.",
      },
      {
        q: "How do I withdraw my earnings?",
        a: "Add your bank account or UPI ID on the payouts page, then withdraw your cleared balance any time. The minimum payout is Rs.100.",
      },
      {
        q: "What about taxes and TDS?",
        a: "We handle GST on the platform fee and apply TDS where the law requires it once your earnings cross the annual threshold. Your tax page shows a running summary and downloadable statements.",
      },
    ],
  },
  {
    heading: "Trust, disputes and safety",
    items: [
      {
        q: "What are trust tiers?",
        a: "Your trust score reflects your AI pass rate, on-time delivery, reviews and completed orders. Higher tiers (bronze through platinum) unlock larger jobs and rank you higher in client search.",
      },
      {
        q: "What if a client and I disagree on a delivery?",
        a: "Open a dispute from the order. Both sides submit evidence and our team reviews it against the brief and the AI score. Funds stay in escrow until the dispute is resolved.",
      },
      {
        q: "What if I miss a deadline?",
        a: "Message the client early; most are flexible when they hear from you. Repeated late or missed deliveries lower your trust score, so communication is always the better move.",
      },
      {
        q: "How do I report a problem with a client?",
        a: "Use the report option on the profile or message thread. Reports go straight to our admin queue and are reviewed quickly. Your safety on campus and online comes first.",
      },
    ],
  },
  {
    heading: "For clients",
    items: [
      {
        q: "Why hire students through Stuviora?",
        a: "You get motivated, verified college talent at fair rates, with every deliverable passing an AI quality check before it reaches you and your payment protected in escrow until you approve.",
      },
      {
        q: "What if the work is not good enough?",
        a: "The AI gate catches most issues before delivery. If something still misses the mark, you can request a revision, and if it cannot be resolved you can open a dispute while your funds stay protected.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <>
      <Section spacing="tight" tone="warm">
        <Container>
          <SectionEyebrow>Help center</SectionEyebrow>
          <SectionTitle as="h1">Questions, answered.</SectionTitle>
          <SectionLede>
            Everything a first-timer asks before their first job, and what
            experienced freelancers want to confirm. Still stuck? Reach out and
            we will help.
          </SectionLede>
        </Container>
      </Section>

      <Section spacing="default">
        <Container className="max-w-3xl">
          <div className="space-y-12">
            {SECTIONS.map((section) => (
              <div key={section.heading}>
                <h2 className="font-display text-xl font-medium tracking-tight text-[var(--color-ink)]">
                  {section.heading}
                </h2>
                <div className="mt-4 divide-y divide-[var(--color-line)] rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
                  {section.items.map((item) => (
                    <details key={item.q} className="group px-5">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium text-[var(--color-ink)] [&::-webkit-details-marker]:hidden">
                        {item.q}
                        <ChevronDown
                          className="h-4 w-4 shrink-0 text-[var(--color-ink-muted)] transition-transform group-open:rotate-180"
                          aria-hidden
                        />
                      </summary>
                      <p className="pb-4 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                        {item.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-[var(--radius-card)] border border-[var(--color-sage-200)] bg-[var(--color-sage-50)] p-8 text-center">
            <h2 className="font-display text-xl font-medium tracking-tight text-[var(--color-ink)]">
              Still have a question?
            </h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Our team reads every message. We usually reply within a day.
            </p>
            <Button href="/about" variant="sage" className="mt-5">
              Learn more about Stuviora
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
