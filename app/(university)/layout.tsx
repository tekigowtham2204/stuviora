import {
  LayoutDashboard,
  Users,
  FileBarChart,
  Plug,
  Settings,
} from "lucide-react";
import { PortalShell, type NavItem } from "@/components/layout/portal-shell";
import { getSession } from "@/lib/auth/session";
import { DEMO_UNIVERSITY } from "@/lib/demo/data";

const NAV: NavItem[] = [
  { href: "/university/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/university/cohort", label: "Cohort", icon: Users },
  { href: "/university/reports", label: "Reports", icon: FileBarChart },
  { href: "/university/integration", label: "Integration", icon: Plug },
  { href: "/university/settings", label: "Settings", icon: Settings },
];

export default async function UniversityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const isUniversity = session?.role === "university";
  const name = isUniversity ? session.name : DEMO_UNIVERSITY.fullName;
  const college =
    (isUniversity ? session.college : undefined) ?? DEMO_UNIVERSITY.college;

  return (
    <PortalShell
      nav={NAV}
      accent="university"
      personaLabel="University"
      user={{ name, initials: DEMO_UNIVERSITY.avatarInitials, sub: college }}
    >
      {children}
    </PortalShell>
  );
}
