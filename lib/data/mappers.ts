/**
 * Supabase row -> domain type mappers (Phase P1).
 *
 * Each mapper is the single place that bridges a snake_case DB row to a
 * camelCase domain type from `lib/types.ts`. Query functions in
 * `lib/data/queries.ts` call these so the same shape lands at the UI
 * whether the data came from `lib/demo/data.ts` or live Supabase.
 *
 * Rules:
 *   1. Mappers are pure. No I/O, no env reads.
 *   2. They must handle nullable columns gracefully. Demo data always
 *      has a value; live data may not.
 *   3. They derive client-visible fields (initials, ago-format) so the
 *      DB never has to store presentation state.
 *
 * For convenience, each row type is the *minimum shape* the mapper
 * needs, not the full DB row. Joins happen in queries; mappers see a
 * pre-shaped object.
 */

import type {
  ClientProfile,
  Conversation,
  Job,
  Message,
  Order,
  PortfolioItem,
  Proposal,
  Review,
  StudentProfile,
  TrustTier,
  AdminAction,
} from "@/lib/types";
import type { ServiceListing, ServicePackage } from "@/lib/demo/data";
import type { TrustHistoryEntry } from "@/lib/demo/data";

// ---------------------------------------------------------------------------
// Row shapes (minimum needed; queries may pass joined extras)
// ---------------------------------------------------------------------------

export interface StudentJoinedRow {
  // From users
  id: string;
  full_name: string | null;
  // From student_profiles
  username: string | null;
  stream: string | null;
  city: string | null;
  year_of_study: number | null;
  headline: string | null;
  bio: string | null;
  trust_score: number | string;
  trust_tier: TrustTier;
  jobs_completed: number;
  is_available: boolean;
  kyc: "none" | "pending" | "verified" | "rejected";
  // From colleges (left join)
  college_name?: string | null;
  // From service_listings + skill_tags (aggregated)
  category_slug?: string | null;
  skills?: string[] | null;
  hourly_from?: number | null;
  // From reviews aggregate
  rating_avg?: number | null;
  rating_count?: number | null;
  // From orders aggregate
  active_order_count?: number | null;
  median_response_hours?: number | null;
}

export interface ClientJoinedRow {
  id: string;
  full_name: string | null;
  company_name: string | null;
  city: string | null;
  jobs_posted: number;
}

export interface JobJoinedRow {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category_slug: string;
  budget_min: number | string;
  budget_max: number | string;
  deadline_days: number;
  status: Job["status"];
  proposals_count: number;
  created_at: string;
  // Aggregated
  skills?: string[] | null;
}

export interface ProposalRow {
  id: string;
  job_id: string;
  student_id: string;
  cover_letter: string;
  bid_amount: number | string;
  delivery_days: number;
  status: Proposal["status"];
}

