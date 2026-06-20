import "server-only";
import type { ExportAction, ExportDestination } from "@/lib/export/plan";

/**
 * Per-destination export adapters (Phase 2). Each adapter knows how to push
 * one ExportAction to its destination, honouring the action's visibility
 * (private unless the client licensed public sharing) and artifact (raw files
 * vs the case-study). The real API calls land once the operator configures the
 * destination's OAuth app + tokens; until then `isConfigured()` is false and
 * the adapter cleanly skips, so the pipeline runs end-to-end in demo without
 * publishing anything.
 */

export interface ExportContext {
  orderId: string;
  studentId: string;
}

export interface ExportResult {
  destination: ExportDestination;
  status: "exported" | "skipped" | "failed";
  detail: string;
}

export interface ExportAdapter {
  destination: ExportDestination;
  /** True when credentials/tokens are present to actually publish. */
  isConfigured(): boolean;
  run(action: ExportAction, ctx: ExportContext): Promise<ExportResult>;
}

/**
 * External OAuth destinations (GitHub / Drive / Notion). Stubbed until their
 * OAuth app + token storage exist. Live `run` will: resolve the student's
 * token (export_destinations.token_ref -> PII vault), then push - GitHub:
 * create/commit a (private unless licensed) repo; Drive: upload to a folder;
 * Notion: create a page. Raw files only when action.visibility === "public"
 * is permitted; otherwise the case-study.
 */
function externalAdapter(destination: ExportDestination): ExportAdapter {
  return {
    destination,
    isConfigured: () => false,
    async run(_action, _ctx) {
      void _action;
      void _ctx;
      return {
        destination,
        status: "skipped",
        detail: `${destination} not connected (OAuth pending Phase 2 keys)`,
      };
    },
  };
}

/**
 * On-platform portfolio: no external credentials, so it is always available.
 * Live `run` will publish a portfolio_item (a raw-artifact link when the order
 * is licensed, otherwise the case-study draft). Demo records the intent.
 */
const portfolioAdapter: ExportAdapter = {
  destination: "portfolio",
  isConfigured: () => true,
  async run(action, _ctx) {
    void _ctx;
    return {
      destination: "portfolio",
      status: "exported",
      detail: `published ${action.artifact} to the on-platform portfolio`,
    };
  },
};

const ADAPTERS: Record<ExportDestination, ExportAdapter> = {
  github: externalAdapter("github"),
  drive: externalAdapter("drive"),
  notion: externalAdapter("notion"),
  portfolio: portfolioAdapter,
};

export function adapterFor(destination: ExportDestination): ExportAdapter {
  return ADAPTERS[destination];
}
