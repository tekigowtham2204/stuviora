"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutList, Columns3, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { OrderStatusPill } from "@/components/ui/status-pill";
import { Money } from "@/components/ui/money";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { Order } from "@/lib/types";
import { ORDER_BOARD_COLUMNS, groupOrdersByColumn } from "@/lib/orders/board";

const CLOSED = ["completed", "cancelled", "refunded"];

export function OrdersViews({ orders }: { orders: Order[] }) {
  const [view, setView] = useState<"list" | "board">("list");

  return (
    <>
      <div
        role="tablist"
        aria-label="Order view"
        className="mb-6 inline-flex rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] p-1"
      >
        <ViewTab
          active={view === "list"}
          onClick={() => setView("list")}
          icon={<LayoutList className="h-4 w-4" />}
          label="List"
        />
        <ViewTab
          active={view === "board"}
          onClick={() => setView("board")}
          icon={<Columns3 className="h-4 w-4" />}
          label="Board"
        />
      </div>

      {view === "list" ? <ListView orders={orders} /> : <BoardView orders={orders} />}
    </>
  );
}

function ViewTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-[var(--color-sage)] text-[var(--color-brown-900)]"
          : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function OrderRow({ order, meta }: { order: Order; meta: "deadline" | "created" }) {
  return (
    <Link href={`/student/orders/${order.id}`}>
      <Card className="flex items-center justify-between gap-4 transition-colors hover:border-[var(--color-sage)]">
        <div className="min-w-0">
          <div className="truncate font-medium text-[var(--color-ink)]">
            {order.jobTitle}
          </div>
          <div className="mt-1 text-xs text-[var(--color-ink-muted)]">
            #{order.id} · <Money value={order.amount} /> ·{" "}
            {meta === "deadline" ? `due in ${order.deadlineDays}d` : order.createdAgo}
          </div>
        </div>
        <OrderStatusPill status={order.status} />
      </Card>
    </Link>
  );
}

function ListView({ orders }: { orders: Order[] }) {
  // Active orders default to deadline ascending so the most urgent sits at the
  // top (student-audit #46). Past orders stay newest-first.
  const active = orders
    .filter((o) => !CLOSED.includes(o.status))
    .sort((a, b) => a.deadlineDays - b.deadlineDays);
  const past = orders.filter((o) => CLOSED.includes(o.status));

  return (
    <>
      <Section title="Active">
        {active.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-6 w-6" />}
            title="No active orders"
            body="Browse matched jobs to land your next one."
          />
        ) : (
          <div className="space-y-3">
            {active.map((o) => (
              <OrderRow key={o.id} order={o} meta="deadline" />
            ))}
          </div>
        )}
      </Section>

      <Section title="Past" className="mt-10">
        {past.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)]">
            No completed orders yet.
          </p>
        ) : (
          <div className="space-y-3">
            {past.map((o) => (
              <OrderRow key={o.id} order={o} meta="created" />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

function BoardView({ orders }: { orders: Order[] }) {
  const grouped = groupOrdersByColumn(orders);

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible">
      {ORDER_BOARD_COLUMNS.map((col) => {
        const items = grouped.get(col.key) ?? [];
        return (
          <div key={col.key} className="w-64 shrink-0 lg:w-auto">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">
                {col.label}
              </h2>
              <span className="rounded-full bg-[var(--color-surface-warm)] px-2 text-xs tabular-nums text-[var(--color-ink-muted)]">
                {items.length}
              </span>
            </div>
            <div className="space-y-3">
              {items.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[var(--color-line)] p-4 text-center text-xs text-[var(--color-ink-faint)]">
                  Nothing here
                </p>
              ) : (
                items.map((o) => (
                  <Link key={o.id} href={`/student/orders/${o.id}`}>
                    <Card
                      surface="flat"
                      className="transition-colors hover:border-[var(--color-sage)]"
                    >
                      <div className="truncate text-sm font-medium text-[var(--color-ink)]">
                        {o.jobTitle}
                      </div>
                      <div className="mt-1 text-xs text-[var(--color-ink-muted)]">
                        #{o.id} · <Money value={o.amount} compact />
                      </div>
                      <div className="mt-3">
                        <OrderStatusPill status={o.status} />
                      </div>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Section({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">
        {title}
      </h2>
      {children}
    </div>
  );
}
