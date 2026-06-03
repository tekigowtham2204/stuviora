import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createService } from "@/app/actions/services";
import { SERVICE_CATEGORIES } from "@/lib/constants";

export const metadata = { title: "New service" };

export default function NewServicePage() {
  return (
    <>
      <PageHeader title="Create a service" subtitle="Three tiers; let clients pick how big or small." />

      <form action={createService} className="max-w-2xl space-y-5">
        <Card>
          <div className="space-y-4">
            <Field
              label="Service title"
              name="title"
              placeholder="e.g. Python automation scripts for SMB workflows"
            />
            <div>
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <select
                id="category"
                name="category"
                className="mt-1 w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
              >
                {SERVICE_CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="description" className="text-sm font-medium">
                What you deliver
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="A 2-3 line description of what's included, and what's not."
                className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Pricing tiers
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Tier name="basic" defaultPrice={2500} defaultDays={3} />
            <Tier name="standard" defaultPrice={6000} defaultDays={5} />
            <Tier name="premium" defaultPrice={12000} defaultDays={8} />
          </div>
        </Card>

        <Button type="submit" variant="primary">
          Publish service
        </Button>
      </form>
    </>
  );
}

function Field({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
      />
    </div>
  );
}

function Tier({
  name,
  defaultPrice,
  defaultDays,
}: {
  name: string;
  defaultPrice: number;
  defaultDays: number;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted">{name}</div>
      <div className="mt-2 space-y-2">
        <input
          name={`${name}_price`}
          type="number"
          defaultValue={defaultPrice}
          placeholder="Price (INR)"
          className="w-full rounded-md border border-border-strong px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-400"
        />
        <input
          name={`${name}_days`}
          type="number"
          defaultValue={defaultDays}
          placeholder="Delivery days"
          className="w-full rounded-md border border-border-strong px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>
    </div>
  );
}
