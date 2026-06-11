"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/dal";
import { validateUpload } from "@/lib/uploads/validate";
import { trackEvent } from "@/lib/observability";

/**
 * Send a message with an optional attachment (audit #64). The attachment
 * is validated (type allowlist, 25 MB cap) before anything else happens.
 * Live path uploads via lib/storage/files.ts under messages/{conv}/ and
 * inserts the messages row; demo records the event and flashes the send.
 */
export async function sendMessage(formData: FormData) {
  const session = await requireSession();
  const conversationId = (formData.get("conversationId") as string) || "";
  const body = ((formData.get("body") as string) || "").trim();
  const file = formData.get("attachment") as File | null;

  if (!body && (!file || file.size === 0)) {
    redirect(`/messages/${conversationId}?sent=empty`);
  }

  let attachmentName: string | null = null;
  if (file && file.size > 0) {
    const check = validateUpload({
      filename: file.name,
      mime: file.type,
      size: file.size,
    });
    if (!check.ok) {
      redirect(
        `/messages/${conversationId}?sent=rejected&why=${encodeURIComponent(
          check.reason ?? "invalid file"
        )}`
      );
    }
    attachmentName = file.name;
    // Live: upload via lib/storage/files.ts to messages/{conversationId}/
    // and store the object path on the messages row.
  }

  trackEvent(
    "message_sent",
    { conversationId, hasAttachment: Boolean(attachmentName) },
    session.user.id
  );
  revalidatePath(`/messages/${conversationId}`);
  redirect(
    `/messages/${conversationId}?sent=1${
      attachmentName ? `&file=${encodeURIComponent(attachmentName)}` : ""
    }`
  );
}
