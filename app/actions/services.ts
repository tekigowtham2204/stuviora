"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { autoWithdraw } from "@/lib/demo/state";

export async function createService(formData: FormData) {
  void formData.get("title");
  void formData.get("description");
  void formData.get("category");
  revalidatePath("/student/services");
  redirect("/student/services");
}

export async function withdraw(formData: FormData) {
  const amount = Number(formData.get("amount") || 0);
  void formData.get("destination");
  revalidatePath("/student/earnings");
  // #35: surface the milestone; the page celebrates a first withdrawal.
  redirect(`/student/earnings?withdrawn=${Math.max(0, Math.round(amount))}`);
}

/** #34 auto-withdraw: sweep the balance once it crosses a threshold. */
export async function setAutoWithdraw(formData: FormData) {
  const enabled = formData.get("enabled") === "on";
  const threshold = Number(formData.get("threshold") || 0);
  autoWithdraw.threshold = enabled && threshold > 0 ? threshold : null;
  revalidatePath("/student/earnings");
  redirect(`/student/earnings?auto=${autoWithdraw.threshold ?? "off"}`);
}
