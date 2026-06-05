import Link from "next/link";
import { Search } from "lucide-react";
import { Container } from "@/components/ui/container";
import { StudentCard } from "@/components/feature/student-card";
import { Input } from "@/components/ui/input";
import { Section } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { listStudents } from "@/lib/data/queries";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { searchDemo } from "@/lib/search/client";
import * as demo from "@/lib/demo/data";

export const metadata = {
  title: "Browse student talent",
  description:
    "Discover verified student freelancers across India by skill, stream, and rating.",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  let studentsList = await listStudents({ category });

  if (q) {
    const hits = searchDemo(q, studentsList, demo.jobs, { q, type: "students" });
    studentsList = hits
      .filter((h): h is { kind: "student"; student: typeof studentsList[number] } => h.kind === "student")
      .map((h) => h.student);
  }

  return (
    <Section spacing="tight" tone="cream">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--color-ink-muted)]">
            Verified bench
          </div>
          <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-[var(--color-ink)] sm:text-5xl">
            Browse student talent.
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-[var(--color-ink-muted)]">
            Verified college students across India. Every delivery is AI-reviewed
            and escrow-protected.
          </p>
        </div>

        {/* Search */}
        <form action="/explore" method="get" className="mx-auto mt-8 max-w-xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink-muted)]" />
            <Input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search by skill, college, or name"
              className="pl-11"
            />
            {category && <input type="hidden" name="category" value={category} />}
          </div>
        </form>

        {/* Category filter */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <FilterChip href="/explore" active={!category} label="All" />
          {SERVICE_CATEGORIES.map((c) => (
            <FilterChip
              key={c.slug}
              href={`/explore?category=${c.slug}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              active={category === c.slug}
              label={c.name}
            />
          ))}
        </div>

        {studentsList.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              title="No students match this filter"
              body="Try a different category or a broader search term."
            />
          </div>
        ) : (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {studentsList.map((s, i) => (
              <Reveal key={s.id} index={i}>
                <StudentCard s={s} />
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
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
