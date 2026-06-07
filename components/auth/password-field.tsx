"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Lightweight password strength estimate (audit #5). Avoids a heavy
 * dependency: scores on length and character-class variety, which is
 * enough to nudge a first-timer off a weak password. Returns a 0..4
 * band with a label and an accent colour token.
 */
export function scorePassword(value: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
} {
  if (!value) return { score: 0, label: "" };
  let points = 0;
  if (value.length >= 8) points++;
  if (value.length >= 12) points++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) points++;
  if (/\d/.test(value)) points++;
  if (/[^A-Za-z0-9]/.test(value)) points++;
  // Short passwords can never read as strong, regardless of variety.
  const capped = value.length < 8 ? Math.min(points, 1) : points;
  const score = Math.min(capped, 4) as 0 | 1 | 2 | 3 | 4;
  const labels = ["Too weak", "Weak", "Okay", "Good", "Strong"];
  return { score, label: labels[score] };
}

const BAR_COLORS = [
  "bg-[var(--color-line-strong)]",
  "bg-[var(--color-danger)]",
  "bg-[var(--color-orange)]",
  "bg-[var(--color-yellow-deep)]",
  "bg-[var(--color-sage-deep)]",
] as const;

export function PasswordField({
  label = "Password",
  name = "password",
  placeholder = "At least 8 characters",
}: {
  label?: string;
  name?: string;
  placeholder?: string;
}) {
  const id = useId();
  const meterId = `${id}-strength`;
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);
  const { score, label: strengthLabel } = scorePassword(value);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete="new-password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-describedby={meterId}
          className="pr-11"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      <div id={meterId} aria-live="polite">
        <div className="flex gap-1" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                value && i < score
                  ? BAR_COLORS[score]
                  : "bg-[var(--color-line)]"
              )}
            />
          ))}
        </div>
        {value && (
          <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
            Password strength: {strengthLabel}
          </p>
        )}
      </div>
    </div>
  );
}
