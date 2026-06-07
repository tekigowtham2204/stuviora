import { describe, it, expect } from "vitest";
import { computeTeamSplit, type TeamMember } from "@/lib/teams/split";

describe("computeTeamSplit", () => {
  it("splits the student share by ratio and keeps the commission", () => {
    const members: TeamMember[] = [
      { studentId: "s1", shareRatio: 0.5 },
      { studentId: "s2", shareRatio: 0.5 },
    ];
    const r = computeTeamSplit(10_000, members);
    expect(r.commission).toBe(1_500);
    expect(r.studentTotal).toBe(8_500);
    const sum = r.perMember.reduce((s, m) => s + m.amount, 0);
    expect(sum).toBe(8_500);
  });

  it("absorbs rounding drift on the largest share", () => {
    const members: TeamMember[] = [
      { studentId: "s1", shareRatio: 0.33 },
      { studentId: "s2", shareRatio: 0.33 },
      { studentId: "s3", shareRatio: 0.34 },
    ];
    const r = computeTeamSplit(10_000, members);
    const sum = r.perMember.reduce((s, m) => s + m.amount, 0);
    expect(sum).toBe(r.studentTotal);
    // s3 should carry the drift since it has the largest absolute amount
    const s3 = r.perMember.find((m) => m.studentId === "s3")!;
    const s1 = r.perMember.find((m) => m.studentId === "s1")!;
    expect(s3.amount).toBeGreaterThanOrEqual(s1.amount);
  });

  it("respects a custom commission rate", () => {
    const r = computeTeamSplit(
      10_000,
      [{ studentId: "s1", shareRatio: 1 }],
      0.1
    );
    expect(r.commission).toBe(1_000);
    expect(r.studentTotal).toBe(9_000);
    expect(r.perMember[0].amount).toBe(9_000);
  });

  it("throws when members is empty", () => {
    expect(() => computeTeamSplit(10_000, [])).toThrow(
      /at least one member/
    );
  });

  it("throws when ratios do not sum to 1", () => {
    expect(() =>
      computeTeamSplit(10_000, [
        { studentId: "s1", shareRatio: 0.3 },
        { studentId: "s2", shareRatio: 0.3 },
      ])
    ).toThrow(/sum to 1/);
  });

  it("handles a single member", () => {
    const r = computeTeamSplit(5_000, [
      { studentId: "s1", shareRatio: 1 },
    ]);
    expect(r.perMember).toHaveLength(1);
    expect(r.perMember[0].amount).toBe(r.studentTotal);
  });
});
