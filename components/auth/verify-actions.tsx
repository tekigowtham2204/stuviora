"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

const RESEND_COOLDOWN_SECONDS = 30;

/** Map a known email host to a webmail inbox link (audit #8). */
function inboxLink(email?: string): { href: string; label: string } | null {
  const host = email?.split("@")[1]?.toLowerCase();
  if (!host) return null;
  if (host === "gmail.com" || host === "googlemail.com")
    return { href: "https://mail.google.com", label: "Open Gmail" };
  if (
    host === "outlook.com" ||
    host === "hotmail.com" ||
    host === "live.com" ||
    host === "msn.com"
  )
    return { href: "https://outlook.live.com/mail", label: "Open Outlook" };
  if (host === "yahoo.com" || host === "yahoo.in")
    return { href: "https://mail.yahoo.com", label: "Open Yahoo Mail" };
  // Most .ac.in / .edu.in colleges run on Google Workspace.
  if (host.endsWith(".ac.in") || host.endsWith(".edu.in"))
    return { href: "https://mail.google.com", label: "Open college mail" };
  return null;
}

export function VerifyActions({ email }: { email?: string }) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [sent, setSent] = useState(false);
  const link = inboxLink(email);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  function handleResend() {
    if (secondsLeft > 0) return;
    // TODO(live): call the resend-OTP server action once Resend (P5) is wired.
    setSent(true);
    setSecondsLeft(RESEND_COOLDOWN_SECONDS);
  }

  return (
    <div className="mt-6 space-y-3 text-sm text-[var(--color-ink-muted)]">
      {link && (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-[var(--color-ink)] underline-offset-4 hover:underline"
        >
          {link.label} <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
      <p>
        Did not get it?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={secondsLeft > 0}
          className="font-medium text-[var(--color-ink)] underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-[var(--color-ink-faint)] disabled:no-underline"
        >
          {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : "Resend code"}
        </button>
      </p>
      <span role="status" aria-live="polite" className="sr-only">
        {sent && secondsLeft > 0
          ? `Code sent. You can resend in ${secondsLeft} seconds.`
          : ""}
      </span>
      {sent && (
        <p aria-hidden className="text-xs text-[var(--color-sage-900)]">
          A new code is on the way.
        </p>
      )}
    </div>
  );
}
