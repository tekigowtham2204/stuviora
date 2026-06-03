"use server";

import { redirect } from "next/navigation";

export async function completeStudentOnboarding(formData: FormData) {
  void formData;
  redirect("/student/dashboard");
}

export async function completeClientOnboarding(formData: FormData) {
  void formData;
  redirect("/client/dashboard");
}
