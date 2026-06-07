import type {
  StudentProfile,
  ClientProfile,
  Job,
  Proposal,
  Order,
  Review,
  PortfolioItem,
  Conversation,
  Message,
  Dispute,
  AdminUser,
  AdminAction,
  PlatformMetrics,
  NotificationPreferences,
} from "@/lib/types";

export interface ServicePackage {
  tier: "basic" | "standard" | "premium";
  price: number;
  deliveryDays: number;
  description: string;
}

export interface ServiceListing {
  id: string;
  studentId: string;
  categorySlug: string;
  title: string;
  description: string;
  isActive: boolean;
  packages: ServicePackage[];
}

export interface WalletTransaction {
  id: string;
  date: string;
  description: string;
  amount: number; // positive = credit, negative = debit
  status: "settled" | "pending" | "failed";
}

export interface Wallet {
  studentId: string;
  available: number;
  pending: number;
  lifetime: number;
  upi: string;
  bankMasked: string;
  transactions: WalletTransaction[];
}

/**
 * Seeded demo dataset — powers the entire product before live keys exist.
 * "You" are `DEMO_STUDENT` or `DEMO_CLIENT` depending on the role you pick.
 */

export const DEMO_STUDENT_ID = "stu-you";
export const DEMO_CLIENT_ID = "cli-you";
export const DEMO_ADMIN_ID = "adm-you";
/** Zero-data student used to test the new-user empty-state UI. */
export const DEMO_NEW_STUDENT_ID = "stu-new";

export const admin = {
  id: DEMO_ADMIN_ID,
  fullName: "Founder",
  email: "founder@stuviora.com",
  avatarInitials: "SV",
} as const;

export const students: StudentProfile[] = [
  {
    id: DEMO_STUDENT_ID,
    fullName: "Aarav Mehta",
    username: "aaravmehta",
    avatarInitials: "AM",
    college: "IIT Bombay",
    stream: "Computer Science",
    city: "Mumbai",
    yearOfStudy: 3,
    headline: "Full-stack dev & automation. I ship fast.",
    bio: "3rd-year CS student. I build web apps, scrapers, and automations. Comfortable with React, Python, and APIs.",
    skills: ["React", "Next.js", "Python", "Automation", "APIs"],
    categorySlug: "tech-development",
    trustScore: 82,
    trustTier: "gold",
    rating: 4.8,
    reviewsCount: 11,
    jobsCompleted: 14,
    verified: true,
    hourlyFrom: 400,
    isAvailable: true,
    activeOrderCount: 1,
    medianResponseHours: 3,
  },
  {
    id: "stu-2",
    fullName: "Diya Sharma",
    username: "diyawrites",
    avatarInitials: "DS",
    college: "Lady Shri Ram College",
    stream: "English Literature",
    city: "Delhi",
    yearOfStudy: 2,
    headline: "Copywriter who makes brands sound human.",
    bio: "I write blogs, captions, and website copy that actually converts.",
    skills: ["Copywriting", "Blogs", "SEO", "Editing"],
    categorySlug: "content-copywriting",
    trustScore: 76,
    trustTier: "silver",
    rating: 4.9,
    reviewsCount: 23,
    jobsCompleted: 27,
    verified: true,
    hourlyFrom: 300,
    isAvailable: true,
    activeOrderCount: 0,
    medianResponseHours: 2,
  },
  {
    id: "stu-3",
    fullName: "Kabir Rao",
    username: "kabirdesigns",
    avatarInitials: "KR",
    college: "NID Ahmedabad",
    stream: "Communication Design",
    city: "Ahmedabad",
    yearOfStudy: 4,
    headline: "Brand and social design that stops the scroll.",
    bio: "Logos, social kits, decks. Figma native.",
    skills: ["Figma", "Branding", "Social design", "Illustration"],
    categorySlug: "design-creative",
    trustScore: 90,
    trustTier: "platinum",
    rating: 5.0,
    reviewsCount: 31,
    jobsCompleted: 38,
    verified: true,
    hourlyFrom: 500,
    isAvailable: true,
    activeOrderCount: 1,
    medianResponseHours: 4,
  },
  {
    id: "stu-4",
    fullName: "Ananya Iyer",
    username: "ananyadata",
    avatarInitials: "AI",
    college: "Christ University",
    stream: "Statistics",
    city: "Bengaluru",
    yearOfStudy: 3,
    headline: "Data analysis, dashboards, and research.",
    bio: "I turn messy spreadsheets into clear insights and dashboards.",
    skills: ["Excel", "Python", "Data viz", "Research"],
    categorySlug: "data-ai",
    trustScore: 68,
    trustTier: "silver",
    rating: 4.7,
    reviewsCount: 9,
    jobsCompleted: 10,
    verified: true,
    hourlyFrom: 350,
    isAvailable: true,
    activeOrderCount: 1,
    medianResponseHours: 5,
  },
  {
    id: "stu-5",
    fullName: "Rohan Gupta",
    username: "rohansocial",
    avatarInitials: "RG",
    college: "Symbiosis Pune",
    stream: "BBA Marketing",
    city: "Pune",
    yearOfStudy: 2,
    headline: "Social media manager for early-stage brands.",
    bio: "Content calendars, reels scripts, community management.",
    skills: ["Social media", "Reels", "Copy", "Canva"],
    categorySlug: "social-marketing",
    trustScore: 54,
    trustTier: "bronze",
    rating: 4.6,
    reviewsCount: 4,
    jobsCompleted: 5,
    verified: false,
    hourlyFrom: 250,
    isAvailable: false,
    activeOrderCount: 0,
    medianResponseHours: 9,
  },
  // Zero-data persona for new-user empty-state QA. Never matched.
  {
    id: DEMO_NEW_STUDENT_ID,
    fullName: "New Student",
    username: "newstudent",
    avatarInitials: "NS",
    college: "Christ University",
    stream: "Commerce",
    city: "Bengaluru",
    yearOfStudy: 1,
    headline: "",
    bio: "",
    skills: [],
    categorySlug: "tech-development",
    trustScore: 0,
    trustTier: "bronze",
    rating: 0,
    reviewsCount: 0,
    jobsCompleted: 0,
    verified: false,
    hourlyFrom: 200,
    isAvailable: true,
    activeOrderCount: 0,
    medianResponseHours: 0,
  },
];

