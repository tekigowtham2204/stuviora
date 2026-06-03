"use server";

import { redirect } from "next/navigation";
import { setSession, clearSession } from "@/lib/auth/session";
import { currentStudent, currentClient, currentAdmin } from "@/lib/auth/session";

/**
 * Demo auth actions. They establish a session cookie for the chosen persona
 * and route to the right place. When Supabase is wired up, these call
 * supabase.auth.signInWithOtp / verifyOtp instead — the redirects stay the same.
 */

export async function loginAs(formData: FormData) {
  const role = (formData.get("role") as string) || "student";
  if (role === "client") {
    const c = currentClient();
    await setSession({ id: c.id, role: "client", name: c.fullName, initials: c.avatarInitials });
    redirect("/client/dashboard");
  }
  if (role === "admin") {
    const a = currentAdmin();
    await setSession({ id: a.id, role: "admin", name: a.fullName, initials: a.avatarInitials });
    redirect("/admin/dashboard");
  }
  const s = currentStudent();
  await setSession({ id: s.id, role: "student", name: s.fullName, initials: s.avatarInitials });
  redirect("/student/dashboard");
}

export async function startStudentSignup(formData: FormData) {
  // In live mode: validate college-domain email, send OTP via Supabase/Resend.
  const email = (formData.get("email") as string) || "";
  redirect(`/auth/verify-email?role=student&email=${encodeURIComponent(email)}`);
}

export async function startClientSignup(formData: FormData) {
  const email = (formData.get("email") as string) || "";
  redirect(`/auth/verify-email?role=client&email=${encodeURIComponent(email)}`);
}

export async function verifyOtp(formData: FormData) {
  const role = (formData.get("role") as string) || "student";
  if (role === "client") {
    const c = currentClient();
    await setSession({ id: c.id, role: "client", name: c.fullName, initials: c.avatarInitials });
    redirect("/client/onboarding");
  }
  const s = currentStudent();
  await setSession({ id: s.id, role: "student", name: s.fullName, initials: s.avatarInitials });
  redirect("/student/onboarding");
}

export async function logout() {
  await clearSession();
  redirect("/");
}
