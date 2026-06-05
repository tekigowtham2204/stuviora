import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { listConversations } from "@/lib/data/queries";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const conversations = await listConversations();
  return (
    <>
      <PageHeader
        eyebrow="Inbox"
        title="Messages."
        subtitle="Threads connected to your active orders. Contact details unlock once an order is active."
      />

      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessagesSquare className="h-6 w-6" />}
          title="No conversations yet"
          body="They open when you hire or get hired."
        />
      ) : (
        <div className="space-y-3">
          {conversations.map((c) => (
            <Link key={c.id} href={`/messages/${c.id}`}>
              <Card className="flex items-center gap-4 transition-colors hover:border-[var(--color-sage)]">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-sage)] font-semibold text-[var(--color-brown-900)]">
                  {c.withInitials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate font-medium text-[var(--color-ink)]">
                      {c.withName}
                    </div>
                    <div className="text-xs text-[var(--color-ink-faint)]">{c.lastAgo}</div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="line-clamp-1 text-sm text-[var(--color-ink-muted)]">
                      {c.lastMessage}
                    </p>
                    {c.unread > 0 && <Badge tone="orange">{c.unread} new</Badge>}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
