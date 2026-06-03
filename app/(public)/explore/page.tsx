import Link from "next/link";
import { Container } from "@/components/ui/container";
import { StudentCard } from "@/components/feature/student-card";
import { listStudents } from "@/lib/data/queries";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Browse student talent",
  description: "Discover verified student freelancers across India by skill, stream, and rating.",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const studentsList = await listStudents({ category });

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Browse student talent</h1>
      <p className="mt-2 text-muted">
        Verified college students across India. Every delivery is AI-reviewed and escrow-protected.
      </p>

      {/* Category filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip href="/explore" active={!category} label="All" />
        {SERVICE_CATEGORIES.map((c) => (
          <FilterChip
            key={c.slug}
            href={`/explore?category=${c.slug}`}
            active={category === c.slug}
            label={c.name}
          />
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {studentsList.map((s) => (
          <StudentCard key={s.id} s={s} />
        ))}
      </div>

      {studentsList.length === 0 && (
        <p className="mt-12 text-center text-muted">No students in this category yet.</p>
      )}
    </Container>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
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
