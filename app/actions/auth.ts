"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  setSession,
  clearSession,
  currentStudent,
  currentClient,
  currentAdmin,
} from "@/lib/auth/session";
import { services } from "@/lib/env";
import { DEMO_UNIVERSITY } from "@/lib/demo/data";
import { rateLimit } from "@/lib/ratelimit";
import { trackEvent } from "@/lib/observability";
import { getServerSupabase } from "@/lib/supabase/server";
import {
  requireVerifiedCollege,
  UnverifiedCollegeError,
  emailDomain,
} from "@/lib/auth/college-domains";

/**
 * Auth Server Actions (P2).
 *
 * Live mode (services.supabase):
 *   - startStudentSignup: enforce college-email allowlist,
 *     supabase.auth.signInWithOtp(email).
 *   - startClientSignup: supabase.auth.signInWithOtp(email).
 *   - verifyOtp: supabase.auth.verifyOtp with token; on success,
 *     setSession() + redirect to the right onboarding.
 *   - loginAs: bypass in production; demo-only persona-picker.
 *
 * Demo mode:
 *   - All routes mirror the live shape but skip the real Supabase
 *     interactions. They establish a session cookie for the
 *     selected persona so the dev flow is fully clickable.
 *
 * Errors are surfaced via query-string params on the verify-email
 * page so the page can render a specific message.
 */

export async function loginAs(formData: FormData) {
  const role = (formData.get("role") as string) || "student";
  if (role === "client") {
    const c = currentClient();
    await setSession({
      id: c.id,
      role: "client",
      name: c.fullName,
      initials: c.avatarInitials,
    });
    redirect("/client/dashboard");
  }
  if (role === "admin") {
    const a = currentAdmin();
    await setSession({
      id: a.id,
      role: "admin",
      name: a.fullName,
      initials: a.avatarInitials,
    });
    redirect("/admin/dashboard");
  }
  if (role === "university") {
    const u = DEMO_UNIVERSITY;
    await setSession({
      id: u.id,
      role: "university",
      name: u.fullName,
      initials: u.avatarInitials,
      college: u.college,
    });
    redirect("/university/dashboard");
  }
  const s = currentStudent();
  await setSession({
    id: s.id,
    role: "student",
    name: s.fullName,
    initials: s.avatarInitials,
  });
  redirect("/student/dashboard");
}

export async function startStudentSignup(formData: FormData) {
  const email = ((formData.get("email") as string) || "").trim();
  if (!email) redirect("/auth/signup/student?error=missing_email");

  if (services.supabase) {
    // 1. College-email allowlist check (lib/auth/college-domains.ts).
    try {
      await requireVerifiedCollege(email);
    } catch (err) {
      if (err instanceof UnverifiedCollegeError) {
        redirect(
          `/auth/signup/student?error=college_not_listed&domain=${encodeURIComponent(
            err.domain
          )}`
        );
      }
      throw err;
    }

    // 2. Send OTP via Supabase Auth.
    const supabase = await getServerSupabase();
    if (supabase) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { data: { role: "student" } },
      });
      if (error) {
        redirect(
          `/auth/signup/student?error=otp_send_failed&detail=${encodeURIComponent(
            error.message
          )}`
        );
      }
    }
  }

  redirect(
    `/auth/verify-email?role=student&email=${encodeURIComponent(email)}`
  );
}

export async function startClientSignup(formData: FormData) {
  const email = ((formData.get("email") as string) || "").trim();
  if (!email) redirect("/auth/signup/client?error=missing_email");

  if (services.supabase) {
    // Clients can use any business email; no college-domain check.
    const dom = emailDomain(email);
    if (!dom) redirect("/auth/signup/client?error=invalid_email");

    const supabase = await getServerSupabase();
    if (supabase) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { data: { role: "client" } },
      });
      if (error) {
        redirect(
          `/auth/signup/client?error=otp_send_failed&detail=${encodeURIComponent(
            error.message
          )}`
        );
      }
    }
  }

  redirect(
    `/auth/verify-email?role=client&email=${encodeURIComponent(email)}`
  );
}

export async function verifyOtp(formData: FormData) {
  const role = (formData.get("role") as string) || "student";
  const email = ((formData.get("email") as string) || "").trim();
  const otp = ((formData.get("otp") as string) || "").trim();

  // Throttle code-checking to blunt brute-force on the 6-digit OTP.
  // Per-email caps a targeted attack; per-IP caps email-spray from one host.
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const [emailLimit, ipLimit] = await Promise.all([
    rateLimit({ key: `verifyOtp:${email || "anon"}`, max: 6, windowMs: 60_000 }),
    rateLimit({ key: `verifyOtp-ip:${ip}`, max: 30, windowMs: 60_000 }),
  ]);
  if (!emailLimit.allowed || !ipLimit.allowed) {
    redirect(
      `/auth/verify-email?role=${role}&email=${encodeURIComponent(
        email
      )}&error=rate_limited`
    );
  }

  if (services.supabase && email && otp) {
    const supabase = await getServerSupabase();
    if (supabase) {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });
      if (error || !data?.user) {
        redirect(
          `/auth/verify-email?role=${role}&email=${encodeURIComponent(
            email
          )}&error=invalid_otp`
        );
      }

      // Hydrate name for the session cookie; live getSession() will
      // reconfirm against Supabase Auth on subsequent reads.
      const name = data!.user.user_metadata?.full_name ?? email;
      await setSession({
        id: data!.user.id,
        role: role as Parameters<typeof setSession>[0]["role"],
        name,
        initials: initialsFrom(name),
      });
      trackEvent("email_verified", { role }, data!.user.id);
      if (role === "client") redirect("/client/onboarding");
      redirect("/student/onboarding");
    }
  }

  // Demo path: accept any code (the verify-email page advertises this).
  trackEvent("email_verified", { role, demo: true });
  if (role === "client") {
    const c = currentClient();
    await setSession({
      id: c.id,
      role: "client",
      name: c.fullName,
      initials: c.avatarInitials,
    });
    redirect("/client/onboarding");
  }
  const s = currentStudent();
  await setSession({
    id: s.id,
    role: "student",
    name: s.fullName,
    initials: s.avatarInitials,
  });
  redirect("/student/onboarding");
}

export async function logout() {
  await clearSession();
  redirect("/");
}

function initialsFrom(name: string): string {
  const parts = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return "?";
  return parts.map((p) => p[0]!.toUpperCase()).join("");
}
