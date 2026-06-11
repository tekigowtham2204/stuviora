# Stuviora mobile (P10, M7.3) — scaffold

The Expo React Native app ships over the same Next.js + Supabase
backend. It is NOT buildable in the web repo's CI environment (needs
the Expo toolchain, EAS credentials, and device targets), so this
directory holds the agreed plan; the app itself starts as a separate
workspace when a machine with the Expo toolchain picks it up.

## Scope (master plan M7.3)
- Auth (college-email OTP via Supabase), role-aware shell.
- Student: dashboard, matches, orders, submit flow, messages, earnings.
- Client: post job, proposals, order review.
- Push notifications (Expo Notifications + the P5 notification_log cap).

## Architecture decisions (already made)
- Workspace: `mobile/` Expo app + `@stuviora/shared` package extracted
  from `lib/` for types + pure engines (trust, pricing, matching),
  which are already I/O-free and reusable as-is.
- API surface: the existing Server Actions stay web-only; mobile talks
  to Supabase directly (RLS is already complete) + a thin REST layer
  for gate/payment operations that must stay server-side.
- Design: warm-earth tokens port to a React Native theme file; Fraunces
  and Geist load via expo-font.

## Definition of done
Internal-track builds (TestFlight + Play internal) of the core loop:
sign in -> see matches -> open order -> submit -> get the AI verdict ->
see payout. EAS configured with the same `services.<flag>` discipline.
