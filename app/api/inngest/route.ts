import { serve } from "inngest/next";
import { Inngest } from "inngest";
import * as funcs from "@/inngest/functions";
import { env, services } from "@/lib/env";

/**
 * Inngest registration endpoint (P4).
 *
 * Inngest Cloud pulls this URL to discover registered functions. Each
 * `createFunction` below wraps one of the plain async handlers in
 * inngest/functions.ts so they remain unit-testable.
 *
 * In DEMO_MODE we still expose the route so `inngest dev` works
 * locally, but no events fire because the lib/inngest/client send is
 * a no-op without a key.
 */

const client = new Inngest({
  id: "stuviora",
  eventKey: env.inngestEventKey ?? "demo",
  signingKey: env.inngestSigningKey,
});

// --- Cron functions ---------------------------------------------------------

const escrowAutoRelease = client.createFunction(
  { id: "escrow-auto-release", triggers: [{ cron: "*/30 * * * *" }] },
  async () => funcs.escrowAutoRelease()
);

const commissionReconciler = client.createFunction(
  { id: "commission-reconciler", triggers: [{ cron: "0 2 * * *" }] },
  async () => funcs.commissionReconciler()
);

const weeklyEarningsDigest = client.createFunction(
  { id: "weekly-earnings-digest", triggers: [{ cron: "0 9 * * 1" }] },
  async () => funcs.weeklyEarningsDigest()
);

const tdsThresholdChecker = client.createFunction(
  { id: "tds-threshold-checker", triggers: [{ cron: "0 0 1 * *" }] },
  async () => funcs.tdsThresholdChecker()
);

// --- Event-driven functions -------------------------------------------------

const aiQualityCheck = client.createFunction(
  { id: "ai-quality-check", triggers: [{ event: "ai/quality.check" }] },
  async ({ event }: { event: { data: Parameters<typeof funcs.aiQualityCheck>[0] } }) =>
    funcs.aiQualityCheck(event.data)
);

const trustScoreRecalc = client.createFunction(
  { id: "trust-score-recalc", triggers: [{ event: "trust/recalc" }] },
  async ({ event }: { event: { data: Parameters<typeof funcs.trustScoreRecalc>[0] } }) =>
    funcs.trustScoreRecalc(event.data)
);

const portfolioAutoGenerator = client.createFunction(
  { id: "portfolio-auto-generator", triggers: [{ event: "portfolio/generate" }] },
  async ({ event }: { event: { data: Parameters<typeof funcs.portfolioAutoGenerator>[0] } }) =>
    funcs.portfolioAutoGenerator(event.data)
);

const smartMatchFanout = client.createFunction(
  { id: "smart-match-fanout", triggers: [{ event: "matching/notify" }] },
  async ({ event }: { event: { data: Parameters<typeof funcs.smartMatchFanout>[0] } }) =>
    funcs.smartMatchFanout(event.data)
);

const disputeEscalationTimer = client.createFunction(
  { id: "dispute-escalation-timer", triggers: [{ event: "dispute/escalate" }] },
  async ({ event }: { event: { data: Parameters<typeof funcs.disputeEscalationTimer>[0] } }) =>
    funcs.disputeEscalationTimer(event.data)
);

const taxEventLogger = client.createFunction(
  { id: "tax-event-logger", triggers: [{ event: "tax/log" }] },
  async ({ event }: { event: { data: Parameters<typeof funcs.taxEventLogger>[0] } }) =>
    funcs.taxEventLogger(event.data)
);

const functions = [
  escrowAutoRelease,
  commissionReconciler,
  weeklyEarningsDigest,
  tdsThresholdChecker,
  aiQualityCheck,
  trustScoreRecalc,
  portfolioAutoGenerator,
  smartMatchFanout,
  disputeEscalationTimer,
  taxEventLogger,
];

// Only export the serve handlers when Inngest is configured. Without
// keys, return a JSON shape so the route is discoverable but inert.
export const dynamic = "force-dynamic";

const handlers = services.inngest
  ? serve({ client, functions })
  : {
      GET: () =>
        new Response(
          JSON.stringify({
            registered: false,
            reason: "INNGEST_EVENT_KEY not set",
          }),
          { headers: { "content-type": "application/json" } }
        ),
      POST: () => new Response(null, { status: 503 }),
      PUT: () => new Response(null, { status: 503 }),
    };

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
