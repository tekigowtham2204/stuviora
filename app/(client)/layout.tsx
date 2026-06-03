import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  ShoppingBag,
  MessagesSquare,
} from "lucide-react";
import { PortalShell, type NavItem } from "@/components/layout/portal-shell";
import { currentClient } from "@/lib/auth/session";

const NAV: NavItem[] = [
  { href: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/client/post-job", label: "Post a job", icon: PlusCircle },
  { href: "/client/jobs", label: "My jobs", icon: Briefcase },
  { href: "/client/orders", label: "Orders", icon: ShoppingBag },
  { href: "/messages", label: "Messages", icon: MessagesSquare },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const me = currentClient();
  return (
    <PortalShell
      nav={NAV}
      accent="trust"
      user={{ name: me.fullName, initials: me.avatarInitials, sub: me.companyName }}
    >
      {children}
    </PortalShell>
  );
}
