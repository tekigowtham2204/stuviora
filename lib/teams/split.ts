/**
 * Team / group projects (M7.2).
 *
 * A team order pays multiple students from a single client payment. The
 * 85% student share is split per-member by their declared share ratio,
 * and the 15% commission still goes to the platform via Razorpay Route.
 *
 * Pure math only - the Route transfer construction lives in lib/razorpay.
 */

export interface TeamMember {
  studentId: string;
  /** Share of the student-side payout (0..1). All members' shares must sum to 1. */
  shareRatio: number;
}

export interface TeamSplit {
  studentTotal: number;
  commission: number;
  perMember: Array<{ studentId: string; amount: number }>;
}

export function computeTeamSplit(
  orderAmount: number,
  members: TeamMember[],
  commissionRate = 0.15
): TeamSplit {
  if (members.length === 0) throw new Error("Team order needs at least one member");
  const sum = members.reduce((s, m) => s + m.shareRatio, 0);
  if (Math.abs(sum - 1) > 1e-6) throw new Error("Team shareRatio values must sum to 1");
  const commission = Math.round(orderAmount * commissionRate);
  const studentTotal = orderAmount - commission;
  // Distribute, then absorb rounding drift on the largest share.
  const perMember = members.map((m) => ({
    studentId: m.studentId,
    amount: Math.floor(studentTotal * m.shareRatio),
  }));
  const distributed = perMember.reduce((s, m) => s + m.amount, 0);
  const drift = studentTotal - distributed;
  if (drift !== 0) {
    const idx = perMember.reduce(
      (maxI, m, i) => (m.amount > perMember[maxI].amount ? i : maxI),
      0
    );
    perMember[idx].amount += drift;
  }
  return { studentTotal, commission, perMember };
}
