import { Bot, ShieldCheck } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AiReview } from "@/lib/types";

/** Detailed AI-gate result panel. Used on both student and client order pages. */
export function AiReviewPanel({ review }: { review: AiReview }) {
  const passed = review.verdict === "PASS";
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <CardTitle>AI quality review</CardTitle>
            <div className="text-xs text-muted">Stuviora&apos;s pre-delivery gate</div>
          </div>
        </div>
        <Badge tone={passed ? "success" : "danger"}>
          {review.verdict} · {review.score}
        </Badge>
      </div>

      <div className="mt-5 space-y-3">
        <Bar label="Brief alignment" v={review.briefAlignment} max={40} />
        <Bar label="Completeness" v={review.completeness} max={30} />
        <Bar label="Quality" v={review.quality} max={30} />
        <Bar label="Originality" v={review.originality} max={100} tone="trust" />
      </div>

      <p className="mt-5 rounded-lg bg-surface-muted p-3 text-sm leading-relaxed text-foreground">
        &ldquo;{review.reviewerNote}&rdquo;
      </p>

      {review.issues.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">Issues</h4>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {review.issues.map((i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-warning" />
                <span>{i}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {review.suggestions.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Suggestions
          </h4>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {review.suggestions.map((s) => (
              <li key={s} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {passed && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-trust-50 px-3 py-2 text-xs text-trust-700">
          <ShieldCheck className="h-4 w-4" />
          AI-reviewed badge applied. Safe to deliver to the client.
        </div>
      )}
    </Card>
  );
}

function Bar({
  label,
  v,
  max,
  tone = "brand",
}: {
  label: string;
  v: number;
  max: number;
  tone?: "brand" | "trust";
}) {
  const pct = Math.min(100, (v / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-medium">
          {v}/{max}
        </span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-surface-muted">
        <div
          className={tone === "trust" ? "h-2 rounded-full bg-trust-500" : "h-2 rounded-full bg-brand-500"}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
