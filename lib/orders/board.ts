/**
 * Kanban board grouping for the orders view (student-audit #47).
 *
 * Aarav wants Active / Submitted / Awaiting / Disputed in columns instead of
 * one long list. Pure helper: maps each order status to a board column and
 * buckets a flat order list into those columns. The view layer renders pills.
 */

import type { Order, OrderStatus } from "@/lib/types";

export interface OrderColumn {
  key: string;
  label: string;
  statuses: OrderStatus[];
}

/** Column definitions, left to right, covering every order status. */
export const ORDER_BOARD_COLUMNS: OrderColumn[] = [
  {
    key: "active",
    label: "Active",
    statuses: ["pending_payment", "active", "revision_requested"],
  },
  { key: "submitted", label: "Submitted", statuses: ["submitted", "in_ai_review"] },
  { key: "awaiting", label: "Awaiting", statuses: ["awaiting_approval"] },
  { key: "disputed", label: "Disputed", statuses: ["disputed"] },
  { key: "closed", label: "Closed", statuses: ["completed", "cancelled", "refunded"] },
];

/** Bucket orders into board columns, preserving input order within each. */
export function groupOrdersByColumn(orders: Order[]): Map<string, Order[]> {
  const out = new Map<string, Order[]>();
  for (const col of ORDER_BOARD_COLUMNS) out.set(col.key, []);
  const columnFor = new Map<OrderStatus, string>();
  for (const col of ORDER_BOARD_COLUMNS) {
    for (const s of col.statuses) columnFor.set(s, col.key);
  }
  for (const order of orders) {
    const key = columnFor.get(order.status);
    if (key) out.get(key)!.push(order);
  }
  return out;
}
