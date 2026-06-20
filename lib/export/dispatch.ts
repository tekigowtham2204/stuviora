import "server-only";
import {
  buildExportPlan,
  type ExportAction,
  type ExportDestination,
} from "@/lib/export/plan";
import { trackEvent } from "@/lib/observability";

/**
 * Execute an order's auto-export plan. Phase 1: the plan is computed by the
 * pure engine and each action is recorded (demo logs; analytics funnel). The
 * real per-destination adapters (GitHub repo + commit, Drive upload, Notion
 * page, on-platform portfolio publish) light up in Phase 2 once their OAuth
 * apps + tokens are configured by the operator; they are intentionally not
 * wired here so nothing can publish client-owned work before that review.
 *
 * Never throws: a failed export must not block order completion.
 */
export async function runAutoExport(opts: {
  orderId: string;
  studentId: string;
  connected: ExportDestination[];
  clientShareable: boolean;
}): Promise<ExportAction[]> {
  const plan = buildExportPlan({
    orderCompleted: true,
    connected: opts.connected,
    clientShareable: opts.clientShareable,
  });
  for (const action of plan) {
    try {
      // Phase 2 live adapters slot in here, e.g.:
      //   if (action.destination === "github") await pushToGithub(...)
      // Each must honour action.visibility (private repo unless public) and
      // action.artifact (raw files only when visibility is allowed, else the
      // case-study). For now we record the intent.
      trackEvent(
        "work_exported",
        {
          orderId: opts.orderId,
          destination: action.destination,
          artifact: action.artifact,
          visibility: action.visibility,
        },
        opts.studentId
      );
    } catch {
      // Swallow: one destination failing must not abort the rest or the order.
    }
  }
  return plan;
}