export const clients: ClientProfile[] = [
  {
    id: DEMO_CLIENT_ID,
    fullName: "Priya Nair",
    companyName: "Brewhaus Coffee Co.",
    city: "Bengaluru",
    avatarInitials: "PN",
    jobsPosted: 3,
  },
  {
    id: "cli-2",
    fullName: "Vikram Singh",
    companyName: "Lumina SaaS",
    city: "Gurgaon",
    avatarInitials: "VS",
    jobsPosted: 7,
  },
];

export const jobs: Job[] = [
  {
    id: "job-1",
    clientId: "cli-2",
    title: "Write 4 blog posts on B2B SaaS onboarding",
    description:
      "We need 4 well-researched blog posts (1200–1500 words each) about SaaS user onboarding best practices. SEO-aware, friendly tone, with examples.",
    categorySlug: "content-copywriting",
    budgetMin: 6000,
    budgetMax: 10000,
    deadlineDays: 10,
    skills: ["Copywriting", "Blogs", "SEO"],
    status: "open",
    proposalsCount: 7,
    createdAgo: "2h ago",
  },
  {
    id: "job-2",
    clientId: DEMO_CLIENT_ID,
    title: "Instagram content kit for a coffee brand (10 posts)",
    description:
      "Design 10 on-brand Instagram posts + 3 reel cover templates for our specialty coffee brand. We'll share brand colors and a few photos.",
    categorySlug: "design-creative",
    budgetMin: 5000,
    budgetMax: 8000,
    deadlineDays: 7,
    skills: ["Figma", "Social design", "Branding"],
    status: "open",
    proposalsCount: 4,
    createdAgo: "1d ago",
  },
  {
    id: "job-3",
    clientId: "cli-2",
    title: "Build a Python script to clean & dedupe our CRM export",
    description:
      "We have a 40k-row CSV export with duplicates and inconsistent formatting. Need a documented Python script to clean, dedupe, and standardize it.",
    categorySlug: "tech-development",
    budgetMin: 4000,
    budgetMax: 7000,
    deadlineDays: 5,
    skills: ["Python", "Automation", "Data viz"],
    status: "open",
    proposalsCount: 9,
    createdAgo: "3h ago",
  },
  {
    id: "job-4",
    clientId: DEMO_CLIENT_ID,
    title: "Monthly sales dashboard in Google Sheets",
    description:
      "Set up an automated monthly sales dashboard with charts from our raw order data. Clean, presentable, easy for a non-technical team to read.",
    categorySlug: "data-ai",
    budgetMin: 3000,
    budgetMax: 5000,
    deadlineDays: 6,
    skills: ["Excel", "Data viz", "Research"],
    status: "open",
    proposalsCount: 3,
    createdAgo: "5h ago",
  },
];

