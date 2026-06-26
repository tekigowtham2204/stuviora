/** Domain constants for Stuviora - single source of truth for brand + taxonomy. */

export const BRAND = {
  name: "Stuviora",
  meaning: "Stu(dent) + Viora: through students, brilliance emerges",
  tagline: "Hire students. Trust the platform.",
  positioning:
    "India's trust-first student freelancing platform: escrow-protected payments, college-verified students, and an AI quality check backing every delivery.",
  domain: "stuviora.com",
  handle: "@stuviora",
} as const;

export const COMMISSION_RATE = 0.15;
export const AI_GATE_PASS_THRESHOLD = 70;
export const ESCROW_AUTO_RELEASE_HOURS = 72;
export const MAX_REVISIONS = 3;

/**
 * Originality below this routes the delivery to a human reviewer instead of
 * auto-rejecting it. The gate must never fail work for "looking AI-written":
 * AI-detection is unreliable and biased against non-native English writers,
 * so a low originality reading is a flag for a person to look, not a verdict.
 */
export const ORIGINALITY_REVIEW_THRESHOLD = 50;

/**
 * Variable-cost assumptions for the MODELED contribution margin shown on the
 * founder dashboard. These are estimates, not measured costs: the dashboard
 * labels the margin as modeled and prints these rates inline so the figure is
 * transparent rather than fabricated. Replace with measured costs once a real
 * cost ledger exists (principle: real numbers or an honest model, never a
 * number dressed up as measured when it is not).
 */
export const COST_ASSUMPTIONS = {
  /** Payment-gateway MDR on the full transaction amount (Razorpay estimate). */
  paymentProcessingRate: 0.02,
  /** LLM quality-gate cost per delivery, in rupees (estimate). */
  gateCostPerOrder: 2,
  /** Payout transfer fee per completed order, in rupees (estimate). */
  payoutFeePerOrder: 3,
} as const;

/** Service categories, mapped from "anything" to student streams. */
export const SERVICE_CATEGORIES = [
  {
    slug: "content-copywriting",
    name: "Content & copywriting",
    streams: "Literature · Journalism · Humanities",
    note: "Highest demand",
    tone: "trust",
  },
  {
    slug: "tech-development",
    name: "Tech & development",
    streams: "CS · IT · Engineering",
    note: "Highest value",
    tone: "info",
  },
  {
    slug: "design-creative",
    name: "Design & creative",
    streams: "Design · Fine arts · Architecture",
    note: "High visibility",
    tone: "brand",
  },
  {
    slug: "business-research",
    name: "Business & research",
    streams: "Commerce · MBA · Economics",
    note: "Underserved niche",
    tone: "warning",
  },
  {
    slug: "social-marketing",
    name: "Social media & marketing",
    streams: "All streams · Gen Z native skill",
    note: "Easy entry point",
    tone: "trust",
  },
  {
    slug: "data-ai",
    name: "Data & AI services",
    streams: "Statistics · Data Science · CS",
    note: "Future moat",
    tone: "info",
  },
] as const;

/** The five-layer trust architecture. */
export type TrustLayer = {
  n: number;
  title: string;
  q: string;
  desc: string;
  moat?: boolean;
};

export const TRUST_LAYERS: readonly TrustLayer[] = [
  {
    n: 1,
    title: "Identity trust",
    q: "Is this student real?",
    desc: "College-email OTP verification on signup. Optional Aadhaar-linked KYC badge. Every profile shows college, stream, city, and year.",
  },
  {
    n: 2,
    title: "Skill trust",
    q: "Can they actually do this?",
    desc: "Short AI-graded skill assessment before listing. Portfolio samples required. Imported Coursera / NPTEL badges.",
  },
  {
    n: 3,
    title: "Payment trust",
    q: "Will I get paid / not get scammed?",
    desc: "Razorpay escrow: client pays into escrow, student is paid only after approval. 72-hour auto-release if no dispute.",
  },
  {
    n: 4,
    title: "Quality trust",
    q: "Will the work be good?",
    desc: "AI quality gate before every delivery: completeness, coherence, brief alignment. Only passing work reaches the client.",
    moat: true,
  },
  {
    n: 5,
    title: "Track-record trust",
    q: "Has anyone hired them before?",
    desc: "First-job money-back guarantee. 'Verified Freelancer' badge after 3 jobs. Mandatory reviews on every delivery.",
  },
];

/** Trust-score tiers unlocked by completed work. */
export const TRUST_TIERS = [
  { name: "Bronze", min: 0, color: "#7A6957" },
  { name: "Silver", min: 60, color: "#6F6258" },
  { name: "Gold", min: 78, color: "#E9B04E" },
  { name: "Platinum", min: 90, color: "#8FA85A" },
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];
