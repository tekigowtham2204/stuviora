import { describe, it, expect } from "vitest";
import {
  defaultConsent,
  applyConsentChoices,
  buildConsentRecord,
  CONSENT_NOTICE_VERSION,
} from "@/lib/privacy/consent";

describe("consent model", () => {
  it("defaults essentials on, optionals off", () => {
    const c = defaultConsent();
    expect(c.essential).toBe(true);
    expect(c.analytics).toBe(false);
    expect(c.marketing_email).toBe(false);
    expect(c.match_notifications).toBe(false);
  });

  it("applies choices but forces essential to stay true", () => {
    const c = applyConsentChoices({ essential: false, analytics: true });
    expect(c.essential).toBe(true); // cannot be declined
    expect(c.analytics).toBe(true);
    expect(c.marketing_email).toBe(false);
  });

  it("builds an auditable consent record", () => {
    const at = new Date("2026-06-07T10:00:00.000Z");
    const r = buildConsentRecord("user-1", { marketing_email: true }, at);
    expect(r.userId).toBe("user-1");
    expect(r.state.marketing_email).toBe(true);
    expect(r.state.essential).toBe(true);
    expect(r.recordedAt).toBe("2026-06-07T10:00:00.000Z");
    expect(r.noticeVersion).toBe(CONSENT_NOTICE_VERSION);
  });
});
