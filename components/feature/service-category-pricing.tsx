"use client";

import { useState } from "react";
import { Select, Label } from "@/components/ui/input";
import { Money } from "@/components/ui/money";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { priceFloorFor } from "@/lib/pricing/engine";

/**
 * Onboarding "first service" category picker with a pricing tip that is
 * sourced from the pricing engine's real category floor (student-audit
 * #16), not a hardcoded number. The range updates as the category changes.
 */
export function ServiceCategoryPricing() {
  const [slug, setSlug] = useState<string>(SERVICE_CATEGORIES[0].slug);
  const floor = priceFloorFor(slug);
  // Basic-tier services typically run from the floor up to ~2.5x it.
  const high = Math.round((floor * 2.5) / 500) * 500;
  const category = SERVICE_CATEGORIES.find((c) => c.slug === slug);

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="serviceCategory">Category</Label>
        <Select
          id="serviceCategory"
          name="serviceCategory"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        >
          {SERVICE_CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <p className="text-xs text-[var(--color-ink-faint)]">
        Pricing tip: the floor for {category?.name.toLowerCase()} is{" "}
        <Money value={floor} compact />. Most basic-tier services start between{" "}
        <Money value={floor} compact /> and <Money value={high} compact />. You
        can edit anytime.
      </p>
    </>
  );
}
