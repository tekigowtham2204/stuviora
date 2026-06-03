"use client";
import { createBrowserClient } from "@supabase/ssr";
import { env, services } from "@/lib/env";

/** Browser Supabase client. Returns null in demo mode. */
export function getBrowserSupabase() {
  if (!services.supabase) return null;
  return createBrowserClient(env.supabaseUrl!, env.supabaseAnonKey!);
}
