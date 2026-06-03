import Link from "next/link";
import { PlusCircle, Users, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listClientJobs } from "@/lib/data/queries";
import { currentClient } from "@/lib/auth/session";
import { formatINR } from "@/lib/utils";

export const metadata = { title: "My jobs" };

export default async function ClientJobsPage() {
  const me = currentClient();
  const jobs = await listClientJobs(me.id);

  return (
    <>
      <PageHeader
        title="My jobs"
        subtitle="Jobs you've posted and their proposal counts."
        action={
          <Button href="/client/post-job" variant="trust">
            <PlusCircle className="h-4 w-4" /> Post a job
          </Button>
        }
      />

      <div className="space-y-3">
        {jobs.length === 0 && (
          <Card className="text-sm text-muted">
            You haven&apos;t posted any jobs yet. Post one to start receiving proposals.
          </Card>
        )}
        {jobs.map((j) => (
          <Link key={j.id} href={`/client/jobs/${j.id}/proposals`}>
            <Card className="transition-colors hover:border-trust-300">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold">{j.title}</h3>
                    <Badge tone="info">{j.proposalsCount} proposals</Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{j.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                    <span>
                      {formatINR(j.budgetMin)} to {formatINR(j.budgetMax)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {j.deadlineDays}d
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {j.proposalsCount}
                    </span>
                    <span>{j.createdAgo}</span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
