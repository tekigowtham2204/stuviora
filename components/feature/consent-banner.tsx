"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CONSENT_NOTICE_VERSION } from "@/lib/privacy/consent";

/**
 * Cookie / consent banner (P7 / DPDP).
 *
 * Captures itemized consent client-side and persists it in localStorage
 * so it works before sign-in. Authenticated users can adjust and have it
 * recorded server-side from the data-privacy page. Shown only until a
 * choice is made for the current notice version.
 *
 * Appears with a gentle translate/opacity transition (never scale(0)) and
 * is removed from the layout entirely once dismissed.
 */

const STORAGE_KEY = "sv_consent";

function alreadyDecided(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { noticeVersion?: string };
    return parsed.noticeVersion === CONSENT_NOTICE_VERSION;
  } catch {
    return false;
  }
}

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (alreadyDecided()) return;
    // Mount + animate inside rAF callbacks (not directly in the effect
    // body) so the entrance transition runs from the first painted frame.
    const raf = requestAnimationFrame(() => {
      setVisible(true);
      requestAnimationFrame(() => setShown(true));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  function decide(optionalAllowed: boolean) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          state: {
            essential: true,
            analytics: optionalAllowed,
            marketing_email: optionalAllowed,
            match_notifications: optionalAllowed,
          },
          noticeVersion: CONSENT_NOTICE_VERSION,
          recordedAt: new Date().toISOString(),
        })
      );
    } catch {
      // If storage is blocked, just dismiss for this session.
    }
    setShown(false);
    setTimeout(() => setVisible(false), 200);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie and data consent"
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
    >
      <div
        className="mx-auto max-w-3xl rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card-lg)] transition-[opacity,transform] duration-200 ease-out sm:flex sm:items-center sm:gap-4 motion-reduce:transition-none"
        style={{
          opacity: shown ? 1 : 0,
          transform: shown ? "translateY(0)" : "translateY(12px)",
        }}
      >
        <p className="text-sm text-[var(--color-ink-muted)]">
          We use essential cookies to run Stuviora, and optional ones for
          analytics and helpful emails. You choose.{" "}
          <Link
            href="/data-privacy"
            className="font-medium text-[var(--color-ink)] underline-offset-4 hover:underline"
          >
            Manage
          </Link>
          .
        </p>
        <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
          <button
            type="button"
            onClick={() => decide(false)}
            className="rounded-full border border-[var(--color-line-strong)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-warm)]"
          >
            Essentials only
          </button>
          <button
            type="button"
            onClick={() => decide(true)}
            className="rounded-full bg-[var(--color-sage)] px-4 py-2 text-sm font-medium text-[var(--color-brown-900)] hover:bg-[var(--color-sage-deep)]"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
