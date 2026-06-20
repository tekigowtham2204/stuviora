"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/dal";
import { trackEvent } from "@/lib/observability";
import {
  connectedExportDestinations,
  autoExport,
  shareableOrderIds,
} from "@/lib/demo/state";
import {
  DESTINATION_VISIBILITY,
  type ExportDestination,
} from "@/lib/export/plan";

/**
 * Auto-export controls (features.md 2026-06-18).
 *
 * Demo paths mutate in-memory state so the flow is exercisable with zero
 * keys. Live paths (Phase 2) will: persist connected destinations in
 * export_destinations after the OAuth handshake, and flip orders.shareable.
 */

function isDestination(v: string): v is ExportDestination {
  return v in DESTINATION_VISIBILITY;
}

/** Student: connect or disconnect an export destination. */
export async function toggleDestination(formData: FormData) {
  const session = await requireRole("student");
  const dest = (formData.get("destination") as string) || "";
  if (!isDestination(dest)) redirect("/settings?error=bad_destination");

  // Live: a real connect kicks off the destination's OAuth flow; here we just
  // record the intent so the demo loop works.
  let connected: boolean;
  if (connectedExportDestinations.has(dest)) {
    connectedExportDestinations.delete(dest);
    connected = false;
  } else {
    connectedExportDestinations.add(dest);
    connected = true;
  }
  trackEvent("export_destination_toggled", { destination: dest, connected }, session.user.id);
  revalidatePath("/settings");
  redirect("/settings?saved=1");
}

/** Student: master switch for auto-export on order completion. */
export async function setAutoExport(formData: FormData) {
  const session = await requireRole("student");
  autoExport.enabled = formData.get("enabled") === "on";
  trackEvent("auto_export_set", { enabled: autoExport.enabled }, session.user.id);
  revalidatePath("/settings");
  redirect("/settings?saved=1");
}

/**
 * Client: grant or revoke a public portfolio license for one order. Only the
 * client who owns the order may license its work for public sharing; this is
 * the consent gate that lets raw deliverables reach public destinations.
 */
export async function setOrderShareable(formData: FormData) {
  const session = await requireRole("client");
  const orderId = (formData.get("orderId") as string) || "";
  if (!orderId) redirect("/client/orders");
  const shareable = formData.get("shareable") === "on";
  // Live: UPDATE orders SET shareable = ? WHERE id = ? AND client_id = session.
  if (shareable) shareableOrderIds.add(orderId);
  else shareableOrderIds.delete(orderId);
  trackEvent("order_shareable_set", { orderId, shareable }, session.user.id);
  revalidatePath(`/client/orders/${orderId}`);
  redirect(`/client/orders/${orderId}?shared=${shareable ? "1" : "0"}`);
}
