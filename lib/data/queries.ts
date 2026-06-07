import "server-only";
import * as demo from "@/lib/demo/data";
import type {
  ClientProfile,
  Dispute,
  Job,
  Order,
  Proposal,
  StudentProfile,
} from "@/lib/types";
import { computeTrustScore, type TrustSignals } from "@/lib/trust/score";
import {
  rankJobsForStudent,
  rankStudentsForJob,
  type MatchBreakdown,
} from "@/lib/matching/engine";
import { services } from "@/lib/env";
import { getServerSupabase } from "@/lib/supabase/server";
import {
  studentFromRow,
  clientFromRow,
  jobFromRow,
  proposalFromRow,
  orderFromRow,
  reviewFromRow,
  portfolioFromRow,
  conversationFromRow,
  messageFromRow,
  serviceFromRow,
  adminActionFromRow,
  trustHistoryFromRow,
  initialsOf,
} from "@/lib/data/mappers";

/**
 * Data access layer.
 *
 * Each function has the same return shape whether the data comes from
 * `lib/demo/data.ts` (default, zero-config) or live Supabase. Branching
 * happens on `services.supabase`; if the live read fails (transient
 * error, RLS rejection, missing row), we surface null/empty so the UI
 * fails gracefully rather than crash.
 *
 * Live-path rules:
 *   1. Reads use `getServerSupabase()` (request-scoped, cookies). Service
 *      role is reserved for Server Actions and Inngest workers; never
 *      reach for it here.
 *   2. Every row mapping goes through `lib/data/mappers.ts`. Queries
 *      never reshape DB rows inline.
 *   3. Live queries log + downgrade to demo on error in DEMO_MODE.
 *
 * Functions still marked `// demo only` are queued for the next P1 sub-
 * sprint or the relevant domain phase.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** True if Supabase env vars are set AND a client can be constructed. */
async function liveOn() {
  return services.supabase && (await getServerSupabase()) !== null;
}

/** Common student select projection: users + student_profiles + college. */
const STUDENT_SELECT = `
  id,
  full_name,
  student_profiles!inner (
    username,
    stream,
    city,
    year_of_study,
    headline,
    bio,
    trust_score,
    trust_tier,
    jobs_completed,
    is_available,
    kyc,
    colleges ( name )
  )
` as const;

interface RawStudentRow {
  id: string;
  full_name: string | null;
  student_profiles: {
    username: string | null;
    stream: string | null;
    city: string | null;
    year_of_study: number | null;
    headline: string | null;
    bio: string | null;
    trust_score: number | string;
    trust_tier: StudentProfile["trustTier"];
    jobs_completed: number;
    is_available: boolean;
    kyc: "none" | "pending" | "verified" | "rejected";
    colleges: { name: string | null } | null;
  };
}

function flattenStudent(r: RawStudentRow): Parameters<typeof studentFromRow>[0] {
  const sp = r.student_profiles;
  return {
    id: r.id,
    full_name: r.full_name,
    username: sp.username,
    stream: sp.stream,
    city: sp.city,
    year_of_study: sp.year_of_study,
    headline: sp.headline,
    bio: sp.bio,
    trust_score: sp.trust_score,
    trust_tier: sp.trust_tier,
    jobs_completed: sp.jobs_completed,
    is_available: sp.is_available,
    kyc: sp.kyc,
    college_name: sp.colleges?.name ?? null,
  };
}

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------

