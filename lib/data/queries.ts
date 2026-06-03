import "server-only";
import * as demo from "@/lib/demo/data";
import type { Dispute, Job, Order, Proposal, StudentProfile } from "@/lib/types";
import { computeTrustScore, type TrustSignals } from "@/lib/trust/score";

/**
 * Data access layer. Returns seeded demo data today; each function is the
 * single place to swap in a Supabase query when live keys are added
 * (branch on DEMO_MODE / services.supabase).
 */

export async function listStudents(filters?: {
  category?: string;
  q?: string;
}): Promise<StudentProfile[]> {
  let rows = demo.students;
  if (filters?.category) rows = rows.filter((s) => s.categorySlug === filters.category);
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.headline.toLowerCase().includes(q) ||
        s.skills.some((k) => k.toLowerCase().includes(q))
    );
  }
  return rows;
}

export async function getStudentByUsername(username: string) {
  return demo.students.find((s) => s.username === username) ?? null;
}

export async function getStudentById(id: string) {
  return demo.students.find((s) => s.id === id) ?? null;
}

export async function getClientById(id: string) {
  return demo.clients.find((c) => c.id === id) ?? null;
}

export async function listOpenJobs(filters?: { category?: string }): Promise<Job[]> {
  let rows = demo.jobs.filter((j) => j.status === "open");
  if (filters?.category) rows = rows.filter((j) => j.categorySlug === filters.category);
  return rows;
}

export async function getJob(id: string) {
  return demo.jobs.find((j) => j.id === id) ?? null;
}

export async function listClientJobs(clientId: string): Promise<Job[]> {
  return demo.jobs.filter((j) => j.clientId === clientId);
}

export async function listJobProposals(jobId: string): Promise<Proposal[]> {
  return demo.proposals.filter((p) => p.jobId === jobId);
}

export async function listStudentProposals(studentId: string): Promise<Proposal[]> {
  return demo.proposals.filter((p) => p.studentId === studentId);
}

export async function listStudentOrders(studentId: string): Promise<Order[]> {
  return demo.orders.filter((o) => o.studentId === studentId);
}

export async function listClientOrders(clientId: string): Promise<Order[]> {
  return demo.orders.filter((o) => o.clientId === clientId);
}

export async function getOrder(id: string) {
  return demo.orders.find((o) => o.id === id) ?? null;
}

export async function listReviewsForStudent() {
  return demo.reviews;
}

export async function listPortfolio(studentId: string) {
  return demo.portfolio.filter((p) => p.studentId === studentId);
}

export async function listConversations() {
  return demo.conversations;
}

export async function getConversation(id: string) {
  const convo = demo.conversations.find((c) => c.id === id) ?? null;
  const msgs = demo.messages.filter((m) => m.conversationId === id);
  return convo ? { convo, msgs } : null;
}

export async function listServicesByStudent(studentId: string) {
  return demo.services.filter((s) => s.studentId === studentId);
}

export async function getService(id: string) {
  return demo.services.find((s) => s.id === id) ?? null;
}

export async function getStudentWallet() {
  return demo.wallet;
}

// ---------------------------------------------------------------------------
// M4 — disputes
// ---------------------------------------------------------------------------

export async function listDisputes(): Promise<Dispute[]> {
  return demo.disputes;
}

/** Disputes a given user is party to (as client or student). */
export async function listDisputesForUser(userId: string): Promise<Dispute[]> {
  const student = demo.students.find((s) => s.id === userId);
  const client = demo.clients.find((c) => c.id === userId);
  return demo.disputes.filter((d) => {
    if (student && d.studentName === student.fullName) return true;
    if (client && d.clientName.startsWith(client.fullName)) return true;
    return false;
  });
}

export async function getDispute(id: string): Promise<Dispute | null> {
  return demo.disputes.find((d) => d.id === id) ?? null;
}

/** Open disputes ordered most-escalated first, for the admin queue. */
export async function listDisputeQueue(): Promise<Dispute[]> {
  return demo.disputes
    .filter((d) => d.status !== "resolved")
    .sort((a, b) => {
      const at = a.deadlineISO ? new Date(a.deadlineISO).getTime() : Infinity;
      const bt = b.deadlineISO ? new Date(b.deadlineISO).getTime() : Infinity;
      return at - bt;
    });
}

// ---------------------------------------------------------------------------
// M4 — trust score
// ---------------------------------------------------------------------------

/** Derive trust signals for a student from their (demo) history. */
export async function getTrustBreakdown(studentId: string) {
  const s = demo.students.find((p) => p.id === studentId);
  if (!s) return null;
  // Demo: synthesize plausible signals from the profile's headline stats.
  const onTimeRate = Math.min(1, 0.8 + (s.trustScore - 50) / 200);
  const aiPassRate = Math.min(1, 0.75 + (s.trustScore - 50) / 180);
  const signals: TrustSignals = {
    avgRating: s.rating,
    reviewsCount: s.reviewsCount,
    ordersDelivered: s.jobsCompleted,
    ordersOnTime: Math.round(s.jobsCompleted * onTimeRate),
    aiSubmissions: s.jobsCompleted,
    aiFirstPass: Math.round(s.jobsCompleted * aiPassRate),
    medianResponseHours: s.trustTier === "platinum" ? 1 : s.trustTier === "gold" ? 3 : 8,
  };
  return computeTrustScore(signals);
}

// ---------------------------------------------------------------------------
// M4 — admin
// ---------------------------------------------------------------------------

export async function getPlatformMetrics() {
  return demo.platformMetrics;
}

export async function listAdminUsers() {
  return demo.adminUsers;
}

export async function listAdminActions() {
  return demo.adminActions;
}

export async function listTrustHistory() {
  return demo.trustHistory;
}