export const proposals: Proposal[] = [
  {
    id: "prop-1",
    jobId: "job-1",
    studentId: "stu-2",
    coverLetter:
      "I write SaaS content regularly and can deliver SEO-aware drafts with examples. I'd start with an outline for your approval.",
    bidAmount: 8000,
    deliveryDays: 8,
    status: "submitted",
  },
  {
    id: "prop-2",
    jobId: "job-3",
    studentId: DEMO_STUDENT_ID,
    coverLetter:
      "I've built several CSV-cleaning pipelines in Python (pandas). I'll deliver a documented, re-runnable script plus a short Loom walkthrough.",
    bidAmount: 6000,
    deliveryDays: 4,
    status: "shortlisted",
  },
];

export const orders: Order[] = [
  {
    id: "SV-1042",
    jobId: "job-2",
    jobTitle: "Instagram content kit for a coffee brand (10 posts)",
    clientId: DEMO_CLIENT_ID,
    studentId: "stu-3",
    amount: 7000,
    status: "awaiting_approval",
    deadlineDays: 0,
    approvedAgo: "31h ago",
    createdAgo: "6d ago",
    aiReview: {
      score: 86,
      verdict: "PASS",
      briefAlignment: 36,
      completeness: 27,
      quality: 23,
      originality: 96,
      issues: ["Reel cover #2 text is slightly low-contrast on the photo."],
      suggestions: ["Tighten the caption on post 4 to one strong hook line."],
      reviewerNote: "Deliverable matches the brief and reads cleanly. Safe to deliver.",
    },
  },
  {
    id: "SV-1051",
    jobId: "job-4",
    jobTitle: "Monthly sales dashboard in Google Sheets",
    clientId: DEMO_CLIENT_ID,
    studentId: "stu-4",
    amount: 4500,
    status: "active",
    deadlineDays: 4,
    createdAgo: "1d ago",
  },
  {
    id: "SV-1039",
    jobId: "job-3",
    jobTitle: "Build a Python script to clean & dedupe our CRM export",
    clientId: "cli-2",
    studentId: DEMO_STUDENT_ID,
    amount: 6000,
    status: "active",
    deadlineDays: 3,
    createdAgo: "2d ago",
  },
  {
    id: "SV-1021",
    jobId: "job-1",
    jobTitle: "Landing page copy for a fintech app",
    clientId: "cli-2",
    studentId: DEMO_STUDENT_ID,
    amount: 5000,
    status: "completed",
    deadlineDays: 0,
    createdAgo: "3w ago",
    aiReview: {
      score: 91,
      verdict: "PASS",
      briefAlignment: 38,
      completeness: 28,
      quality: 25,
      originality: 99,
      issues: [],
      suggestions: [],
      reviewerNote: "Excellent — on-brief, original, and polished.",
    },
  },
];

export const reviews: Review[] = [
  {
    id: "rev-1",
    orderId: "SV-1021",
    reviewerName: "Vikram Singh · Lumina SaaS",
    rating: 5,
    comment: "Fast, sharp copy and great communication. Will hire again.",
    ago: "3w ago",
  },
  {
    id: "rev-2",
    orderId: "SV-1009",
    reviewerName: "Brewhaus Coffee Co.",
    rating: 5,
    comment: "Delivered ahead of deadline and nailed our tone.",
    ago: "1mo ago",
  },
];

