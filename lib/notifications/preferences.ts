/**
 * Notification preferences (M5.5).
 *
 * Pure helpers around the `notification_preferences` row. The store is
 * branched at the data layer (lib/data/queries.ts → getNotificationPreferences).
 * Server Actions in app/actions/notifications.ts mutate via this module.
 */

import type { NotificationPreferences } from "@/lib/types";

export const PREF_KEYS = [
  "emailJobMatches",
  "emailOrderUpdates",
  "emailWeeklyDigest",
  "emailMarketing",
] as const;

export type PrefKey = (typeof PREF_KEYS)[number];

export function applyPrefUpdate(
  current: NotificationPreferences,
  patch: Partial<Record<PrefKey, boolean>>
): NotificationPreferences {
  return { ...current, ...patch };
}
