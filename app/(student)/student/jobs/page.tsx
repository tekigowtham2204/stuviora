import Link from "next/link";
import { Clock, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { listOpenJobs } from "@/lib/data/queries";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { currentStudent } from "@/lib/auth/session";
import { formatINR, cn } from "@/lib/utils";

export const metadata = { title: "Browse jobs" };

export default async function StudentJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const me = currentStudent();
  const jobs = await listOpenJobs({ category });

  return (
    <>
      <PageHeader
        title="Browse open jobs"
        subtitle="Ranked by fit with your skills and trust tier."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        <Chip href="/student/jobs" active={!category} label="All" />
        {SERVICE_CATEGORIES.map((c) => (
          <Chip
            key={c.slug}
            href={`/student/jobs?category=${c.slug}`}
            active={category === c.slug}
            label={c.name}
          />
        ))}
      </div>

      <div className="grid gap-3">
        {jobs.length === 0 && (
          <Card className="text-sm text-muted">
            No open jobs in this category right now. Check back tomorrow, or expand your skills.
          </Card>
        )}
        {jobs.map((j, i) => {
          const overlap = me.skills.filter((s) => j.skills.includes(s)).length;
          const matchScore = Math.min(
            100,
            Math.round((overlap / Math.max(j.skills.length, 1)) * 70) + me.trustScore / 5
          );
          return (
            <Reveal key={j.id} index={i}>
              <Link href={`/student/jobs/${j.id}`}>
                <Card className="transition-colors hover:border-brand-300">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold leading-snug">{j.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted">{j.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
                        <span>
                          {formatINR(j.budgetMin)} to {formatINR(j.budgetMax)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {j.deadlineDays}d
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {j.proposalsCount} proposals
                        </span>
                        <span>{j.createdAgo}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {j.skills.map((s) => (
                          <span key={s} className="rounded-md bg-surface-muted px-2 py-0.5 text-xs text-muted">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge tone={matchScore >= 60 ? "trust" : "neutral"}>
                        {matchScore}% match
                      </Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}

function Chip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-brand-300 bg-brand-100 text-brand-700"
          : "border-border text-muted hover:border-border-strong hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}
