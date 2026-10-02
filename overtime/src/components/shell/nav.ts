import { BarChart3, Home, LayoutGrid, ListChecks, Mail, Send, User, Users, History, FileBarChart, Building2 } from "lucide-react";
import type { Role } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  exact?: boolean;
}

export const NAV: Record<Role, NavItem[]> = {
  agent: [
    { href: "/agent", label: "Home", icon: Home, exact: true },
    { href: "/agent/history", label: "My overtime", icon: History },
    { href: "/agent/profile", label: "Profile", icon: User },
  ],
  monitoring: [
    { href: "/monitoring", label: "Overview", icon: LayoutGrid, exact: true },
    { href: "/monitoring/requests", label: "Requests", icon: Send },
    { href: "/monitoring/recipients", label: "Recipients", icon: Users },
    { href: "/monitoring/lists", label: "Distribution lists", icon: ListChecks },
    { href: "/monitoring/templates", label: "Templates", icon: Mail },
    { href: "/monitoring/analytics", label: "Analytics", icon: BarChart3 },
  ],
  management: [
    { href: "/insights", label: "Overview", icon: LayoutGrid, exact: true },
    { href: "/insights/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/insights/teams", label: "Teams", icon: Building2 },
    { href: "/insights/reports", label: "Reports", icon: FileBarChart },
  ],
};

export const ROLE_LABEL: Record<Role, string> = { agent: "Agent", monitoring: "Monitoring", management: "Management" };

export const isActive = (pathname: string, item: NavItem) => (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/"));