export async function listStudents(filters?: {
  category?: string;
  q?: string;
}): Promise<StudentProfile[]> {
  if (await liveOn()) {
    const supabase = await getServerSupabase();
    let q = supabase!
      .from("users")
      .select(STUDENT_SELECT)
      .eq("role", "student")
      .order("trust_score", { ascending: false, referencedTable: "student_profiles" });

    if (filters?.q) {
      const needle = `%${filters.q}%`;
      q = q.or(
        `full_name.ilike.${needle},student_profiles.headline.ilike.${needle}`
      );
    }

    const { data, error } = await q.returns<RawStudentRow[]>();
    if (!error && data) {
      let mapped = data.map((r) => studentFromRow(flattenStudent(r)));
      if (filters?.category) {
        mapped = mapped.filter((s) => s.categorySlug === filters.category);
      }
      return mapped;
    }
  }

  // Demo fallback.
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

export async function getStudentByUsername(
  username: string
): Promise<StudentProfile | null> {
  if (await liveOn()) {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase!
      .from("users")
      .select(STUDENT_SELECT)
      .eq("student_profiles.username", username)
      .single<RawStudentRow>();
    if (!error && data) return studentFromRow(flattenStudent(data));
  }
  return demo.students.find((s) => s.username === username) ?? null;
}

export async function getStudentById(id: string): Promise<StudentProfile | null> {
  if (await liveOn()) {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase!
      .from("users")
      .select(STUDENT_SELECT)
      .eq("id", id)
      .single<RawStudentRow>();
    if (!error && data) return studentFromRow(flattenStudent(data));
  }
  return demo.students.find((s) => s.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

export async function getClientById(id: string): Promise<ClientProfile | null> {
  if (await liveOn()) {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase!
      .from("users")
      .select(
        `id, full_name, client_profiles!inner ( company_name, city, jobs_posted )`
      )
      .eq("id", id)
      .single<{
        id: string;
        full_name: string | null;
        client_profiles: {
          company_name: string | null;
          city: string | null;
          jobs_posted: number;
        };
      }>();
    if (!error && data) {
      return clientFromRow({
        id: data.id,
        full_name: data.full_name,
        company_name: data.client_profiles.company_name,
        city: data.client_profiles.city,
        jobs_posted: data.client_profiles.jobs_posted,
      });
    }
  }
  return demo.clients.find((c) => c.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

const JOB_SELECT = `
  id,
  client_id,
  title,
  description,
  job_categories ( slug ),
  budget_min,
  budget_max,
  deadline_days,
  status,
  proposals_count,
  created_at
` as const;

interface RawJobRow {
  id: string;
  client_id: string;
  title: string;
  description: string;
  job_categories: { slug: string } | null;
  budget_min: number | string;
  budget_max: number | string;
  deadline_days: number;
  status: Job["status"];
  proposals_count: number;
  created_at: string;
}

function flattenJob(r: RawJobRow): Parameters<typeof jobFromRow>[0] {
  return {
    id: r.id,
    client_id: r.client_id,
    title: r.title,
    description: r.description,
    category_slug: r.job_categories?.slug ?? "tech-development",
    budget_min: r.budget_min,
    budget_max: r.budget_max,
    deadline_days: r.deadline_days,
    status: r.status,
    proposals_count: r.proposals_count,
    created_at: r.created_at,
    skills: null,
  };
}

export async function listOpenJobs(filters?: {
  category?: string;
}): Promise<Job[]> {
  if (await liveOn()) {
    const supabase = await getServerSupabase();
    const q = supabase!
      .from("jobs")
      .select(JOB_SELECT)
      .eq("status", "open")
      .order("created_at", { ascending: false });

    const { data, error } = await q.returns<RawJobRow[]>();
    if (!error && data) {
      let jobs = data.map((r) => jobFromRow(flattenJob(r)));
      if (filters?.category)
        jobs = jobs.filter((j) => j.categorySlug === filters.category);
      return jobs;
    }
  }

  let rows = demo.jobs.filter((j) => j.status === "open");
  if (filters?.category) rows = rows.filter((j) => j.categorySlug === filters.category);
  return rows;
}

export async function getJob(id: string): Promise<Job | null> {
  if (await liveOn()) {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase!
      .from("jobs")
      .select(JOB_SELECT)
      .eq("id", id)
      .single<RawJobRow>();
    if (!error && data) return jobFromRow(flattenJob(data));
  }
  return demo.jobs.find((j) => j.id === id) ?? null;
}

export async function listClientJobs(clientId: string): Promise<Job[]> {
  if (await liveOn()) {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase!
      .from("jobs")
      .select(JOB_SELECT)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .returns<RawJobRow[]>();
    if (!error && data) return data.map((r) => jobFromRow(flattenJob(r)));
  }
  return demo.jobs.filter((j) => j.clientId === clientId);
}

// ---------------------------------------------------------------------------
// Proposals
// ---------------------------------------------------------------------------

interface RawProposalRow {
  id: string;
  job_id: string;
  student_id: string;
  cover_letter: string;
  bid_amount: number | string;
  delivery_days: number;
  status: Proposal["status"];
}

export async function listJobProposals(jobId: string): Promise<Proposal[]> {
  if (await liveOn()) {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase!
      .from("proposals")
      .select(
        "id, job_id, student_id, cover_letter, bid_amount, delivery_days, status"
      )
      .eq("job_id", jobId)
      .returns<RawProposalRow[]>();
    if (!error && data) return data.map((r) => proposalFromRow(r));
  }
  return demo.proposals.filter((p) => p.jobId === jobId);
}

export async function listStudentProposals(
  studentId: string
): Promise<Proposal[]> {
  if (await liveOn()) {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase!
      .from("proposals")
      .select(
        "id, job_id, student_id, cover_letter, bid_amount, delivery_days, status"
      )
      .eq("student_id", studentId)
      .returns<RawProposalRow[]>();
    if (!error && data) return data.map((r) => proposalFromRow(r));
  }
  return demo.proposals.filter((p) => p.studentId === studentId);
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

const ORDER_SELECT = `
  id,
  job_id,
  client_id,
  student_id,
  amount,
  status,
  deadline_days,
  created_at,
  approved_at,
  jobs ( title )
` as const;

interface RawOrderRow {
  id: string;
  job_id: string;
  client_id: string;
  student_id: string;
  amount: number | string;
  status: Order["status"];
  deadline_days: number;
  created_at: string;
  approved_at: string | null;
  jobs: { title: string } | null;
}

function flattenOrder(r: RawOrderRow): Parameters<typeof orderFromRow>[0] {
  return {
    id: r.id,
    job_id: r.job_id,
    client_id: r.client_id,
    student_id: r.student_id,
    amount: r.amount,
    status: r.status,
    deadline_days: r.deadline_days,
    created_at: r.created_at,
    approved_at: r.approved_at,
    job_title: r.jobs?.title ?? "Order",
  };
}

export async function listStudentOrders(studentId: string): Promise<Order[]> {
  if (await liveOn()) {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase!
      .from("orders")
      .select(ORDER_SELECT)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .returns<RawOrderRow[]>();
    if (!error && data) return data.map((r) => orderFromRow(flattenOrder(r)));
  }
  return demo.orders.filter((o) => o.studentId === studentId);
}

export async function listClientOrders(clientId: string): Promise<Order[]> {
  if (await liveOn()) {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase!
      .from("orders")
      .select(ORDER_SELECT)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .returns<RawOrderRow[]>();
    if (!error && data) return data.map((r) => orderFromRow(flattenOrder(r)));
  }
  return demo.orders.filter((o) => o.clientId === clientId);
}

export async function getOrder(id: string): Promise<Order | null> {
  if (await liveOn()) {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase!
      .from("orders")
      .select(ORDER_SELECT)
      .eq("id", id)
      .single<RawOrderRow>();
    if (!error && data) return orderFromRow(flattenOrder(data));
  }
  return demo.orders.find((o) => o.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Reviews + portfolio + conversations + services (P1 round 2)
// ---------------------------------------------------------------------------

export async function listReviewsForStudent(studentId?: string) {
  if (await liveOn()) {
    const supabase = await getServerSupabase();
    let q = supabase!
      .from("reviews")
      .select(
        `
        id,
        order_id,
        rating,
        comment,
        created_at,
        reviewer:reviewer_id (
          full_name,
          client_profiles ( company_name )
        )
      `
      )
      .order("created_at", { ascending: false });
    if (studentId) q = q.eq("reviewee_id", studentId);
    const { data, error } = await q.returns<
      Array<{
        id: string;
        order_id: string;
        rating: number;
        comment: string | null;
        created_at: string;
        reviewer: {
          full_name: string | null;
          client_profiles: { company_name: string | null } | null;
        } | null;
      }>
    >();
    if (!error && data) {
      return data.map((r) =>
        reviewFromRow({
          id: r.id,
          order_id: r.order_id,
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at,
          reviewer_name:
            r.reviewer?.client_profiles?.company_name ??
            r.reviewer?.full_name ??
            "Anonymous",
        })
      );
    }
  }
  return demo.reviews;
}

export async function listPortfolio(studentId: string) {
  if (await liveOn()) {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase!
      .from("portfolio_items")
      .select("id, student_id, title, problem, approach, outcome, skills")
      .eq("student_id", studentId)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .returns<
        Array<{
          id: string;
          student_id: string;
          title: string | null;
          problem: string | null;
          approach: string | null;
          outcome: string | null;
          skills: string[] | null;
        }>
      >();
    if (!error && data) return data.map((r) => portfolioFromRow(r));
  }
  return demo.portfolio.filter((p) => p.studentId === studentId);
}

export async function listConversations(userId?: string) {
  if (await liveOn() && userId) {
    const supabase = await getServerSupabase();
    // Surface conversations where the user is either side.
    const { data, error } = await supabase!
      .from("conversations")
      .select(
        `
        id,
        order_id,
        last_message_at,
        client_id,
        student_id,
        client:client_id ( full_name, client_profiles ( company_name ) ),
        student:student_id ( full_name )
      `
      )
      .or(`client_id.eq.${userId},student_id.eq.${userId}`)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .returns<
        Array<{
          id: string;
          order_id: string | null;
          last_message_at: string | null;
          client_id: string;
          student_id: string;
          client: {
            full_name: string | null;
            client_profiles: { company_name: string | null } | null;
          } | null;
          student: { full_name: string | null } | null;
        }>
      >();
    if (!error && data) {
      return data.map((c) => {
        const meClient = c.client_id === userId;
        const otherName = meClient
          ? c.student?.full_name ?? "Student"
          : c.client?.client_profiles?.company_name ??
            c.client?.full_name ??
            "Client";
        return conversationFromRow({
          id: c.id,
          order_id: c.order_id,
          last_message_at: c.last_message_at,
          with_name: otherName,
          with_initials: initialsOf(otherName),
          last_message: null, // P5 wires the messages join
          unread_count: 0, // P5 wires the read_at scan
        });
      });
    }
  }
  return demo.conversations;
}

export async function getConversation(id: string, userId?: string) {
  if (await liveOn()) {
    const supabase = await getServerSupabase();
    const { data: convoData, error: convoErr } = await supabase!
      .from("conversations")
      .select(
        `
        id, order_id, last_message_at, client_id, student_id,
        client:client_id ( full_name, client_profiles ( company_name ) ),
        student:student_id ( full_name )
      `
      )
      .eq("id", id)
      .single<{
        id: string;
        order_id: string | null;
        last_message_at: string | null;
        client_id: string;
        student_id: string;
        client: {
          full_name: string | null;
          client_profiles: { company_name: string | null } | null;
        } | null;
        student: { full_name: string | null } | null;
      }>();
    if (!convoErr && convoData) {
      const meClient = userId === convoData.client_id;
      const otherName = meClient
        ? convoData.student?.full_name ?? "Student"
        : convoData.client?.client_profiles?.company_name ??
          convoData.client?.full_name ??
          "Client";
      const convo = conversationFromRow({
        id: convoData.id,
        order_id: convoData.order_id,
        last_message_at: convoData.last_message_at,
        with_name: otherName,
        with_initials: initialsOf(otherName),
        last_message: null,
        unread_count: 0,
      });

      const { data: msgsData, error: msgsErr } = await supabase!
        .from("messages")
        .select("id, conversation_id, sender_id, body, created_at")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true })
        .returns<
          Array<{
            id: string;
            conversation_id: string;
            sender_id: string;
            body: string | null;
            created_at: string;
          }>
        >();
      const msgs =
        !msgsErr && msgsData
          ? msgsData.map((m) => messageFromRow(m, userId ?? ""))
          : [];
      return { convo, msgs };
    }
  }
  const convo = demo.conversations.find((c) => c.id === id) ?? null;
  const msgs = demo.messages.filter((m) => m.conversationId === id);
  return convo ? { convo, msgs } : null;
}

export async function listServicesByStudent(studentId: string) {
  if (await liveOn()) {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase!
      .from("service_listings")
      .select(
        `
        id,
        student_id,
        title,
        description,
        is_active,
        job_categories ( slug ),
        service_packages ( tier, price, delivery_days, description )
      `
      )
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .returns<
        Array<{
          id: string;
          student_id: string;
          title: string;
          description: string | null;
          is_active: boolean;
          job_categories: { slug: string } | null;
          service_packages: Array<{
            tier: "basic" | "standard" | "premium";
            price: number | string;
            delivery_days: number;
            description: string | null;
          }>;
        }>
      >();
    if (!error && data) {
      return data.map((s) =>
        serviceFromRow({
          id: s.id,
          student_id: s.student_id,
          title: s.title,
          description: s.description,
          is_active: s.is_active,
          category_slug: s.job_categories?.slug ?? "tech-development",
          packages: (s.service_packages ?? []).sort((a, b) => {
            const order = { basic: 0, standard: 1, premium: 2 } as const;
            return order[a.tier] - order[b.tier];
          }),
        })
      );
    }
  }
  return demo.services.filter((s) => s.studentId === studentId);
}

export async function getService(id: string) {
  if (await liveOn()) {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase!
      .from("service_listings")
      .select(
        `
        id,
        student_id,
        title,
        description,
        is_active,
        job_categories ( slug ),
        service_packages ( tier, price, delivery_days, description )
      `
      )
      .eq("id", id)
      .single<{
        id: string;
        student_id: string;
        title: string;
        description: string | null;
        is_active: boolean;
        job_categories: { slug: string } | null;
        service_packages: Array<{
          tier: "basic" | "standard" | "premium";
          price: number | string;
          delivery_days: number;
          description: string | null;
        }>;
      }>();
    if (!error && data) {
      return serviceFromRow({
        id: data.id,
        student_id: data.student_id,
        title: data.title,
        description: data.description,
        is_active: data.is_active,
        category_slug: data.job_categories?.slug ?? "tech-development",
        packages: data.service_packages ?? [],
      });
    }
  }
  return demo.services.find((s) => s.id === id) ?? null;
}

export async function getStudentWallet(studentId?: string) {
  // Wallet aggregation lands in P3 (commission_event ledger). Demo for now.
  void studentId;
  return demo.wallet;
}

// ---------------------------------------------------------------------------
// M4 disputes (demo for now; live wiring P3 once orders write to DB)
// ---------------------------------------------------------------------------

export async function listDisputes(): Promise<Dispute[]> {
  return demo.disputes;
}

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
// M4 trust score
// ---------------------------------------------------------------------------

export async function getTrustBreakdown(studentId: string) {
  const s = demo.students.find((p) => p.id === studentId);
  if (!s) return null;
  const onTimeRate = Math.min(1, 0.8 + (s.trustScore - 50) / 200);
  const aiPassRate = Math.min(1, 0.75 + (s.trustScore - 50) / 180);
  const signals: TrustSignals = {
    avgRating: s.rating,
    reviewsCount: s.reviewsCount,
    ordersDelivered: s.jobsCompleted,
    ordersOnTime: Math.round(s.jobsCompleted * onTimeRate),
    aiSubmissions: s.jobsCompleted,
    aiFirstPass: Math.round(s.jobsCompleted * aiPassRate),
    medianResponseHours:
      s.trustTier === "platinum" ? 1 : s.trustTier === "gold" ? 3 : 8,
  };
  return computeTrustScore(signals);
}

// ---------------------------------------------------------------------------
// M4 admin
// ---------------------------------------------------------------------------

export async function getPlatformMetrics() {
  return demo.platformMetrics;
}

export async function listAdminUsers() {
  return demo.adminUsers;
}

export async function listAdminActions() {
  if (await liveOn()) {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase!
      .from("admin_actions")
      .select(
        `
        id,
        action,
        target_type,
        target_id,
        reason,
        created_at,
        admin:admin_id ( full_name )
      `
      )
      .order("created_at", { ascending: false })
      .limit(50)
      .returns<
        Array<{
          id: string;
          action: string;
          target_type: string | null;
          target_id: string | null;
          reason: string;
          created_at: string;
          admin: { full_name: string | null } | null;
        }>
      >();
    if (!error && data) {
      return data.map((a) =>
        adminActionFromRow({
          id: a.id,
          action: a.action,
          target_type: a.target_type,
          target_id: a.target_id,
          reason: a.reason,
          created_at: a.created_at,
          admin_name: a.admin?.full_name ?? "Founder",
        })
      );
    }
  }
  return demo.adminActions;
}

export async function listTrustHistory(studentId?: string) {
  if (await liveOn() && studentId) {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase!
      .from("trust_score_history")
      .select("id, score, delta, reason, created_at")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(20)
      .returns<
        Array<{
          id: string;
          score: number | string;
          delta: number | string;
          reason: string | null;
          created_at: string;
        }>
      >();
    if (!error && data) return data.map((r) => trustHistoryFromRow(r));
  }
  return demo.trustHistory;
}

// ---------------------------------------------------------------------------
// M5 matching
// ---------------------------------------------------------------------------

export async function getMatchesForStudent(
  studentId: string,
  opts: { limit?: number; offset?: number; category?: string } = {}
): Promise<{
  matches: Array<{ job: Job; breakdown: MatchBreakdown }>;
  total: number;
}> {
  const student =
    (await getStudentById(studentId)) ??
    demo.students.find((s) => s.id === studentId);
  if (!student) return { matches: [], total: 0 };

  const myProposals = new Set(
    (await listStudentProposals(studentId)).map((p) => p.jobId)
  );
  let jobs = (await listOpenJobs({ category: opts.category })).filter(
    (j) => !myProposals.has(j.id)
  );
  if (opts.category) jobs = jobs.filter((j) => j.categorySlug === opts.category);

  const ranked = rankJobsForStudent(student, jobs);
  const start = Math.max(0, opts.offset ?? 0);
  const matches = opts.limit
    ? ranked.slice(start, start + opts.limit)
    : ranked.slice(start);
  return { matches, total: ranked.length };
}

export async function getMatchesForJob(
  jobId: string,
  opts: { limit?: number; offset?: number } = {}
): Promise<{
  matches: Array<{ student: StudentProfile; breakdown: MatchBreakdown }>;
  total: number;
}> {
  const job = await getJob(jobId);
  if (!job) return { matches: [], total: 0 };

  const proposed = new Set(
    (await listJobProposals(jobId)).map((p) => p.studentId)
  );
  const pool = (await listStudents()).filter((s) => !proposed.has(s.id));
  const ranked = rankStudentsForJob(job, pool);
  const start = Math.max(0, opts.offset ?? 0);
  const matches = opts.limit
    ? ranked.slice(start, start + opts.limit)
    : ranked.slice(start);
  return { matches, total: ranked.length };
}

/**
 * Today's match-email count for a student. Drives the 3/day cap.
 * Live: notification_log inserted from Inngest worker (P5).
 */
export async function getTodaysMatchEmailCount(
  studentId: string
): Promise<number> {
  if (await liveOn()) {
    const supabase = await getServerSupabase();
    const since = new Date(Date.now() - 24 * 3600_000).toISOString();
    const { count, error } = await supabase!
      .from("notification_log")
      .select("id", { count: "exact", head: true })
      .eq("user_id", studentId)
      .eq("kind", "match_email")
      .gte("sent_at", since);
    if (!error) return count ?? 0;
  }
  return 0;
}

// ---------------------------------------------------------------------------
// M5 notification preferences
// ---------------------------------------------------------------------------

export async function getNotificationPreferences(userId: string) {
  if (await liveOn()) {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase!
      .from("notification_preferences")
      .select(
        "user_id, email_job_matches, email_messages, email_digest, push_enabled"
      )
      .eq("user_id", userId)
      .maybeSingle<{
        user_id: string;
        email_job_matches: boolean;
        email_messages: boolean;
        email_digest: boolean;
        push_enabled: boolean;
      }>();
    if (!error && data) {
      return {
        userId: data.user_id,
        emailJobMatches: data.email_job_matches,
        emailOrderUpdates: data.email_messages,
        emailWeeklyDigest: data.email_digest,
        emailMarketing: false, // not yet a column; default off
      };
    }
  }
  return (
    demo.notificationPreferences.find((p) => p.userId === userId) ?? {
      userId,
      emailJobMatches: true,
      emailOrderUpdates: true,
      emailWeeklyDigest: true,
      emailMarketing: false,
    }
  );
}