export const portfolio: PortfolioItem[] = [
  {
    id: "pf-1",
    studentId: DEMO_STUDENT_ID,
    title: "Fintech landing page copy",
    problem: "A fintech app needed punchy, trustworthy landing copy.",
    approach: "Wrote 3 headline variants, hero, feature blocks, and CTAs.",
    outcome: "Client shipped it the same week; +18% signup CTR in their A/B test.",
    skills: ["Copywriting", "Conversion"],
  },
];

export const conversations: Conversation[] = [
  {
    id: "conv-1",
    orderId: "SV-1039",
    withName: "Vikram Singh",
    withInitials: "VS",
    lastMessage: "Great — the deduped sample looks right. Go ahead with the full run.",
    lastAgo: "20m ago",
    unread: 1,
  },
  {
    id: "conv-2",
    orderId: "SV-1051",
    withName: "Ananya Iyer",
    withInitials: "AI",
    lastMessage: "I'll share the first dashboard draft by tomorrow evening.",
    lastAgo: "2h ago",
    unread: 0,
  },
];

export const services: ServiceListing[] = [
  {
    id: "svc-1",
    studentId: DEMO_STUDENT_ID,
    categorySlug: "tech-development",
    title: "Python automation scripts for SMB workflows",
    description:
      "I'll build a documented Python script that automates your repetitive workflow: CSV cleaning, scraping, API glue, or report generation. Includes a short Loom walkthrough.",
    isActive: true,
    packages: [
      { tier: "basic", price: 2500, deliveryDays: 3, description: "Single small script, one input, one output" },
      { tier: "standard", price: 6000, deliveryDays: 5, description: "Multi-step pipeline with error handling and docs" },
      { tier: "premium", price: 12000, deliveryDays: 8, description: "Pipeline + scheduled run + Slack/email notification" },
    ],
  },
  {
    id: "svc-2",
    studentId: DEMO_STUDENT_ID,
    categorySlug: "tech-development",
    title: "Next.js landing page with one CMS-ready section",
    description:
      "A clean, responsive Next.js landing page tailored to your brief. Comes with one CMS-ready content section so non-devs can edit it.",
    isActive: true,
    packages: [
      { tier: "basic", price: 5000, deliveryDays: 4, description: "Static one-pager, mobile-responsive" },
      { tier: "standard", price: 10000, deliveryDays: 7, description: "Adds CMS section + contact form integration" },
      { tier: "premium", price: 18000, deliveryDays: 10, description: "Full mini-site (3 pages) + analytics setup" },
    ],
  },
];

export const wallet: Wallet = {
  studentId: DEMO_STUDENT_ID,
  available: 4250,
  pending: 5100,
  lifetime: 24750,
  upi: "aarav@okhdfcbank",
  bankMasked: "HDFC ****4421",
  transactions: [
    { id: "tx-1", date: "2 days ago", description: "Order SV-1021 payout (85%)", amount: 4250, status: "settled" },
    { id: "tx-2", date: "1 week ago", description: "Order SV-0998 payout", amount: 6800, status: "settled" },
    { id: "tx-3", date: "2 weeks ago", description: "Withdrawal to UPI", amount: -8000, status: "settled" },
    { id: "tx-4", date: "Just now", description: "Order SV-1039 (in escrow)", amount: 5100, status: "pending" },
    { id: "tx-5", date: "3 weeks ago", description: "Order SV-0942 payout", amount: 3200, status: "settled" },
  ],
};

export const messages: Message[] = [
  { id: "m1", conversationId: "conv-1", fromSelf: false, body: "Hi! Sharing a 500-row sample of the cleaned CRM data.", ago: "1h ago" },
  { id: "m2", conversationId: "conv-1", fromSelf: true, body: "Thanks — checking now.", ago: "45m ago" },
  { id: "m3", conversationId: "conv-1", fromSelf: false, body: "Great — the deduped sample looks right. Go ahead with the full run.", ago: "20m ago" },
];

