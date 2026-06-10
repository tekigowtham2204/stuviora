"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { gradeAssessment } from "@/lib/skills/assessment";
import { passedSkillBadges } from "@/lib/demo/state";
import { getServiceSupabase } from "@/lib/supabase/server";
import { services } from "@/lib/env";
import { trackEvent } from "@/lib/observability";

/**
 * Skill assessment submission (#11). Grades server-side (answers never
 * ship to the client), awards the verified-skill badge on pass, and
 * persists to skill_badges in live mode.
 */
export async function submitSkillTest(formData: FormData) {
  const session = await requireRole("student");
  const category = (formData.get("category") as string) || "";

  const answers: Record<string, number> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("q:")) answers[key.slice(2)] = Number(value);
  }

  const result = gradeAssessment(category, answers);
  if (!result) redirect("/student/skill-test?error=unknown_category");

  if (result!.passed) {
    if (services.supabase) {
      const supabase = getServiceSupabase();
      await supabase?.from("skill_badges").upsert({
        student_id: session.user.id,
        category_slug: category,
        score: result!.correct,
      });
    }
    passedSkillBadges.add(category);
  }

  trackEvent(
    "skill_test_submitted",
    { category, correct: result!.correct, passed: result!.passed },
    session.user.id
  );
  redirect(
    `/student/skill-test?category=${encodeURIComponent(category)}&result=${
      result!.passed ? "pass" : "fail"
    }&score=${result!.correct}`
  );
}
