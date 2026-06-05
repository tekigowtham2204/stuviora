/**
 * Discovery — full-text search (M5.4).
 *
 * Demo: in-memory string-contains over students + jobs.
 * Live (TODO): swap to Meilisearch SDK behind `services.meilisearch`.
 * Indexing events fire on job-post and on student profile publish.
 */

import type { Job, StudentProfile } from "@/lib/types";

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
