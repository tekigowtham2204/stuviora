import { Award, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  questionsFor,
  PASS_THRESHOLD,
  QUESTIONS_PER_TEST,
} from "@/lib/skills/assessment";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { submitSkillTest } from "@/app/actions/skills";
import { passedSkillBadges } from "@/lib/demo/state";

export const metadata = { title: "Skill assessment" };

export default async function SkillTestPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; result?: string; score?: string }>;
}) {
  const { category, result, score } = await searchParams;
  const questions = category ? questionsFor(category) : null;
  const categoryName =
    SERVICE_CATEGORIES.find((c) => c.slug === category)?.name ?? category;

  // Result view after grading.
  if (result && category) {
    const passed = result === "pass";
    return (
      <>
        <PageHeader eyebrow="Skill assessment" title={passed ? "You passed." : "Not yet."} />
        <Card className="max-w-xl text-center" surface="glow">
          {passed ? (
            <CheckCircle2 className="mx-auto h-10 w-10 text-[var(--color-sage-deep)]" />
          ) : (
            <XCircle className="mx-auto h-10 w-10 text-[var(--color-orange-900)]" />
          )}
          <div className="mt-4 font-display text-2xl text-[var(--color-ink)]">
            {score} of {QUESTIONS_PER_TEST} correct
          </div>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            {passed
              ? `Your verified ${categoryName} badge now shows on your profile. Clients trust tested skills.`
              : `You need ${PASS_THRESHOLD} of ${QUESTIONS_PER_TEST} to earn the badge. Review the basics and retake any time.`}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {!passed && (
              <Button href={`/student/skill-test?category=${category}`} variant="sage">
                Retake the test
              </Button>
            )}
            <Button href="/student/dashboard" variant={passed ? "sage" : "secondary"}>
              Back to dashboard
            </Button>
          </div>
        </Card>
      </>
    );
  }

  // Test view for a chosen category.
  if (category && questions) {
    return (
      <>
        <PageHeader
          eyebrow="Skill assessment"
          title={`${categoryName} test.`}
          subtitle={`${QUESTIONS_PER_TEST} questions. ${PASS_THRESHOLD} correct earns your verified badge. Answers are graded instantly.`}
        />
        <Card className="max-w-2xl">
          <form action={submitSkillTest} className="space-y-7">
            <input type="hidden" name="category" value={category} />
            {questions.map((q, qi) => (
              <fieldset key={q.id}>
                <legend className="text-sm font-medium text-[var(--color-ink)]">
                  {qi + 1}. {q.prompt}
                </legend>
                <div className="mt-3 space-y-2">
                  {q.options.map((opt, oi) => (
                    <label
                      key={oi}
                      className="flex cursor-pointer items-start gap-2 rounded-xl border border-[var(--color-line)] p-3 text-sm text-[var(--color-ink-muted)] transition-colors has-[:checked]:border-[var(--color-sage-deep)] has-[:checked]:bg-[var(--color-sage-50)]"
                    >
                      <input
                        type="radio"
                        name={`q:${q.id}`}
                        value={oi}
                        required
                        className="mt-0.5 accent-[var(--color-sage-deep)]"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            <Button type="submit" variant="sage" className="w-full">
              Submit answers
            </Button>
          </form>
        </Card>
      </>
    );
  }

  // Category picker.
  return (
    <>
      <PageHeader
        eyebrow="Skill assessment"
        title="Earn a verified skill badge."
        subtitle="A short test per category. Pass it and clients see a verified badge on your profile."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICE_CATEGORIES.map((c) => {
          const earned = passedSkillBadges.has(c.slug);
          return (
            <Card key={c.slug}>
              <div className="flex items-center justify-between">
                <CardTitle>{c.name}</CardTitle>
                {earned && (
                  <Badge tone="sage">
                    <Award className="h-3 w-3" /> Verified
                  </Badge>
                )}
              </div>
              <p className="mt-2 text-xs text-[var(--color-ink-muted)]">{c.streams}</p>
              <Button
                href={`/student/skill-test?category=${c.slug}`}
                variant={earned ? "secondary" : "sage"}
                size="sm"
                className="mt-4"
              >
                {earned ? "Retake" : "Start the test"}
              </Button>
            </Card>
          );
        })}
      </div>
    </>
  );
}