// ---------------------------------------------------------------------------
// M4 — Trust, disputes, tax & admin
// ---------------------------------------------------------------------------

const in18h = new Date(Date.now() + 18 * 3600_000).toISOString();
const overdue = new Date(Date.now() - 5 * 3600_000).toISOString();

export const disputes: Dispute[] = [
  {
    id: "DSP-2007",
    orderId: "SV-1042",
    jobTitle: "Instagram content kit for a coffee brand (10 posts)",
    amount: 7000,
    raisedByRole: "client",
    raisedByName: "Priya Nair",
    clientName: "Priya Nair · Brewhaus Coffee Co.",
    studentName: "Kabir Rao",
    reason:
      "Three of the ten posts reuse the same layout, and the reel covers don't match the brand palette we shared.",
    status: "evidence_collection",
    resolution: "pending",
    deadlineISO: in18h,
    createdAgo: "1d ago",
    evidence: [
      {
        id: "ev-1",
        byName: "Priya Nair",
        byRole: "client",
        note: "Attaching our brand guide and screenshots of the three duplicate layouts.",
        fileName: "brand-guide.pdf",
        ago: "1d ago",
      },
      {
        id: "ev-2",
        byName: "Kabir Rao",
        byRole: "student",
        note: "The brief approved the layout system in our first call. Sharing the approved moodboard and chat.",
        fileName: "approved-moodboard.png",
        ago: "18h ago",
      },
    ],
  },
  {
    id: "DSP-1995",
    orderId: "SV-1039",
    jobTitle: "Build a Python script to clean & dedupe our CRM export",
    amount: 6000,
    raisedByRole: "student",
    raisedByName: "Aarav Mehta",
    clientName: "Vikram Singh · Lumina SaaS",
    studentName: "Aarav Mehta",
    reason:
      "Client keeps requesting features beyond the agreed brief and is withholding approval to get extra work for free.",
    status: "admin_review",
    resolution: "pending",
    deadlineISO: overdue,
    createdAgo: "3d ago",
    evidence: [
      {
        id: "ev-3",
        byName: "Aarav Mehta",
        byRole: "student",
        note: "Original brief vs. the six new requests added after delivery. Highlighted the scope creep.",
        fileName: "scope-diff.pdf",
        ago: "3d ago",
      },
      {
        id: "ev-4",
        byName: "Vikram Singh",
        byRole: "client",
        note: "The script errors on rows with empty phone fields. That was implied by 'clean the export'.",
        fileName: "error-log.txt",
        ago: "2d ago",
      },
    ],
  },
  {
    id: "DSP-1980",
    orderId: "SV-1009",
    jobTitle: "Brand logo + social kit",
    amount: 9000,
    raisedByRole: "client",
    raisedByName: "Vikram Singh",
    clientName: "Vikram Singh · Lumina SaaS",
    studentName: "Diya Sharma",
    reason: "Delivered files were low-resolution and missing the vector source.",
    status: "resolved",
    resolution: "partial",
    deadlineISO: null,
    resolvedNote:
      "Student delivered the vectors within 24h of the dispute. 80% released to student, 20% refunded for the delay.",
    createdAgo: "2w ago",
    evidence: [
      {
        id: "ev-5",
        byName: "Vikram Singh",
        byRole: "client",
        note: "No .svg/.ai files in the handover, only PNGs.",
        ago: "2w ago",
      },
      {
        id: "ev-6",
        byName: "Founder",
        byRole: "admin",
        note: "Vectors confirmed delivered late. Partial split applied.",
        ago: "12d ago",
      },
    ],
  },
];

