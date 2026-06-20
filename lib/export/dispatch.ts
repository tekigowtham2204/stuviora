import "server-only";
import {
  buildExportPlan,
  type ExportDestination,
} from "@/lib/export/plan";
import { adapterFor, type ExportResult } from "@/lib/export/adapters";
import { trackEvent } from "@/lib/observability";

/**
 * Execute an order's auto-export plan: the pure engine decides what goes
 * where (consent guardrail), then each destination's adapter performs it.
 * External adapters skip cleanly until their OAuth keys are configured, so
 * this runs end-to-end in demo without publishing client-owned work.
 *
 * Never throws: a failed export must not block order completion.
 */
export async function runAutoExport(opts: {
  orderId: string;
  studentId: string;
  connected: ExportDestination[];
  clientShareable: boolean;
}): Promise<ExportResult[]> {
  const plan = buildExportPlan({
    orderCompleted: true,
    connected: opts.connected,
    clientShareable: opts.clientShareable,
  });
  const results: ExportResult[] = [];
  for (const action of plan) {
    let result: ExportResult;
    try {
      result = await adapterFor(action.destination).run(action, {
        orderId: opts.orderId,
        studentId: opts.studentId,
      });
    } catch {
      result = {
        destination: action.destination,
        status: "failed",
        detail: "adapter error",
      };
    }
    results.push(result);
    trackEvent(
      "work_exported",
      {
        orderId: opts.orderId,
        destination: action.destination,
        artifact: action.artifact,
        visibility: action.visibility,
        status: result.status,
      },
      opts.studentId
    );
  }
  return results;
}
