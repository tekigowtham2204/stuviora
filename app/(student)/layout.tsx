import {
  LayoutDashboard,
  Briefcase,
  Sparkles,
  FileText,
  Package,
  ShoppingBag,
  Wallet,
  MessagesSquare,
  ShieldCheck,
  Receipt,
} from "lucide-react";
import { PortalShell, type NavItem } from "@/components/layout/portal-shell";
import { currentStudent } from "@/lib/auth/session";

const NAV: NavItem[] = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/matches", label: "Matches", icon: Sparkles },
  { href: "/student/jobs", label: "Browse jobs", icon: Briefcase },
  { href: "/student/proposals", label: "My proposals", icon: FileText },
  { href: "/student/orders", label: "Orders", icon: ShoppingBag },
  { href: "/student/services", label: "My services", icon: Package },
  { href: "/student/earnings", label: "Earnings", icon: Wallet },
  { href: "/student/trust", label: "Trust score", icon: ShieldCheck },
  { href: "/student/tax", label: "Tax & TDS", icon: Receipt },
  { href: "/messages", label: "Messages", icon: MessagesSquare },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const me = currentStudent();
  return (
    <PortalShell
      nav={NAV}
      accent="sage"
      personaLabel="Student"
      user={{ name: me.fullName, initials: me.avatarInitials, sub: `${me.stream} · ${me.college}` }}
    >
      {children}
    </PortalShell>
  );
}
