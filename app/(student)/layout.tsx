import {
  LayoutDashboard,
  Briefcase,
  Sparkles,
  FileText,
  Package,
  ShoppingBag,
  Wallet,
  Banknote,
  MessagesSquare,
  ShieldCheck,
  Receipt,
} from "lucide-react";
import { PortalShell, type NavItem } from "@/components/layout/portal-shell";
import type { MobileNavItem } from "@/components/layout/mobile-nav";
import { currentStudent } from "@/lib/auth/session";
import { listConversations } from "@/lib/data/queries";

const NAV: NavItem[] = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/matches", label: "Matches", icon: Sparkles },
  { href: "/student/jobs", label: "Browse jobs", icon: Briefcase },
  { href: "/student/proposals", label: "My proposals", icon: FileText },
  { href: "/student/orders", label: "Orders", icon: ShoppingBag },
  { href: "/student/services", label: "My services", icon: Package },
  { href: "/student/earnings", label: "Earnings", icon: Wallet },
  { href: "/student/payouts", label: "Payouts", icon: Banknote },
  { href: "/student/trust", label: "Trust score", icon: ShieldCheck },
  { href: "/student/tax", label: "Tax & TDS", icon: Receipt },
  { href: "/messages", label: "Messages", icon: MessagesSquare },
];

/** Five-slot mobile bottom nav (P57 audit). Centre pill = matches. */
const MOBILE_NAV: MobileNavItem[] = [
  { href: "/student/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/student/jobs", label: "Jobs", icon: Briefcase },
  { href: "/student/matches", label: "Matches", icon: Sparkles, primary: true },
  { href: "/student/orders", label: "Orders", icon: ShoppingBag },
  { href: "/messages", label: "Chat", icon: MessagesSquare },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const me = currentStudent();
  const unread = (await listConversations()).reduce((n, c) => n + c.unread, 0);

  return (
    <PortalShell
      unreadCount={unread}
      nav={NAV}
      mobileNav={MOBILE_NAV}
      accent="sage"
      personaLabel="Student"
      user={{ name: me.fullName, initials: me.avatarInitials, sub: `${me.stream} · ${me.college}` }}
    >
      {children}
    </PortalShell>
  );
}
