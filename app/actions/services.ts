"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createService(formData: FormData) {
  void formData.get("title");
  void formData.get("description");
  void formData.get("category");
  revalidatePath("/student/services");
  redirect("/student/services");
}

export async function withdraw(formData: FormData) {
  void formData.get("amount");
  void formData.get("destination");
  revalidatePath("/student/earnings");
}
