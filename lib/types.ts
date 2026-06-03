/** Domain model types shared across the app (demo + live). */

export type Role = "student" | "client" | "admin" | "university";
export type TrustTier = "bronze" | "silver" | "gold" | "platinum";

export type OrderStatus =
  | "pending_payment"
  | "active"
  | "submitted"
  | "in_ai_review"
  | "awaiting_approval"
  | "revision_requested"
  | "completed"
  | "disputed"
  | "refunded"
  | "cancelled";

export type JobStatus = "draft" | "open" | "in_review" | "awarded" | "closed" | "cancelled";
export type ProposalStatus = "submitted" | "shortlisted" | "accepted" | "rejected" | "withdrawn";
export type AiVerdict = "PASS" | "FAIL";

export type DisputeStatus = "open" | "evidence_collection" | "admin_review" | "resolved";
export type DisputeResolution = "pending" | "client_favour" | "student_favour" | "partial";

export interface StudentProfile {
  id: string;
  fullName: string;
  username: string;
  avatarInitials: string;
  college: string;
  stream: string;
  city: string;
  yearOfStudy: number;
  headline: string;
  bio: string;
  skills: string[];
  categorySlug: string;
  trustScore: number;
  trustTier: TrustTier;
  rating: number;
  reviewsCount: number;
  jobsCompleted: number;
  verified: boolean;
  hourlyFrom: number;
}

export interface ClientProfile {
  id: string;
  fullName: string;
  companyName: string;
  city: string;
  avatarInitials: string;
  jobsPosted: number;
}

export interface Job {
  id: string;
  clientId: string;
  title: string;
  description: string;
  categorySlug: string;
  budgetMin: number;
  budgetMax: number;
  deadlineDays: number;
  skills: string[];
  status: JobStatus;
  proposalsCount: number;
  createdAgo: string;
}

export interface Proposal {
  id: string;
  jobId: string;
  studentId: string;
  coverLetter: string;
  bidAmount: number;
  deliveryDays: number;
  status: ProposalStatus;
}

export interface AiReview {
  score: number;
  verdict: AiVerdict;
  briefAlignment: number; // /40
  completeness: number; // /30
  quality: number; // /30
  originality: number; // /100
  issues: string[];
  suggestions: string[];
  reviewerNote: string;
}

export interface Order {
  id: string;
  jobId: string;
  jobTitle: string;
  clientId: string;
  studentId: string;
  amount: number;
  status: OrderStatus;
  deadlineDays: number;
  aiReview?: AiReview;
  approvedAgo?: string; // for 72h countdown display
  createdAgo: string;
}

export interface Review {
  id: string;
  orderId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  ago: string;
}

export interface PortfolioItem {
  id: string;
  studentId: string;
  title: string;
  problem: string;
  approach: string;
  outcome: string;
  skills: string[];
}

export interface DisputeEvidence {
  id: string;
  byName: string;
  byRole: "client" | "student" | "admin";
  note: string;
  fileName?: string;
  ago: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  jobTitle: string;
  amount: number;
  raisedByRole: "client" | "student";
  raisedByName: string;
  clientName: string;
  studentName: string;
  reason: string;
  status: DisputeStatus;
  resolution: DisputeResolution;
  /** ISO timestamp the current stage escalates at (48h timer). */
  deadlineISO: string | null;
  resolvedNote?: string;
  evidence: DisputeEvidence[];
  createdAgo: string;
}

/** A row in the admin user-management table. */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  trustTier?: TrustTier;
  isActive: boolean;
  joinedAgo: string;
  gmv: number; // lifetime value transacted
}

/** An immutable entry in the admin audit trail. */
export interface AdminAction {
  id: string;
  adminName: string;
  action: string;
  target: string;
  reason: string;
  ago: string;
}

/** Platform-wide metrics for the founder dashboard. */
export interface PlatformMetrics {
  gmv: number;
  revenueNet: number;
  gstCollected: number;
  tdsWithheld: number;
  activeOrders: number;
  openDisputes: number;
  students: number;
  clients: number;
  escrowHeld: number;
  /** Last 14 days of daily revenue for the sparkline. */
  dailyRevenue: { day: string; amount: number }[];
}

export interface Conversation {
  id: string;
  orderId: string;
  withName: string;
  withInitials: string;
  lastMessage: string;
  lastAgo: string;
  unread: number;
}

export interface Message {
  id: string;
  conversationId: string;
  fromSelf: boolean;
  body: string;
  ago: string;
}
