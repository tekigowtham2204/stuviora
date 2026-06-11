"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { trackEvent } from "@/lib/observability";
import { portfolioDrafts } from "@/lib/demo/state";

/**
 * Portfolio import (audit #37 paste-profile, #38 GitHub).
 *
 * GitHub: fetches the user's public repos (no key needed), takes the
 * most-starred, and drafts portfolio items the student approves before
 * publish. Paste-profile: deterministic line extraction in demo; the
 * live path upgrades extraction to chatJson with the same output shape.
 */

export async function importFromGithub(formData: FormData) {
  const session = await requireRole("student");
  const username = ((formData.get("github") as string) || "")
    .trim()
    .replace(/^@/, "");
  if (!/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
    redirect("/student/import?error=bad_username");
  }

  let added = 0;
  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      { headers: { Accept: "application/vnd.github+json" } }
    );
    if (!res.ok) redirect("/student/import?error=github_not_found");
    const repos = (await res.json()) as Array<{
      name: string;
      description: string | null;
      stargazers_count: number;
      fork: boolean;
      html_url: string;
    }>;
    const top = repos
      .filter((r) => !r.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5);
    for (const r of top) {
      portfolioDrafts.unshift({
        id: `gh-${username}-${r.name}`,
        title: r.name,
        outcome:
          (r.description?.trim() || "Open-source project") +
          (r.stargazers_count ? ` (${r.stargazers_count} stars)` : ""),
        source: "github",
      });
      added++;
    }
  } catch {
    redirect("/student/import?error=github_unreachable");
  }

  trackEvent("portfolio_import", { source: "github", added }, session.user.id);
  redirect(`/student/import?imported=${added}`);
}

export async function importFromProfileText(formData: FormData) {
  const session = await requireRole("student");
  const text = ((formData.get("profileText") as string) || "").trim();
  if (text.length < 40) redirect("/student/import?error=too_short");

  // Demo extraction: each non-trivial line becomes a draft (title = first
  // clause, outcome = rest). Live: chatJson extracts {title, outcome}[]
  // with the same shape, so the UI does not change.
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length >= 12)
    .slice(0, 6);
  for (const line of lines) {
    const [title, ...rest] = line.split(/[:.-]\s+/);
    portfolioDrafts.unshift({
      id: `pf-${Date.now()}-${portfolioDrafts.length}`,
      title: (title || line).slice(0, 60),
      outcome: rest.join(". ").slice(0, 160) || "Imported from profile.",
      source: "profile",
    });
  }

  trackEvent(
    "portfolio_import",
    { source: "profile", added: lines.length },
    session.user.id
  );
  redirect(`/student/import?imported=${lines.length}`);
}
