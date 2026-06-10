"use client";

import { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { submitProposal } from "@/app/actions/jobs";
import type { ProposalVariant } from "@/lib/proposals/variants";
import { cn } from "@/lib/utils";

const WORD_TARGET_MIN = 80;
const WORD_TARGET_MAX = 150;

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function ProposalForm({
  jobId,
  variants,
  pricing,
  bidCeiling,
  tier,
  deadlineDays,
  defaultDeliveryDays,
  budgetMaxAboveCap,
}: {
  jobId: string;
  variants: ProposalVariant[];
  pricing: { low: number; suggested: number; high: number };
  bidCeiling: number | null;
  tier: string;
  deadlineDays: number;
  defaultDeliveryDays: number;
  budgetMaxAboveCap: boolean;
}) {
  const [variantIndex, setVariantIndex] = useState(0);
  const [pitch, setPitch] = useState(variants[0]?.text ?? "");
  const [bid, setBid] = useState(String(pricing.suggested));

  const words = countWords(pitch);
  const wordsInRange = words >= WORD_TARGET_MIN && words <= WORD_TARGET_MAX;
  const wordTone = !words
    ? "text-[var(--color-ink-faint)]"
    : wordsInRange
      ? "text-[var(--color-sage-900)]"
      : "text-[var(--color-orange-900)]";

  const bidValue = Number(bid);
  const overCap = bidCeiling !== null && bidValue > bidCeiling;
  const belowFloor = bidValue > 0 && bidValue < pricing.low;
  const inBand =
    bidValue >= pricing.low && bidValue <= pricing.high && !overCap;
  const bidBorder = !bid
    ? ""
    : overCap || belowFloor
      ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/20"
      : inBand
        ? "border-[var(--color-sage-deep)] focus:border-[var(--color-sage-deep)] focus:ring-[var(--color-sage-deep)]/20"
        : "border-[var(--color-orange)] focus:border-[var(--color-orange)] focus:ring-[var(--color-orange)]/20";

  const canRegenerate = variants.length > 1;

  function regenerate() {
    const next = (variantIndex + 1) % variants.length;
    setVariantIndex(next);
    setPitch(variants[next].text);
  }

  return (
    <form action={submitProposal} className="mt-6 space-y-4">
      <input type="hidden" name="jobId" value={jobId} />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="coverLetter">Your pitch</Label>
          <div className="flex items-center gap-2">
            <Badge tone="orange">
              <Sparkles className="h-3 w-3" /> AI-drafted
            </Badge>
            {canRegenerate && (
              <button
                type="button"
                onClick={regenerate}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--color-line-strong)] px-2.5 py-1 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-warm)]"
              >
                <RefreshCw className="h-3 w-3" /> Regenerate
              </button>
            )}
          </div>
        </div>
        <Textarea
          id="coverLetter"
          name="coverLetter"
          rows={8}
          value={pitch}
          onChange={(e) => setPitch(e.target.value)}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-[var(--color-ink-muted)]">
            The pitch stays yours. Edit before sending: clients respond to
            specifics.
          </p>
          <p className={cn("text-xs tabular-nums", wordTone)}>
            {words} words{" "}
            <span className="text-[var(--color-ink-faint)]">
              (aim for {WORD_TARGET_MIN} to {WORD_TARGET_MAX})
            </span>
          </p>
        </div>
        {canRegenerate && (
          <p className="text-xs text-[var(--color-ink-faint)]">
            Variant: {variants[variantIndex].label} ({variantIndex + 1} of{" "}
            {variants.length})
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="bidAmount">Your bid (INR)</Label>
          <Input
            id="bidAmount"
            name="bidAmount"
            type="number"
            min={1}
            max={bidCeiling ?? undefined}
            value={bid}
            onChange={(e) => setBid(e.target.value)}
            className={bidBorder}
          />
          {bid && (
            <p
              className={cn(
                "text-xs",
                overCap || belowFloor
                  ? "text-[var(--color-danger-deep)]"
                  : inBand
                    ? "text-[var(--color-sage-900)]"
                    : "text-[var(--color-orange-900)]"
              )}
            >
              {overCap
                ? `Above your ${tier} tier cap of Rs.${bidCeiling!.toLocaleString("en-IN")}.`
                : belowFloor
                  ? `Below the suggested floor of Rs.${pricing.low.toLocaleString("en-IN")}.`
                  : inBand
                    ? "Inside the suggested range."
                    : `Above the suggested range of Rs.${pricing.high.toLocaleString("en-IN")}.`}
            </p>
          )}
          {bidCeiling !== null && budgetMaxAboveCap && (
            <p className="text-xs text-[var(--color-ink-faint)]">
              This job&apos;s max budget is above your {tier} tier cap.
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="deliveryDays">Delivery (days)</Label>
          <Input
            id="deliveryDays"
            name="deliveryDays"
            type="number"
            min={1}
            max={deadlineDays}
            defaultValue={defaultDeliveryDays}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
        <input
          type="checkbox"
          name="saveTemplate"
          className="h-4 w-4 rounded border-[var(--color-line-strong)] accent-[var(--color-sage-deep)]"
        />
        Save this pitch as a template for future bids
      </label>

      <Button type="submit" variant="primary" className="w-full">
        Submit proposal
      </Button>
    </form>
  );
}
