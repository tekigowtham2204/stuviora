import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, BadgeCheck, MapPin, GraduationCap, ShieldCheck, Award } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import {
  getStudentByUsername,
  listPortfolio,
  listReviewsForStudent,
} from "@/lib/data/queries";
import { formatINR } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const s = await getStudentByUsername(username);
  if (!s) return { title: "Student profile" };
  return {
    title: `${s.fullName}, ${s.stream}`,
    description: s.headline,
  };
}

export default async function FreelancerProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const s = await getStudentByUsername(username);
  if (!s) notFound();

  const portfolio = await listPortfolio(s.id);
  const reviews = await listReviewsForStudent();

  return (
    <Container className="py-12">
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div>
          <Reveal>
            <div className="flex flex-wrap items-start gap-5">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-2xl font-semibold text-brand-700">
                {s.avatarInitials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight">{s.fullName}</h1>
                  {s.verified && (
                    <Badge tone="trust">
                      <BadgeCheck className="h-3.5 w-3.5" /> Verified
                    </Badge>
                  )}
                  <Badge tone="brand" className="capitalize">
                    {s.trustTier}
                  </Badge>
                </div>
                <p className="mt-2 max-w-2xl text-lg text-foreground">{s.headline}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4" /> {s.stream} · {s.college}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {s.city}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    {s.rating} ({s.reviewsCount} reviews)
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* About */}
          <Reveal index={1} className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">About</h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-foreground">{s.bio}</p>
          </Reveal>

          {/* Skills */}
          <Reveal index={2} className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {s.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md border border-border bg-surface px-3 py-1 text-sm text-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Reveal>

          {/* Portfolio */}
          <Reveal index={3} className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Selected work</h2>
            <div className="mt-4 space-y-4">
              {portfolio.length === 0 && (
                <p className="text-sm text-muted">No published case studies yet.</p>
              )}
              {portfolio.map((item) => (
                <Card key={item.id}>
                  <CardTitle>{item.title}</CardTitle>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted">Problem</div>
                      <p className="mt-1 text-sm leading-relaxed">{item.problem}</p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted">Approach</div>
                      <p className="mt-1 text-sm leading-relaxed">{item.approach}</p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted">Outcome</div>
                      <p className="mt-1 text-sm leading-relaxed">{item.outcome}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.skills.map((sk) => (
                      <span key={sk} className="rounded-md bg-surface-muted px-2 py-0.5 text-xs text-muted">
                        {sk}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </Reveal>

          {/* Reviews */}
          <Reveal index={4} className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Client reviews</h2>
            <div className="mt-4 space-y-3">
              {reviews.length === 0 && (
                <p className="text-sm text-muted">No reviews yet. Every completed job earns one.</p>
              )}
              {reviews.map((r) => (
                <Card key={r.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{r.reviewerName}</div>
                    <div className="flex items-center gap-1 text-sm">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={
                            i < r.rating
                              ? "h-4 w-4 fill-warning text-warning"
                              : "h-4 w-4 text-border-strong"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{r.comment}</p>
                  <p className="mt-2 text-xs text-subtle">{r.ago}</p>
                </Card>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Sticky right rail */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <Card>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-foreground">
                {formatINR(s.hourlyFrom)}
              </span>
              <span className="text-sm text-muted">/hour</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 border-y border-border py-3 text-center">
              <div>
                <div className="text-base font-semibold">{s.jobsCompleted}</div>
                <div className="text-xs text-muted">jobs</div>
              </div>
              <div>
                <div className="text-base font-semibold">{s.rating}</div>
                <div className="text-xs text-muted">rating</div>
              </div>
              <div>
                <div className="text-base font-semibold">{s.trustScore}</div>
                <div className="text-xs text-muted">trust</div>
              </div>
            </div>
            <Button href="/auth/signup/client" variant="trust" className="mt-4 w-full">
              Hire {s.fullName.split(" ")[0]}
            </Button>
            <Link
              href="/messages"
              className="mt-2 block text-center text-sm font-medium text-brand-600 hover:underline"
            >
              Message first
            </Link>

            <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <Row icon={ShieldCheck} label="Escrow-protected payment" />
              <Row icon={Award} label="AI-reviewed delivery" />
              <Row icon={BadgeCheck} label="College-verified identity" />
            </div>
          </Card>
        </aside>
      </div>
    </Container>
  );
}

function Row({ icon: Icon, label }: { icon: typeof Star; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted">
      <Icon className="h-4 w-4 text-trust-600" />
      <span>{label}</span>
    </div>
  );
}
