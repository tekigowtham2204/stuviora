/**
 * Profile completeness (freelancer.com-style activation meter).
 *
 * The reference pattern: a percentage meter plus the single next action,
 * shown until the profile is complete. Weighted toward the items that
 * most affect matching and client trust. Pure; the dashboard feeds in
 * the profile + flags from demo state or live rows.
 */

import type { StudentProfile } from "@/lib/types";

export interface CompletenessInput {
  student: StudentProfile;
  portfolioCount: number;
  hasSkillBadge: boolean;
  hasPayoutDetails: boolean;
}

export interface CompletenessItem {
  key: string;
  label: string;
  done: boolean;
  weight: number;
  href: string;
}

export interface Completeness {
  percent: number;
  items: CompletenessItem[];
  /** The highest-weight unfinished item, if any. */
  next: CompletenessItem | null;
}

export function computeProfileCompleteness(
  input: CompletenessInput
): Completeness {
  const s = input.student;
  const items: CompletenessItem[] = [
    {
      key: "headline",
      label: "Write a headline",
      done: s.headline.trim().length >= 10,
      weight: 15,
      href: "/student/onboarding",
    },
    {
      key: "bio",
      label: "Add a short bio",
      done: s.bio.trim().length >= 40,
      weight: 10,
      href: "/student/onboarding",
    },
    {
      key: "skills",
      label: "Pick at least 3 skills",
      done: s.skills.length >= 3,
      weight: 20,
      href: "/student/onboarding",
    },
    {
      key: "portfolio",
      label: "Add one portfolio sample",
      done: input.portfolioCount >= 1,
      weight: 25,
      href: "/student/import",
    },
    {
      key: "skill_badge",
      label: "Pass a skill test",
      done: input.hasSkillBadge,
      weight: 20,
      href: "/student/skill-test",
    },
    {
      key: "payout",
      label: "Add payout details",
      done: input.hasPayoutDetails,
      weight: 10,
      href: "/student/payouts",
    },
  ];

  const total = items.reduce((s2, i) => s2 + i.weight, 0);
  const earned = items
    .filter((i) => i.done)
    .reduce((s2, i) => s2 + i.weight, 0);
  const pending = items
    .filter((i) => !i.done)
    .sort((a, b) => b.weight - a.weight);

  return {
    percent: Math.round((earned / total) * 100),
    items,
    next: pending[0] ?? null,
  };
}
