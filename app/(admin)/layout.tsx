import {
  LayoutDashboard,
  Scale,
  Users,
  ScrollText,
  University,
} from "lucide-react";
import { PortalShell, type NavItem } from "@/components/layout/portal-shell";
import { currentAdmin } from "@/lib/auth/session";

const NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/disputes", label: "Dispute queue", icon: Scale },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/university", label: "University B2B", icon: University },
  { href: "/admin/audit", label: "Audit trail", icon: ScrollText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = currentAdmin();
  return (
    <PortalShell
      nav={NAV}
      accent="yellow"
      personaLabel="Admin"
      user={{ name: me.fullName, initials: me.avatarInitials, sub: "Stuviora admin" }}
    >
      {children}
    </PortalShell>
  );
}