export interface OrderJoinedRow {
  id: string;
  job_id: string;
  client_id: string;
  student_id: string;
  amount: number | string;
  status: Order["status"];
  deadline_days: number;
  created_at: string;
  approved_at?: string | null;
  // Joined
  job_title: string;
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

export function studentFromRow(row: StudentJoinedRow): StudentProfile {
  const fullName = row.full_name ?? "Student";
  return {
    id: row.id,
    fullName,
    username: row.username ?? row.id.slice(0, 8),
    avatarInitials: initialsOf(fullName),
    college: row.college_name ?? "Unverified",
    stream: row.stream ?? "Student",
    city: row.city ?? "India",
    yearOfStudy: row.year_of_study ?? 1,
    headline: row.headline ?? "",
    bio: row.bio ?? "",
    skills: row.skills ?? [],
    categorySlug: row.category_slug ?? "tech-development",
    trustScore: asNumber(row.trust_score),
    trustTier: row.trust_tier,
    rating: row.rating_avg != null ? round1(asNumber(row.rating_avg)) : 0,
    reviewsCount: row.rating_count ?? 0,
    jobsCompleted: row.jobs_completed,
    verified: row.kyc === "verified",
    hourlyFrom: row.hourly_from ?? 200,
    isAvailable: row.is_available,
    activeOrderCount: row.active_order_count ?? 0,
    medianResponseHours: row.median_response_hours ?? undefined,
  };
}

export function clientFromRow(row: ClientJoinedRow): ClientProfile {
  const fullName = row.full_name ?? "Client";
  return {
    id: row.id,
    fullName,
    companyName: row.company_name ?? fullName,
    city: row.city ?? "India",
    avatarInitials: initialsOf(row.company_name ?? fullName),
    jobsPosted: row.jobs_posted,
  };
}

export function jobFromRow(row: JobJoinedRow): Job {
  return {
    id: row.id,
    clientId: row.client_id,
    title: row.title,
    description: row.description,
    categorySlug: row.category_slug,
    budgetMin: asNumber(row.budget_min),
    budgetMax: asNumber(row.budget_max),
    deadlineDays: row.deadline_days,
    skills: row.skills ?? [],
    status: row.status,
    proposalsCount: row.proposals_count,
    createdAgo: agoOf(row.created_at),
  };
}

export function proposalFromRow(row: ProposalRow): Proposal {
  return {
    id: row.id,
    jobId: row.job_id,
    studentId: row.student_id,
    coverLetter: row.cover_letter,
    bidAmount: asNumber(row.bid_amount),
    deliveryDays: row.delivery_days,
    status: row.status,
  };
}

export function orderFromRow(row: OrderJoinedRow): Order {
  return {
    id: row.id,
    jobId: row.job_id,
    jobTitle: row.job_title,
    clientId: row.client_id,
    studentId: row.student_id,
    amount: asNumber(row.amount),
    status: row.status,
    deadlineDays: row.deadline_days,
    createdAgo: agoOf(row.created_at),
    approvedAgo: row.approved_at ? agoOf(row.approved_at) : undefined,
  };
}

// ---------------------------------------------------------------------------
// More row shapes + mappers (reviews, portfolio, conversations, messages,
// services, admin actions, trust history)
// ---------------------------------------------------------------------------

export interface ReviewJoinedRow {
  id: string;
  order_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  /** From joined client_profile.company_name + users.full_name. */
  reviewer_name: string;
}

export function reviewFromRow(row: ReviewJoinedRow): Review {
  return {
    id: row.id,
    orderId: row.order_id,
    reviewerName: row.reviewer_name,
    rating: row.rating,
    comment: row.comment ?? "",
    ago: agoOf(row.created_at),
  };
}

export interface PortfolioRow {
  id: string;
  student_id: string;
  title: string | null;
  problem: string | null;
  approach: string | null;
  outcome: string | null;
  skills: string[] | null;
}

export function portfolioFromRow(row: PortfolioRow): PortfolioItem {
  return {
    id: row.id,
    studentId: row.student_id,
    title: row.title ?? "Untitled",
    problem: row.problem ?? "",
    approach: row.approach ?? "",
    outcome: row.outcome ?? "",
    skills: row.skills ?? [],
  };
}

export interface ConversationJoinedRow {
  id: string;
  order_id: string | null;
  last_message_at: string | null;
  /** Joined "the other party" name + initials. Resolved at query time. */
  with_name: string;
  with_initials: string;
  last_message: string | null;
  unread_count: number;
}

export function conversationFromRow(row: ConversationJoinedRow): Conversation {
  return {
    id: row.id,
    orderId: row.order_id ?? "",
    withName: row.with_name,
    withInitials: row.with_initials,
    lastMessage: row.last_message ?? "",
    lastAgo: row.last_message_at ? agoOf(row.last_message_at) : "",
    unread: row.unread_count,
  };
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string | null;
  created_at: string;
}

export function messageFromRow(row: MessageRow, selfUserId: string): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    fromSelf: row.sender_id === selfUserId,
    body: row.body ?? "",
    ago: agoOf(row.created_at),
  };
}

export interface ServiceJoinedRow {
  id: string;
  student_id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  category_slug: string;
  /** Joined service_packages, ordered basic -> standard -> premium. */
  packages: Array<{
    tier: "basic" | "standard" | "premium";
    price: number | string;
    delivery_days: number;
    description: string | null;
  }>;
}

export function serviceFromRow(row: ServiceJoinedRow): ServiceListing {
  const packages: ServicePackage[] = row.packages.map((p) => ({
    tier: p.tier,
    price: asNumber(p.price),
    deliveryDays: p.delivery_days,
    description: p.description ?? "",
  }));
  return {
    id: row.id,
    studentId: row.student_id,
    categorySlug: row.category_slug,
    title: row.title,
    description: row.description ?? "",
    isActive: row.is_active,
    packages,
  };
}

export interface AdminActionRow {
  id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  reason: string;
  created_at: string;
  admin_name: string;
}

export function adminActionFromRow(row: AdminActionRow): AdminAction {
  return {
    id: row.id,
    adminName: row.admin_name,
    action: row.action,
    target: row.target_id ?? row.target_type ?? "",
    reason: row.reason,
    ago: agoOf(row.created_at),
  };
}

export interface TrustHistoryRow {
  id: string;
  score: number | string;
  delta: number | string;
  reason: string | null;
  created_at: string;
}

export function trustHistoryFromRow(row: TrustHistoryRow): TrustHistoryEntry {
  return {
    id: row.id,
    delta: asNumber(row.delta),
    score: asNumber(row.score),
    reason: row.reason ?? "",
    ago: agoOf(row.created_at),
  };
}

// ---------------------------------------------------------------------------
// Helpers (kept here so query files don't need their own copies)
// ---------------------------------------------------------------------------

export function initialsOf(name: string): string {
  const parts = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return "?";
  return parts.map((p) => p[0]!.toUpperCase()).join("");
}

export function asNumber(v: number | string): number {
  return typeof v === "number" ? v : Number(v);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Loose "x ago" formatter. Live data uses a timestamp; we render a
 * relative string. Localized to en-IN.
 */
export function agoOf(iso: string, now = new Date()): string {
  const t = new Date(iso).getTime();
  const diffSec = Math.max(0, Math.floor((now.getTime() - t) / 1000));
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  const diffWk = Math.floor(diffDay / 7);
  if (diffWk < 4) return `${diffWk}w ago`;
  const diffMo = Math.floor(diffDay / 30);
  if (diffMo < 12) return `${diffMo}mo ago`;
  const diffYr = Math.floor(diffDay / 365);
  return `${diffYr}y ago`;
}
