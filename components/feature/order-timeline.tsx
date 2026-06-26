import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

interface Step {
  key: OrderStatus[];
  label: string;
}

const TIMELINE: Step[] = [
  { key: ["pending_payment"], label: "Payment authorized" },
  { key: ["active"], label: "In progress" },
  { key: ["submitted", "in_ai_review", "revision_requested"], label: "AI review" },
  { key: ["awaiting_approval"], label: "Delivered, charged" },
  { key: ["completed"], label: "Paid out" },
];

const ORDER: OrderStatus[] = [
  "pending_payment",
  "active",
  "submitted",
  "in_ai_review",
  "revision_requested",
  "awaiting_approval",
  "completed",
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const currentIndex = ORDER.indexOf(status);
  return (
    <ol className="flex flex-wrap items-center gap-2">
      {TIMELINE.map((step, i) => {
        const stepIndex = Math.max(...step.key.map((k) => ORDER.indexOf(k)));
        const isDone = currentIndex > stepIndex;
        const isCurrent = step.key.includes(status);
        return (
          <li key={step.label} className="flex items-center gap-2">
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
              {step.label}
            </span>
            {i < TIMELINE.length - 1 && (
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
