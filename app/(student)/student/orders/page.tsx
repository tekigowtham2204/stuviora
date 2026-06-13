import { PageHeader } from "@/components/ui/page-header";
import { OrdersViews } from "@/components/feature/orders-views";
import { listStudentOrders } from "@/lib/data/queries";
import { currentStudent } from "@/lib/auth/session";

export const metadata = { title: "Orders" };

export default async function StudentOrdersPage() {
  const me = currentStudent();
  const orders = await listStudentOrders(me.id);

  return (
    <>
      <PageHeader
        eyebrow="Work"
        title="Orders."
        subtitle="What you are delivering, and what you have shipped."
      />

      <OrdersViews orders={orders} />
    </>
  );
}
