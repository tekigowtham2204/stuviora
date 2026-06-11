import { Plug, KeyRound, RefreshCw, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { scopedPartner } from "@/lib/auth/university";
import { rotateApiKey } from "@/app/actions/university";

export const metadata = { title: "Integration" };

export default async function IntegrationPage({
  searchParams,
}: {
  searchParams: Promise<{ rotated?: string }>;
}) {
  const { rotated } = await searchParams;
  const partner = await scopedPartner();

  return (
    <>
      <PageHeader
        eyebrow="API"
        title="Integration."
        subtitle="Pull your cohort data into your own systems over our signed REST API."
      />

      {rotated && (
        <Card role="status" aria-live="polite" surface="flat" tint="sage" className="mb-6 flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-[var(--color-sage-deep)]" />
          <span className="text-[var(--color-sage-900)]">
            Secret rotated. In live mode your new secret is shown once here; the old one stops working immediately.
          </span>
        </Card>
      )}

      <Card>
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-[var(--color-sage-deep)]" />
          <CardTitle>Your API key</CardTitle>
        </div>
        <div className="mt-4 space-y-1.5 text-sm">
          <div className="text-[var(--color-ink-muted)]">Key id (send as X-Api-Key)</div>
          <code className="block rounded-lg bg-[var(--color-surface-warm)] px-3 py-2 font-mono text-[var(--color-ink)]">
            {partner?.keyId ?? "not issued"}
          </code>
          <p className="pt-1 text-xs text-[var(--color-ink-faint)]">
            Your secret is never shown after creation. Rotate it if it leaks.
          </p>
        </div>
        <form action={rotateApiKey} className="mt-4">
          <Button type="submit" variant="secondary">
            <RefreshCw className="h-4 w-4" /> Rotate secret
          </Button>
        </form>
      </Card>

      <Card className="mt-6">
        <div className="flex items-center gap-2">
          <Plug className="h-4 w-4 text-[var(--color-sage-deep)]" />
          <CardTitle>How to sign a request</CardTitle>
        </div>
        <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
          Every request to <code className="font-mono">/api/v1/university/*</code> is
          authenticated with an HMAC-SHA256 signature. Build the canonical
          string, sign it with your secret, and send these headers.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-[var(--color-surface-warm)] p-3 text-xs leading-relaxed text-[var(--color-ink)]">
{`canonical = METHOD + "\\n" + PATH + "\\n" + TIMESTAMP + "\\n" + NONCE + "\\n" + sha256hex(BODY)
signature = hmac_sha256_hex(secret, canonical)

Headers:
  X-Api-Key:            <your key id>
  X-Stuviora-Timestamp: <epoch millis>
  X-Stuviora-Nonce:     <unique per request>
  X-Stuviora-Signature: <signature>

Timestamps older than 5 minutes are rejected.`}
        </pre>
        <p className="mt-3 text-xs text-[var(--color-ink-faint)]">
          Endpoints: GET /api/v1/university/students and
          GET /api/v1/university/gmv, both filterable by ?college=.
        </p>
      </Card>
    </>
  );
}
