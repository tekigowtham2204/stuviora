/**
 * Standalone Supabase connection verifier.
 *
 * Proves the live Supabase wiring end-to-end WITHOUT booting the app, so you
 * can confirm "is Supabase connected properly" from any machine that can
 * reach your project (e.g. your laptop, or CI) even if a sandboxed container
 * cannot. It checks, in order:
 *
 *   1. Config present     - the three env vars resolve.
 *   2. Auth reachable      - GET /auth/v1/health returns 200.
 *   3. Schema + seed       - the public `colleges` reference table is readable
 *                            and non-empty (proves migrations ran AND seeded).
 *   4. Service role        - the service key can read a protected table
 *                            (`users`) that the anon role must not.
 *   5. RLS on              - the anon client is blocked from that same table.
 *   6. Storage buckets     - the four buckets from 0005 exist.
 *
 * Run it (keys come from .env.local):
 *   node --env-file=.env.local scripts/verify-supabase.mjs
 *
 * Exit code 0 = all checks passed; 1 = at least one failed.
 * No secrets are printed; keys are only ever shown as a short masked prefix.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let failures = 0;
const pass = (m) => console.log(`  ✓ ${m}`);
const fail = (m) => {
  console.log(`  ✗ ${m}`);
  failures++;
};
const mask = (k) => (k ? `${k.slice(0, 8)}…(${k.length})` : "MISSING");

async function main() {
  console.log("Supabase connection verifier\n");
  console.log(`  URL:         ${url || "MISSING"}`);
  console.log(`  anon key:    ${mask(anonKey)}`);
  console.log(`  service key: ${mask(serviceKey)}\n`);

  // 1. Config present
  console.log("1. Config");
  if (url && anonKey && serviceKey) pass("all three env vars resolved");
  else {
    fail("missing env var(s) - set them in .env.local");
    return finish(); // nothing else can run
  }

  const anon = createClient(url, anonKey, { auth: { persistSession: false } });
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  // 2. Auth reachable
  console.log("2. Auth endpoint");
  try {
    const r = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: anonKey },
      signal: AbortSignal.timeout(10000),
    });
    if (r.ok) pass(`/auth/v1/health -> ${r.status}`);
    else fail(`/auth/v1/health -> ${r.status} ${(await r.text()).slice(0, 80)}`);
  } catch (e) {
    fail(`auth unreachable: ${e.message}`);
  }

  // 3. Schema + seed: public reference table is readable and seeded
  console.log("3. Schema + seed data (colleges)");
  {
    const { data, error } = await anon.from("colleges").select("*").limit(5);
    if (error) fail(`read colleges: ${error.message} (did migrations run?)`);
    else if (!data?.length)
      fail("colleges table is empty (seed migration 0003 may not have run)");
    else pass(`colleges readable, ${data.length}+ rows seeded`);
  }

  // 4. Service role can read a protected table
  console.log("4. Service role reads protected table (users)");
  {
    const { error } = await admin.from("users").select("id").limit(1);
    if (error) fail(`service read users: ${error.message}`);
    else pass("service role can read users");
  }

  // 5. RLS blocks the anon client from that same table
  console.log("5. RLS blocks anon from users");
  {
    const { data, error } = await anon.from("users").select("id").limit(1);
    // Either an explicit RLS error, or zero rows returned, is a pass.
    if (error) pass(`anon blocked (${error.message.slice(0, 50)})`);
    else if (!data?.length) pass("anon sees zero rows (RLS active)");
    else fail("anon READ users returned rows - RLS may be off!");
  }

  // 6. Storage buckets
  console.log("6. Storage buckets");
  {
    const { data, error } = await admin.storage.listBuckets();
    if (error) fail(`listBuckets: ${error.message}`);
    else {
      const want = ["portfolio", "submissions", "dispute_evidence", "gst_invoices"];
      const have = new Set((data || []).map((b) => b.id));
      const missing = want.filter((b) => !have.has(b));
      if (missing.length) fail(`missing buckets: ${missing.join(", ")}`);
      else pass(`all 4 buckets present: ${want.join(", ")}`);
    }
  }

  finish();
}

function finish() {
  console.log("");
  if (failures === 0) {
    console.log("RESULT: ✓ Supabase is connected and configured correctly.");
    process.exit(0);
  } else {
    console.log(`RESULT: ✗ ${failures} check(s) failed - see above.`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("verifier crashed:", e.message);
  process.exit(1);
});
