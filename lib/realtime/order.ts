import "server-only";
import { getServiceSupabase } from "@/lib/supabase/server";
import { services } from "@/lib/env";

/**
 * Order-channel realtime push (M3: "Realtime push to student").
 *
 * Live: broadcasts the AI verdict on channel `order:{orderId}` via
 * Supabase Realtime so the submit page can show the result without
 * polling. Demo: no-op (the demo gate runs synchronously, so the page
 * already has the verdict on redirect).
 */
export async function publishOrderVerdict(
  orderId: string,
  payload: { score: number; verdict: "PASS" | "FAIL" }
): Promise<void> {
  if (!services.supabase) return;
  const supabase = getServiceSupabase();
  if (!supabase) return;
  try {
    const channel = supabase.channel(`order:${orderId}`);
    await channel.send({
      type: "broadcast",
      event: "ai_verdict",
      payload,
    });
    await supabase.removeChannel(channel);
  } catch {
    // Realtime is best-effort; the order page also reads the persisted row.
  }
}
