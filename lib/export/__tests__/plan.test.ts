import { describe, it, expect } from "vitest";
import {
  buildExportPlan,
  planExposesRawPublicly,
  type ExportDestination,
} from "@/lib/export/plan";

const ALL: ExportDestination[] = ["github", "drive", "notion", "portfolio"];

describe("buildExportPlan", () => {
  it("exports nothing until the order is complete", () => {
    expect(
      buildExportPlan({ orderCompleted: false, connected: ALL, clientShareable: true })
    ).toEqual([]);
  });

  it("exports nothing when no destinations are connected", () => {
    expect(
      buildExportPlan({ orderCompleted: true, connected: [], clientShareable: true })
    ).toEqual([]);
  });

  it("sends raw work to private destinations (github/drive/notion)", () => {
    const plan = buildExportPlan({
      orderCompleted: true,
      connected: ["github", "drive", "notion"],
      clientShareable: false,
    });
    expect(plan).toEqual([
      { destination: "github", artifact: "raw", visibility: "private" },
      { destination: "drive", artifact: "raw", visibility: "private" },
      { destination: "notion", artifact: "raw", visibility: "private" },
    ]);
  });

  it("GUARDRAIL: public portfolio gets the case-study when NOT licensed", () => {
    const plan = buildExportPlan({
      orderCompleted: true,
      connected: ["portfolio"],
      clientShareable: false,
    });
    expect(plan).toEqual([
      { destination: "portfolio", artifact: "case-study", visibility: "public" },
    ]);
    expect(planExposesRawPublicly(plan)).toBe(false);
  });

  it("public portfolio gets raw work ONLY when the client licenses it", () => {
    const plan = buildExportPlan({
      orderCompleted: true,
      connected: ["portfolio"],
      clientShareable: true,
    });
    expect(plan).toEqual([
      { destination: "portfolio", artifact: "raw", visibility: "public" },
    ]);
    expect(planExposesRawPublicly(plan)).toBe(true);
  });

  it("never exposes raw client files publicly without a license, across all destinations", () => {
    const plan = buildExportPlan({
      orderCompleted: true,
      connected: ALL,
      clientShareable: false,
    });
    expect(planExposesRawPublicly(plan)).toBe(false);
  });

  it("dedupes repeated destinations", () => {
    const plan = buildExportPlan({
      orderCompleted: true,
      connected: ["github", "github", "drive"],
      clientShareable: false,
    });
    expect(plan.map((a) => a.destination)).toEqual(["github", "drive"]);
  });
});
