import Link from "next/link";
import { Star, BadgeCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import type { StudentProfile } from "@/lib/types";

const TIER_TONE = {
  bronze: "warning",
  silver: "neutral",
  gold: "warning",
  platinum: "brand",
} as const;

export function StudentCard({ s }: { s: StudentProfile }) {
  return (
    <Link href={`/freelancer/${s.username}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-base font-semibold text-brand-700">
            {s.avatarInitials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-semibold">{s.fullName}</span>
              {s.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-trust-600" />}
            </div>
            <div className="truncate text-xs text-muted">
              {s.stream} · {s.college}
            </div>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-muted">{s.headline}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {s.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="rounded-md bg-surface-muted px-2 py-0.5 text-xs text-muted">
              {skill}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="font-medium">{s.rating}</span>
            <span className="text-subtle">({s.reviewsCount})</span>
          </span>
          <Badge tone={TIER_TONE[s.trustTier]}>{s.trustTier}</Badge>
          <span className="text-muted">from {formatINR(s.hourlyFrom)}/hr</span>
        </div>
      </Card>
    </Link>
  );
}