export const adminUsers: AdminUser[] = [
  { id: "stu-3", name: "Kabir Rao", email: "kabir@nid.ac.in", role: "student", trustTier: "platinum", isActive: true, joinedAgo: "8mo ago", gmv: 342000 },
  { id: "stu-2", name: "Diya Sharma", email: "diya@lsr.du.ac.in", role: "student", trustTier: "silver", isActive: true, joinedAgo: "6mo ago", gmv: 198000 },
  { id: DEMO_STUDENT_ID, name: "Aarav Mehta", email: "aarav@iitb.ac.in", role: "student", trustTier: "gold", isActive: true, joinedAgo: "5mo ago", gmv: 156000 },
  { id: "stu-4", name: "Ananya Iyer", email: "ananya@christuniversity.in", role: "student", trustTier: "silver", isActive: true, joinedAgo: "3mo ago", gmv: 64000 },
  { id: "stu-5", name: "Rohan Gupta", email: "rohan@symbiosis.ac.in", role: "student", trustTier: "bronze", isActive: false, joinedAgo: "2mo ago", gmv: 21000 },
  { id: "cli-2", name: "Vikram Singh", email: "vikram@lumina.io", role: "client", isActive: true, joinedAgo: "7mo ago", gmv: 410000 },
  { id: DEMO_CLIENT_ID, name: "Priya Nair", email: "priya@brewhaus.in", role: "client", isActive: true, joinedAgo: "4mo ago", gmv: 88000 },
];

export const adminActions: AdminAction[] = [
  { id: "aa-1", adminName: "Founder", action: "Dispute resolved", target: "DSP-1980", reason: "Partial split — vectors delivered late", ago: "12d ago" },
  { id: "aa-2", adminName: "Founder", action: "Account suspended", target: "Rohan Gupta", reason: "Two unresolved late deliveries; pending review", ago: "9d ago" },
  { id: "aa-3", adminName: "Founder", action: "Payout override", target: "SV-0992", reason: "Razorpay transfer stuck; manual release approved", ago: "15d ago" },
  { id: "aa-4", adminName: "Founder", action: "Commission adjusted", target: "SV-0961", reason: "Goodwill — first-job money-back honored", ago: "20d ago" },
];

export interface TrustHistoryEntry {
  id: string;
  delta: number; // +/- points
  score: number; // resulting score
  reason: string;
  ago: string;
}

/** Recent trust-score movements for the signed-in demo student. */
export const trustHistory: TrustHistoryEntry[] = [
  { id: "th-1", delta: 2.4, score: 82, reason: "5★ review on SV-1021 (fintech copy)", ago: "3w ago" },
  { id: "th-2", delta: 1.1, score: 79.6, reason: "On-time delivery streak (4 orders)", ago: "1mo ago" },
  { id: "th-3", delta: -3.2, score: 78.5, reason: "AI gate failed on first attempt (SV-0998)", ago: "1mo ago" },
  { id: "th-4", delta: 4.0, score: 81.7, reason: "Reached 10 completed jobs", ago: "2mo ago" },
  { id: "th-5", delta: 1.8, score: 77.7, reason: "Fast response time this month (~3h median)", ago: "2mo ago" },
];

export const notificationPreferences: NotificationPreferences[] = [
  {
    userId: DEMO_STUDENT_ID,
    emailJobMatches: true,
    emailOrderUpdates: true,
    emailWeeklyDigest: true,
    emailMarketing: false,
  },
  {
    userId: DEMO_CLIENT_ID,
    emailJobMatches: false,
    emailOrderUpdates: true,
    emailWeeklyDigest: false,
    emailMarketing: false,
  },
];

export const platformMetrics: PlatformMetrics = {
  gmv: 1279000,
  revenueNet: 157300,
  gstCollected: 34520,
  tdsWithheld: 18650,
  activeOrders: 2,
  openDisputes: 2,
  students: 5,
  clients: 2,
  escrowHeld: 17500,
  dailyRevenue: [
    { day: "May 20", amount: 4200 },
    { day: "May 21", amount: 5100 },
    { day: "May 22", amount: 3800 },
    { day: "May 23", amount: 6400 },
    { day: "May 24", amount: 7100 },
    { day: "May 25", amount: 5600 },
    { day: "May 26", amount: 8200 },
    { day: "May 27", amount: 6900 },
    { day: "May 28", amount: 9300 },
    { day: "May 29", amount: 7400 },
    { day: "May 30", amount: 10200 },
    { day: "May 31", amount: 8800 },
    { day: "Jun 1", amount: 11400 },
    { day: "Jun 2", amount: 9600 },
  ],
};
