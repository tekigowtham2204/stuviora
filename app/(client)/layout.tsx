import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  ShoppingBag,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import { PortalShell, type NavItem } from "@/components/layout/portal-shell";
import type { MobileNavItem } from "@/components/layout/mobile-nav";
import { currentClient } from "@/lib/auth/session";

const NAV: NavItem[] = [
  { href: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/client/post-job", label: "Post a job", icon: PlusCircle },
  { href: "/client/jobs", label: "My jobs", icon: Briefcase },
  { href: "/client/matches", label: "Suggested talent", icon: Sparkles },
  { href: "/client/orders", label: "Orders", icon: ShoppingBag },
  { href: "/messages", label: "Messages", icon: MessagesSquare },
];

const MOBILE_NAV: MobileNavItem[] = [
  { href: "/client/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/client/jobs", label: "Jobs", icon: Briefcase },
  { href: "/client/post-job", label: "Post", icon: PlusCircle, primary: true },
  { href: "/client/orders", label: "Orders", icon: ShoppingBag },
  { href: "/messages", label: "Chat", icon: MessagesSquare },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const me = currentClient();
  return (
    <PortalShell
      nav={NAV}
      mobileNav={MOBILE_NAV}
      accent="orange"
      personaLabel="Client"
      user={{ name: me.fullName, initials: me.avatarInitials, sub: me.companyName }}
    >
      {children}
    </PortalShell>
  );
}
