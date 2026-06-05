"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentStudent } from "@/lib/auth/session";
import { getOrder, listReviewsForStudent } from "@/lib/data/queries";
import { buildCaseStudyDraft } from "@/lib/portfolio/case-study";

/**
 * Generate a portfolio case-study draft from a completed order.
 *
 * Demo: builds the draft in-process and routes to a (stubbed) editor.
 * Live: persists into `portfolio_items` with `is_published=false` so the
 * student can edit before publishing.
 */
export async function generateCaseStudy(formData: FormData) {
  const orderId = String(formData.get("orderId"));
  const order = await getOrder(orderId);
  if (!order) redirect("/student/orders");
  if (order.status !== "completed") {
    redirect(`/student/orders/${orderId}?error=not-completed`);
  }
  const reviews = await listReviewsForStudent();
  const review = reviews.find((r) => r.orderId === orderId);
  const me = currentStudent();

  // Construct the draft. Live: write to portfolio_items and use its ID.
  await buildCaseStudyDraft({
    order,
    skills: me.skills.slice(0, 4),
    review,
  });

  revalidatePath(`/student/orders/${orderId}`);
  redirect(`/student/orders/${orderId}?cs=drafted`);
}
