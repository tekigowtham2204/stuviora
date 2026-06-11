/**
 * Discovery - full-text search (M5.4 / P6).
 *
 * Demo: in-memory string-contains over students + jobs (searchDemo).
 * Live (services.meilisearch): documents are pushed to Meilisearch by the
 * indexer below; searchIds queries Meili over its REST API and returns
 * matching ids that the data layer hydrates. We use REST (fetch) rather
 * than the SDK to avoid a runtime dependency.
 */

import type { Job, StudentProfile } from "@/lib/types";
import { env, services } from "@/lib/env";

export const STUDENT_INDEX = "students";
export const JOB_INDEX = "jobs";

export type SearchHit =
  | { kind: "student"; student: StudentProfile }
  | { kind: "job"; job: Job };

interface SearchOpts {
  q: string;
  type?: "all" | "students" | "jobs";
  limit?: number;
}

export function searchDemo(
  q: string,
  students: StudentProfile[],
  jobs: Job[],
  opts: SearchOpts = { q }
): SearchHit[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const limit = opts.limit ?? 30;
  const type = opts.type ?? "all";

  const studentHits: SearchHit[] =
    type === "jobs"
      ? []
      : students
          .filter((s) => matchesStudent(s, needle))
          .map((student) => ({ kind: "student" as const, student }));

  const jobHits: SearchHit[] =
    type === "students"
      ? []
      : jobs
          .filter((j) => j.status === "open" && matchesJob(j, needle))
          .map((job) => ({ kind: "job" as const, job }));

  return [...studentHits, ...jobHits].slice(0, limit);
}

function matchesStudent(s: StudentProfile, needle: string) {
  return (
    s.fullName.toLowerCase().includes(needle) ||
    s.headline.toLowerCase().includes(needle) ||
    s.bio.toLowerCase().includes(needle) ||
    s.college.toLowerCase().includes(needle) ||
    s.stream.toLowerCase().includes(needle) ||
    s.skills.some((sk) => sk.toLowerCase().includes(needle))
  );
}

function matchesJob(j: Job, needle: string) {
  return (
    j.title.toLowerCase().includes(needle) ||
    j.description.toLowerCase().includes(needle) ||
    j.skills.some((sk) => sk.toLowerCase().includes(needle))
  );
}

// ---------------------------------------------------------------------------
// Live (Meilisearch) - indexer + id search
// ---------------------------------------------------------------------------

export interface StudentSearchDoc {
  id: string;
  fullName: string;
  username: string;
  headline: string;
  college: string;
  stream: string;
  skills: string[];
  trustScore: number;
}

export interface JobSearchDoc {
  id: string;
  title: string;
  description: string;
  skills: string[];
  status: string;
}

/** Pure: map a student profile to its search document. */
export function studentToSearchDoc(s: StudentProfile): StudentSearchDoc {
  return {
    id: s.id,
    fullName: s.fullName,
    username: s.username,
    headline: s.headline,
    college: s.college,
    stream: s.stream,
    skills: s.skills,
    trustScore: s.trustScore,
  };
}

/** Pure: map a job to its search document. */
export function jobToSearchDoc(j: Job): JobSearchDoc {
  return {
    id: j.id,
    title: j.title,
    description: j.description,
    skills: j.skills,
    status: j.status,
  };
}

async function meiliFetch(path: string, init: RequestInit): Promise<Response | null> {
  if (!env.meilisearchHost || !env.meilisearchKey) return null;
  try {
    return await fetch(`${env.meilisearchHost}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${env.meilisearchKey}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
  } catch {
    return null;
  }
}

/** Push documents into a Meilisearch index. No-op in demo mode. */
export async function indexDocuments<T extends { id: string }>(
  index: string,
  docs: T[]
): Promise<{ ok: boolean; count: number }> {
  if (!services.meilisearch) return { ok: true, count: 0 };
  const res = await meiliFetch(`/indexes/${index}/documents`, {
    method: "POST",
    body: JSON.stringify(docs),
  });
  return { ok: Boolean(res?.ok), count: res?.ok ? docs.length : 0 };
}

/**
 * Query Meilisearch and return matching ids per index. The data layer
 * hydrates these into full domain objects (search returns ids, the DB is
 * the source of truth). Returns null when Meili is not configured so the
 * caller falls back to searchDemo.
 */
export async function searchIds(
  opts: SearchOpts
): Promise<{ students: string[]; jobs: string[] } | null> {
  if (!services.meilisearch) return null;
  const type = opts.type ?? "all";
  const limit = opts.limit ?? 30;
  const queries: Array<{ indexUid: string; q: string; limit: number }> = [];
  if (type !== "jobs") queries.push({ indexUid: STUDENT_INDEX, q: opts.q, limit });
  if (type !== "students") queries.push({ indexUid: JOB_INDEX, q: opts.q, limit });

  const res = await meiliFetch(`/multi-search`, {
    method: "POST",
    body: JSON.stringify({ queries }),
  });
  if (!res?.ok) return null;
  const json = (await res.json().catch(() => null)) as {
    results?: Array<{ indexUid: string; hits: Array<{ id: string }> }>;
  } | null;
  if (!json?.results) return null;

  const students: string[] = [];
  const jobs: string[] = [];
  for (const r of json.results) {
    const ids = r.hits.map((h) => h.id);
    if (r.indexUid === STUDENT_INDEX) students.push(...ids);
    else if (r.indexUid === JOB_INDEX) jobs.push(...ids);
  }
  return { students, jobs };
}
