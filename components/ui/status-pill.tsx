import { Badge } from "@/components/ui/badge";
import type { OrderStatus, DisputeStatus, ProposalStatus } from "@/lib/types";
import { ORDER_STATUS_META, DISPUTE_STATUS_META } from "@/lib/status";

export function OrderStatusPill({ status }: { status: OrderStatus }) {
  const meta = ORDER_STATUS_META[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export function DisputeStatusPill({ status }: { status: DisputeStatus }) {
  const meta = DISPUTE_STATUS_META[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

const PROPOSAL_META: Record<ProposalStatus, { label: string; tone: "neutral" | "sage" | "orange" | "danger" }> = {
  submitted: { label: "Submitted", tone: "neutral" },
  shortlisted: { label: "Shortlisted", tone: "sage" },
  accepted: { label: "Accepted", tone: "sage" },
  rejected: { label: "Rejected", tone: "danger" },
  withdrawn: { label: "Withdrawn", tone: "neutral" },
};

export function ProposalStatusPill({ status }: { status: ProposalStatus }) {
  const meta = PROPOSAL_META[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
