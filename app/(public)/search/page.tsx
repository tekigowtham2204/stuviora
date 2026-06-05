import Link from "next/link";
import { Search as SearchIcon, Briefcase, GraduationCap } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Money } from "@/components/ui/money";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { StudentCard } from "@/components/feature/student-card";
import { EmptyState } from "@/components/ui/empty-state";
import { searchDemo } from "@/lib/search/client";
import * as demo from "@/lib/demo/data";

export const metadata = {
  title: "Search",
  description: "Search across student profiles and open jobs.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: "all" | "students" | "jobs" }>;
}) {
  const { q = "", type = "all" } = await searchParams;
  const hits = q
    ? searchDemo(q, demo.students, demo.jobs, { q, type, limit: 60 })
    : [];

  const students = hits.filter((h) => h.kind === "student");
  const jobs = hits.filter((h) => h.kind === "job");

  return (
    <Section spacing="tight" tone="cream">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--color-ink-muted)]">
            Discovery
          </div>
          <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-[var(--color-ink)]">
            Search Stuviora.
          </h1>
          <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
            Look across student profiles and open jobs in one place.
          </p>
        </div>

        <form action="/search" method="get" className="mx-auto mt-8 max-w-2xl">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink-muted)]" />
            <Input
              type="search"
              name="q"
              defaultValue={q}
              autoFocus
              placeholder="Search by skill, college, name, or job"
              className="pl-11"
            />
          </div>
          <div className="mt-3 flex justify-center gap-2">
            <TypeChip label="All" href={`/search?q=${encodeURIComponent(q)}`} active={type === "all"} />
            <TypeChip
              label="Students"
              href={`/search?q=${encodeURIComponent(q)}&type=students`}
              active={type === "students"}
            />
            <TypeChip
              label="Jobs"
              href={`/search?q=${encodeURIComponent(q)}&type=jobs`}
              active={type === "jobs"}
            />
          </div>
        </form>

        {!q ? (
          <div className="mt-12">
            <EmptyState
              icon={<SearchIcon className="h-6 w-6" />}
              title="Type to begin searching"
              body="Search by skill, college, name, or job keyword."
            />
          </div>
        ) : hits.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              title={`No matches for "${q}"`}
              body="Try a broader term or check spelling."
            />
          </div>
        ) : (
          <div className="mt-10 space-y-12">
            {students.length > 0 && (type === "all" || type === "students") && (
              <div>
                <div className="mb-4 flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
                  <GraduationCap className="h-4 w-4" />
                  <span className="font-medium uppercase tracking-[0.18em]">Students</span>
                  <span className="text-[var(--color-ink-faint)]">({students.length})</span>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {students.map((h, i) =>
                    h.kind === "student" ? (
                      <Reveal key={h.student.id} index={i}>
                        <StudentCard s={h.student} />
                      </Reveal>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {jobs.length > 0 && (type === "all" || type === "jobs") && (
              <div>
                <div className="mb-4 flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
                  <Briefcase className="h-4 w-4" />
                  <span className="font-medium uppercase tracking-[0.18em]">Jobs</span>
                  <span className="text-[var(--color-ink-faint)]">({jobs.length})</span>
                </div>
                <div className="grid gap-4">
                  {jobs.map((h, i) =>
                    h.kind === "job" ? (
                      <Reveal key={h.job.id} index={i}>
                        <Link href={`/student/jobs/${h.job.id}`} className="block">
                          <Card className="transition-colors hover:border-[var(--color-orange)]">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="font-display text-lg font-medium text-[var(--color-ink)]">
                                  {h.job.title}
                                </h3>
                                <p className="mt-1 line-clamp-2 text-sm text-[var(--color-ink-muted)]">
                                  {h.job.description}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  {h.job.skills.map((s) => (
                                    <span
                                      key={s}
                                      className="rounded-full bg-[var(--color-surface-warm)] px-2.5 py-1 text-xs text-[var(--color-ink)]"
                                    >
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <Badge tone="orange">
                                <Money value={h.job.budgetMin} to={h.job.budgetMax} compact />
                              </Badge>
                            </div>
                          </Card>
                        </Link>
                      </Reveal>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Container>
    </Section>
  );
}

function TypeChip({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={
        "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
        (active
          ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-cream)]"
          : "border-[var(--color-line-strong)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:border-[var(--color-ink)]")
      }
    >
      {label}
    </Link>
  );
}
