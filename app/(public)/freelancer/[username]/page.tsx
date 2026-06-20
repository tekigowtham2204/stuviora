import { notFound } from "next/navigation";
import { ReportUser } from "@/components/feature/report-user";
import {
  Star,
  BadgeCheck,
  MapPin,
  GraduationCap,
  ShieldCheck,
  Award,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { TrustTierBadge } from "@/components/ui/trust-tier-badge";
import { Money } from "@/components/ui/money";
import { Section } from "@/components/ui/section";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getStudentByUsername,
  listPortfolio,
  listReviewsForStudent,
} from "@/lib/data/queries";
import { publicUserId } from "@/lib/identity/public-id";

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
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ report?: string }>;
}) {
  const { username } = await params;
  const { report } = await searchParams;
  const s = await getStudentByUsername(username);
  if (!s) notFound();

  const portfolio = await listPortfolio(s.id);
  const reviews = await listReviewsForStudent(s.id);

  return (
    <Section spacing="tight">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: s.fullName,
          url: `https://stuviora.com/freelancer/${s.username}`,
          description: s.headline,
          jobTitle: s.stream,
          knowsAbout: s.skills,
          affiliation: {
            "@type": "CollegeOrUniversity",
            name: s.college,
          },
        }}
      />
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Main column */}
          <div>
            <Reveal>
              <div className="flex flex-wrap items-start gap-5">
                <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] bg-[var(--color-sage)] text-3xl font-semibold text-[var(--color-brown-900)]">
                  {s.avatarInitials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--color-ink)] sm:text-4xl">
                      {s.fullName}
                    </h1>
                    {s.verified && (
                      <Badge tone="sage">
                        <BadgeCheck className="h-3.5 w-3.5" /> Verified
                      </Badge>
                    )}
                    <TrustTierBadge tier={s.trustTier} />
                  </div>
                  <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[var(--color-ink)]">
                    {s.headline}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-[var(--color-ink-muted)]">
                    <span className="inline-flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4" /> {s.stream} · {s.college}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" /> {s.city}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-[var(--color-yellow)] text-[var(--color-yellow-deep)]" />
                      {s.rating} ({s.reviewsCount} reviews)
                    </span>
                    <span className="font-mono text-xs text-[var(--color-ink-faint)]">
                      {publicUserId("student", s.id)}
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal index={1} className="mt-12">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">
                About
              </h2>
              <p className="mt-3 max-w-3xl text-base leading-relaxed text-[var(--color-ink)]">
                {s.bio}
              </p>
            </Reveal>

            <Reveal index={2} className="mt-10">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">
                Skills
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {s.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-1.5 text-sm text-[var(--color-ink)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal index={3} className="mt-10">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">
                Selected work
              </h2>
              <div className="mt-4 space-y-4">
                {portfolio.length === 0 && (
                  <p className="text-sm text-[var(--color-ink-muted)]">
                    No published case studies yet.
                  </p>
                )}
                {portfolio.map((item) => (
                  <Card key={item.id}>
                    <CardTitle>{item.title}</CardTitle>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <CaseColumn title="Problem" body={item.problem} />
                      <CaseColumn title="Approach" body={item.approach} />
                      <CaseColumn title="Outcome" body={item.outcome} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {item.skills.map((sk) => (
                        <span
                          key={sk}
                          className="rounded-full bg-[var(--color-surface-warm)] px-2.5 py-1 text-xs text-[var(--color-ink)]"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </Reveal>

            <Reveal index={4} className="mt-10">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">
                Client reviews
              </h2>
              <div className="mt-4 space-y-3">
                {reviews.length === 0 && (
                  <p className="text-sm text-[var(--color-ink-muted)]">
                    No reviews yet. Every completed job earns one.
                  </p>
                )}
                {reviews.map((r) => (
                  <Card key={r.id}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-[var(--color-ink)]">
                        {r.reviewerName}
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={
                              i < r.rating
                                ? "h-4 w-4 fill-[var(--color-yellow)] text-[var(--color-yellow-deep)]"
                                : "h-4 w-4 text-[var(--color-line-strong)]"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                      {r.comment}
                    </p>
                    <p className="mt-2 text-xs text-[var(--color-ink-faint)]">{r.ago}</p>
                  </Card>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Sticky right rail */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
            <Card surface="glow" className="p-7">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-medium tabular-nums text-[var(--color-ink)]">
                  <Money value={s.hourlyFrom} />
                </span>
                <span className="text-sm text-[var(--color-ink-muted)]">/hour</span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 border-y border-[var(--color-line)] py-4 text-center">
                <StatMini value={s.jobsCompleted} label="jobs" />
                <StatMini value={s.rating} label="rating" />
                <StatMini value={s.trustScore} label="trust" />
              </div>
              <Button href="/auth/signup/client" variant="primary" className="mt-5 w-full">
                Hire {s.fullName.split(" ")[0]}
              </Button>
              <Button
                href="/messages"
                variant="outline"
                size="sm"
                className="mt-2 w-full"
              >
                <MessageCircle className="h-4 w-4" /> Message first
              </Button>

              <div className="mt-6 space-y-2.5 border-t border-[var(--color-line)] pt-5 text-sm">
                <Row icon={ShieldCheck} label="Escrow-protected payment" />
                <Row icon={Award} label="AI-reviewed delivery" />
                <Row icon={BadgeCheck} label="College-verified identity" />
              </div>
            </Card>
            <ReportUser
              targetName={s.fullName}
              context="profile"
              returnTo={`/freelancer/${s.username}`}
              flash={report}
            />
          </aside>
        </div>
      </Container>
    </Section>
  );
}

function CaseColumn({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
        {title}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink)]">{body}</p>
    </div>
  );
}

function StatMini({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="font-display text-xl font-medium tabular-nums text-[var(--color-ink)]">
        {value}
      </div>
      <div className="text-xs text-[var(--color-ink-muted)]">{label}</div>
    </div>
  );
}

function Row({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[var(--color-ink-muted)]">
      <Icon className="h-4 w-4 text-[var(--color-sage-deep)]" />
      <span>{label}</span>
    </div>
  );
}
