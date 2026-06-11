import { Code2, FileText, CheckCircle2, Import } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea, Label, FieldHint } from "@/components/ui/input";
import { importFromGithub, importFromProfileText } from "@/app/actions/import";
import { portfolioDrafts } from "@/lib/demo/state";

export const metadata = { title: "Import your work" };

const ERRORS: Record<string, string> = {
  bad_username: "That does not look like a GitHub username.",
  github_not_found: "GitHub user not found.",
  github_unreachable: "Could not reach GitHub. Try again in a moment.",
  too_short: "Paste a little more of your profile so we have something to work with.",
};

export default async function ImportPage({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string; error?: string }>;
}) {
  const { imported, error } = await searchParams;

  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title="Bring your work with you."
        subtitle="Already built a track record elsewhere? Import it in one step instead of retyping. You approve every item before it is published."
      />

      {imported && (
        <Card role="status" aria-live="polite" surface="flat" tint="sage" className="mb-6 flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-[var(--color-sage-deep)]" />
          <span className="text-[var(--color-sage-900)]">
            Imported {imported} draft item(s). Review them below, then publish
            the ones you want on your profile.
          </span>
        </Card>
      )}
      {error && ERRORS[error] && (
        <Card surface="flat" tint="warm" className="mb-6 text-sm text-[var(--color-orange-900)]">
          {ERRORS[error]}
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-[var(--color-ink)]" />
            <CardTitle>From GitHub</CardTitle>
          </div>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            We pull your five most-starred public repositories as portfolio
            drafts. Best for developers and data students.
          </p>
          <form action={importFromGithub} className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="github">GitHub username</Label>
              <Input id="github" name="github" placeholder="aaravmehta" />
            </div>
            <Button type="submit" variant="sage" size="sm">
              <Import className="h-4 w-4" /> Import repos
            </Button>
          </form>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[var(--color-ink)]" />
            <CardTitle>From any profile</CardTitle>
          </div>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            Paste the work-history section of your Upwork, Fiverr, Behance, or
            LinkedIn profile. We turn each project line into a draft you can
            edit.
          </p>
          <form action={importFromProfileText} className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="profileText">Paste your profile text</Label>
              <Textarea
                id="profileText"
                name="profileText"
                rows={5}
                placeholder={"Logo redesign for a cafe: refreshed brand, 30% more footfall.\nBlog series for a SaaS startup: 8 posts, doubled organic traffic."}
              />
              <FieldHint>One project per line works best.</FieldHint>
            </div>
            <Button type="submit" variant="sage" size="sm">
              <Import className="h-4 w-4" /> Extract drafts
            </Button>
          </form>
        </Card>
      </div>

      <Card className="mt-6">
        <CardTitle>Imported drafts</CardTitle>
        {portfolioDrafts.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
            Nothing imported yet. Drafts appear here for your review; nothing
            goes on your public profile without your approval.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-[var(--color-line)]">
            {portfolioDrafts.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium text-[var(--color-ink)]">{d.title}</div>
                  <div className="truncate text-xs text-[var(--color-ink-muted)]">{d.outcome}</div>
                </div>
                <Badge tone={d.source === "github" ? "info" : "neutral"}>
                  {d.source === "github" ? "GitHub" : "Profile"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
