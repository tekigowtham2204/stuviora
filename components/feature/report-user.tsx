import { Flag, CheckCircle2 } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea, Label } from "@/components/ui/input";
import { reportUser } from "@/app/actions/report";

/**
 * Report-a-user card (audit #61). Server component; drop it on any
 * surface with the target's display name and where to return after.
 */
export function ReportUser({
  targetName,
  context,
  returnTo,
  flash,
}: {
  targetName: string;
  context: "profile" | "message" | "order";
  returnTo: string;
  flash?: string;
}) {
  if (flash === "filed") {
    return (
      <Card role="status" aria-live="polite" surface="flat" tint="sage" className="flex items-center gap-2 text-sm">
        <CheckCircle2 className="h-4 w-4 text-[var(--color-sage-deep)]" />
        <span className="text-[var(--color-sage-900)]">
          Report filed. Our team reviews every report, usually within 24 hours.
        </span>
      </Card>
    );
  }
  return (
    <Card surface="flat" tint="warm">
      <div className="flex items-center gap-2">
        <Flag className="h-4 w-4 text-[var(--color-orange-900)]" />
        <CardTitle>Report {targetName}</CardTitle>
      </div>
      <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
        Inappropriate messages, fake briefs, or off-platform payment requests
        all qualify. Reports go straight to our safety team.
      </p>
      {flash === "invalid" && (
        <p className="mt-2 text-xs text-[var(--color-danger-deep)]">
          Tell us a little more (at least 10 characters).
        </p>
      )}
      <form action={reportUser} className="mt-3 space-y-3">
        <input type="hidden" name="targetName" value={targetName} />
        <input type="hidden" name="context" value={context} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <div className="space-y-1.5">
          <Label htmlFor="reason">What happened?</Label>
          <Textarea id="reason" name="reason" rows={3} placeholder="Describe the behaviour." />
        </div>
        <Button type="submit" variant="secondary" size="sm">
          Submit report
        </Button>
      </form>
    </Card>
  );
}
