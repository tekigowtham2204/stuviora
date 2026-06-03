import {
  LayoutDashboard,
  MessagesSquare,
  Scale,
  Settings,
} from "lucide-react";
import { PortalShell, type NavItem } from "@/components/layout/portal-shell";
import { getSession } from "@/lib/auth/session";
import { currentStudent, currentClient } from "@/lib/auth/session";

export default async function SharedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const role = session?.role ?? "student";
  const isClient = role === "client";

  const NAV: NavItem[] = [
    {
      href: isClient ? "/client/dashboard" : "/student/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    { href: "/messages", label: "Messages", icon: MessagesSquare },
    { href: "/disputes", label: "Disputes", icon: Scale },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const me = isClient ? currentClient() : currentStudent();
  const user = isClient
    ? {
        name: me.fullName,
        initials: me.avatarInitials,
        sub: "companyName" in me ? me.companyName : "",
      }
    : {
        name: me.fullName,
        initials: me.avatarInitials,
        sub:
          "stream" in me && "college" in me
            ? `${me.stream} · ${me.college}`
            : "",
      };

  return (
    <PortalShell nav={NAV} accent={isClient ? "trust" : "brand"} user={user}>
      {children}
    </PortalShell>
  );
}
