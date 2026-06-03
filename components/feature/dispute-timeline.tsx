import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { DISPUTE_FLOW } from "@/lib/disputes/engine";
import type { DisputeStatus } from "@/lib/types";

const STAGE_LABELS: Record<DisputeStatus, string> = {
  open: "Opened",
  evidence_collection: "Evidence",
  admin_review: "Admin review",
  resolved: "Resolved",
};

/** Horizontal progress of a dispute through the state machine. */
export function DisputeTimeline({ status }: { status: DisputeStatus }) {
  const currentIndex = DISPUTE_FLOW.indexOf(status);
  return (
    <ol className="flex flex-wrap items-center gap-2">
      {DISPUTE_FLOW.map((stage, i) => {
        const isDone = currentIndex > i;
        const isCurrent = currentIndex === i;
        return (
          <li key={stage} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                isDone && "bg-success-bg text-success",
                isCurrent && "bg-brand-100 text-brand-700 ring-2 ring-brand-300",
                !isDone && !isCurrent && "bg-surface-muted text-subtle"
              )}
            >
              {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                "text-xs font-medium",
                isDone || isCurrent ? "text-foreground" : "text-subtle"
              )}
            >
              {STAGE_LABELS[stage]}
            </span>
            {i < DISPUTE_FLOW.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "hidden h-px w-6 sm:inline-block",
                  isDone ? "bg-success" : "bg-border"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
