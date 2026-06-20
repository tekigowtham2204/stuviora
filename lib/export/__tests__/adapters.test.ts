import { describe, it, expect } from "vitest";
import { adapterFor } from "@/lib/export/adapters";
import type { ExportAction, ExportDestination } from "@/lib/export/plan";

const ctx = { orderId: "SV-1", studentId: "stu-1" };
const action = (destination: ExportDestination): ExportAction => ({
  destination,
  artifact: "raw",
  visibility: destination === "portfolio" ? "public" : "private",
});

describe("export adapters", () => {
  it("returns an adapter whose destination matches the key", () => {
    for (const d of ["github", "drive", "notion", "portfolio"] as ExportDestination[]) {
      expect(adapterFor(d).destination).toBe(d);
    }
  });

  it("external destinations skip until OAuth is configured", async () => {
    for (const d of ["github", "drive", "notion"] as ExportDestination[]) {
      const adapter = adapterFor(d);
      expect(adapter.isConfigured()).toBe(false);
      const res = await adapter.run(action(d), ctx);
      expect(res.status).toBe("skipped");
    }
  });

  it("on-platform portfolio is configured and exports", async () => {
    const adapter = adapterFor("portfolio");
    expect(adapter.isConfigured()).toBe(true);
    const res = await adapter.run(action("portfolio"), ctx);
    expect(res.status).toBe("exported");
    expect(res.destination).toBe("portfolio");
  });
});
