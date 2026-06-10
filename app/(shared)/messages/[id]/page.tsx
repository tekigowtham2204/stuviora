import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, ShieldCheck, Paperclip, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getConversation } from "@/lib/data/queries";
import { sendMessage } from "@/app/actions/messages";
import { ReportUser } from "@/components/feature/report-user";
import { cn } from "@/lib/utils";

export const metadata = { title: "Message thread" };

export default async function MessageThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sent?: string; file?: string; why?: string; report?: string }>;
}) {
  const { id } = await params;
  const { sent, file, why, report } = await searchParams;
  const data = await getConversation(id);
  if (!data) notFound();
  const { convo, msgs } = data;

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[1fr_300px]">
      <div className="flex h-[calc(100dvh-12rem)] flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Link
            href="/messages"
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-muted hover:text-foreground lg:hidden"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
            {convo.withInitials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">{convo.withName}</div>
            <div className="text-xs text-muted">Order #{convo.orderId}</div>
          </div>
          <Badge tone="trust">
            <ShieldCheck className="h-3.5 w-3.5" /> Order-linked
          </Badge>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto py-5">
          {msgs.map((m) => (
            <div
              key={m.id}
              className={cn("flex", m.fromSelf ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  m.fromSelf
                    ? "rounded-br-sm bg-brand-600 text-white"
                    : "rounded-bl-sm bg-surface text-foreground border border-border"
                )}
              >
                <p>{m.body}</p>
                <p
                  className={cn(
                    "mt-1 text-[10px]",
                    m.fromSelf ? "text-white/70" : "text-subtle"
                  )}
                >
                  {m.ago}
                </p>
              </div>
            </div>
          ))}
          {msgs.length === 0 && (
            <p className="py-12 text-center text-sm text-muted">
              No messages yet. Say hi to kick things off.
            </p>
          )}
        </div>

        {/* Send flashes */}
        {sent === "1" && (
          <p role="status" aria-live="polite" className="flex items-center gap-1.5 pb-2 text-xs text-[var(--color-sage-900)]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Sent{file ? ` with attachment ${file}` : ""}. (Demo: delivery activates with live keys.)
          </p>
        )}
        {sent === "rejected" && (
          <p role="status" aria-live="polite" className="pb-2 text-xs text-[var(--color-danger-deep)]">
            Attachment rejected: {why}
          </p>
        )}
        {sent === "empty" && (
          <p className="pb-2 text-xs text-[var(--color-ink-muted)]">
            Write a message or attach a file first.
          </p>
        )}

        {/* Composer */}
        <form action={sendMessage} className="flex items-center gap-2 border-t border-border pt-4">
          <input type="hidden" name="conversationId" value={convo.id} />
          <label className="cursor-pointer rounded-full border border-border-strong p-2.5 text-muted transition-colors hover:bg-surface-muted" aria-label="Attach a file">
            <Paperclip className="h-4 w-4" />
            <input type="file" name="attachment" className="sr-only" />
          </label>
          <input
            name="body"
            placeholder="Write a message..."
            className="flex-1 rounded-full border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400"
          />
          <Button type="submit" size="md" variant="primary">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <aside className="hidden space-y-4 lg:block">
        <ReportUser
          targetName={convo.withName}
          context="message"
          returnTo={`/messages/${convo.id}`}
          flash={report}
        />
        <Card>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted">
            Linked order
          </div>
          <Link
            href={`/student/orders/${convo.orderId}`}
            className="mt-2 block text-sm font-medium text-brand-600 hover:underline"
          >
            #{convo.orderId}
          </Link>
          <p className="mt-3 text-xs text-subtle">
            Contact info beyond this thread is hidden until the order is active. This is to protect both sides.
          </p>
        </Card>
      </aside>
    </div>
  );
}
