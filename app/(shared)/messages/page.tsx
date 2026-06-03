import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listConversations } from "@/lib/data/queries";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const conversations = await listConversations();
  return (
    <>
      <PageHeader title="Messages" subtitle="Threads connected to your active orders." />

      <div className="space-y-2">
        {conversations.length === 0 && (
          <Card className="text-sm text-muted">
            <MessagesSquare className="mb-2 h-5 w-5 text-subtle" />
            No conversations yet. They open when you hire or get hired.
          </Card>
        )}
        {conversations.map((c) => (
          <Link key={c.id} href={`/messages/${c.id}`}>
            <Card className="flex items-center gap-3 transition-colors hover:border-brand-300">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
                {c.withInitials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate font-medium">{c.withName}</div>
                  <div className="text-xs text-subtle">{c.lastAgo}</div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="line-clamp-1 text-sm text-muted">{c.lastMessage}</p>
                  {c.unread > 0 && <Badge tone="brand">{c.unread} new</Badge>}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
