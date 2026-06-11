import { describe, it, expect } from "vitest";
import {
  assembleDataExport,
  toExportJson,
  exportFilename,
} from "@/lib/privacy/export";

describe("assembleDataExport", () => {
  it("shapes records into sections with counts", () => {
    const exp = assembleDataExport({
      userId: "stu-1",
      role: "student",
      name: "Diya",
      profile: { id: "stu-1", headline: "Writer" },
      orders: [{ id: "o1" }, { id: "o2" }],
      proposals: [{ id: "p1" }],
    });
    expect(exp.format).toBe("stuviora.data-export.v1");
    expect(exp.subject).toEqual({ userId: "stu-1", role: "student", name: "Diya" });
    expect(exp.counts.orders).toBe(2);
    expect(exp.counts.proposals).toBe(1);
    expect(exp.counts.reviews).toBe(0); // missing arrays default empty
    expect(exp.profile).toEqual({ id: "stu-1", headline: "Writer" });
  });

  it("produces valid, round-trippable JSON", () => {
    const exp = assembleDataExport({ userId: "u", role: "client", name: "Priya" });
    const json = toExportJson(exp);
    const parsed = JSON.parse(json);
    expect(parsed.subject.name).toBe("Priya");
    expect(parsed.counts.orders).toBe(0);
  });

  it("builds a safe, dated filename", () => {
    const name = exportFilename("stu/../1", new Date("2026-06-07T00:00:00Z"));
    expect(name).toBe("stuviora-data-stu1-2026-06-07.json");
  });
});
