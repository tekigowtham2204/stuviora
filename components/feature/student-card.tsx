import Link from "next/link";
import { Star, BadgeCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TrustTierBadge } from "@/components/ui/trust-tier-badge";
import { Money } from "@/components/ui/money";
import type { StudentProfile } from "@/lib/types";

export function StudentCard({ s }: { s: StudentProfile }) {
  return (
    <Link href={`/freelancer/${s.username}`} className="group block h-full">
      <Card className="flex h-full flex-col p-6 transition-all hover:border-[var(--color-sage)] hover:shadow-[var(--shadow-card-lg)]">
        <div className="flex items-start gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-sage)] text-base font-semibold text-[var(--color-brown-900)]">
            {s.avatarInitials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-display text-base font-medium text-[var(--color-ink)]">
                {s.fullName}
              </span>
              {s.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-[var(--color-sage-deep)]" />}
            </div>
            <div className="truncate text-xs text-[var(--color-ink-muted)]">
              {s.stream} · {s.college}
            </div>
          </div>
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
          {s.headline}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {s.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-[var(--color-surface-warm)] px-2.5 py-1 text-xs text-[var(--color-ink)]"
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-[var(--color-line)] pt-4 text-sm">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-[var(--color-yellow)] text-[var(--color-yellow-deep)]" />
            <span className="font-medium tabular-nums text-[var(--color-ink)]">{s.rating}</span>
            <span className="text-[var(--color-ink-faint)]">({s.reviewsCount})</span>
          </span>
          <TrustTierBadge tier={s.trustTier} size="sm" />
          <span className="text-xs text-[var(--color-ink-muted)]">
            from <Money value={s.hourlyFrom} compact />/hr
          </span>
        </div>
      </Card>
    </Link>
  );
}
