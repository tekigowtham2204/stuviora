/*
 * k6 smoke + light-load script (P8).
 *
 * Hits the public surfaces and a couple of authenticated-redirecting
 * routes to catch gross regressions and measure p95 under modest load.
 * This is a load *harness*, not a unit test; run it against a deployed
 * staging URL, never production without a plan.
 *
 * Usage:
 *   BASE_URL=https://staging.stuviora.com k6 run loadtest/k6-smoke.js
 *   k6 run loadtest/k6-smoke.js            # defaults to localhost:3000
 *
 * Thresholds mirror the master plan guardrail: page-load p95 < 2.5s.
 */

import http from "k6/http";
import { check, sleep, group } from "k6";

const BASE = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  stages: [
    { duration: "30s", target: 10 }, // ramp up
    { duration: "1m", target: 25 }, // sustain
    { duration: "30s", target: 0 }, // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<2500"], // master plan: p95 < 2.5s
    http_req_failed: ["rate<0.01"], // < 1% errors
  },
};

const PUBLIC_ROUTES = ["/", "/how-it-works", "/explore", "/help", "/about"];

export default function smoke() {
  group("public pages", () => {
    for (const path of PUBLIC_ROUTES) {
      const res = http.get(`${BASE}${path}`);
      check(res, {
        [`${path} is 200`]: (r) => r.status === 200,
        [`${path} has body`]: (r) => r.body && r.body.length > 0,
      });
      sleep(0.5);
    }
  });

  group("auth pages", () => {
    const res = http.get(`${BASE}/auth/signup/student`);
    check(res, { "signup is 200": (r) => r.status === 200 });
  });

  group("unauth api gate", () => {
    // Should be a clean 401, never a 500.
    const res = http.get(`${BASE}/api/privacy/export`);
    check(res, { "export gate is 401": (r) => r.status === 401 });
  });

  sleep(1);
}
