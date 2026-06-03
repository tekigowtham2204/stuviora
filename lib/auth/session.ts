import "server-only";
import { cookies } from "next/headers";
import type { Role } from "@/lib/types";
import {
  students,
  clients,
  admin,
  DEMO_STUDENT_ID,
  DEMO_CLIENT_ID,
} from "@/lib/demo/data";

export interface SessionUser {
  id: string;
  role: Role;
  name: string;
  initials: string;
}

const COOKIE = "sv_session";

/** Read the current session from the cookie (demo + live share this shape). */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

/** Persist a session cookie (called from auth Server Actions). */
export async function setSession(user: SessionUser) {
  const store = await cookies();
  store.set(COOKIE, JSON.stringify(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

/** The signed-in student persona ("you" on student pages). */
export function currentStudent() {
  return students.find((s) => s.id === DEMO_STUDENT_ID)!;
}

/** The signed-in client persona ("you" on client pages). */
export function currentClient() {
  return clients.find((c) => c.id === DEMO_CLIENT_ID)!;
}

/** The signed-in admin persona ("you" on admin pages). */
export function currentAdmin() {
  return admin;
}
