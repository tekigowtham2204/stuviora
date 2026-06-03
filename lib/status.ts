import type { DisputeResolution, DisputeStatus, OrderStatus } from "@/lib/types";

type Tone = "brand" | "trust" | "info" | "warning" | "danger" | "success" | "neutral";

/** Display metadata for each order status. */
export const ORDER_STATUS_META: Record<OrderStatus, { label: string; tone: Tone }> = {
  pending_payment: { label: "Awaiting payment", tone: "warning" },
  active: { label: "In progress", tone: "info" },
  submitted: { label: "Submitted", tone: "info" },
  in_ai_review: { label: "AI reviewing", tone: "brand" },
  awaiting_approval: { label: "Awaiting approval", tone: "warning" },
  revision_requested: { label: "Revision requested", tone: "warning" },
  completed: { label: "Completed", tone: "success" },
  disputed: { label: "Disputed", tone: "danger" },
  refunded: { label: "Refunded", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

/** Display metadata for each dispute status. */
export const DISPUTE_STATUS_META: Record<DisputeStatus, { label: string; tone: Tone }> = {
  open: { label: "Opened", tone: "danger" },
  evidence_collection: { label: "Collecting evidence", tone: "warning" },
  admin_review: { label: "Under admin review", tone: "info" },
  resolved: { label: "Resolved", tone: "success" },
};

/** Display metadata for each dispute resolution. */
export const DISPUTE_RESOLUTION_META: Record<DisputeResolution, { label: string; tone: Tone }> = {
  pending: { label: "Pending", tone: "neutral" },
  client_favour: { label: "Resolved for client", tone: "info" },
  student_favour: { label: "Resolved for student", tone: "trust" },
  partial: { label: "Partial settlement", tone: "warning" },
};
