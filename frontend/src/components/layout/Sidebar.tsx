"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Clock,
  CalendarCheck,
  CreditCard,
  Laptop,
  LifeBuoy,
  Target,
  Building2,
  FileText,
  ShieldCheck,
  LayoutDashboard,
  ChevronLeft,
  Briefcase,
  BarChart3,
  Settings as SettingsIcon,
  Bell,
  Receipt,
  FolderKanban,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { toggleSidebar, openModal } from "@/redux/slices/uiSlice";
import { useGetNotificationsQuery } from "@/redux/services/notificationApi";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  roles?: Array<"SUPER_ADMIN" | "HR_ADMIN" | "MANAGER" | "EMPLOYEE">;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    label: "Employees",
    href: "/employees",
    icon: <Users className="w-4 h-4" />,
    roles: ["SUPER_ADMIN", "HR_ADMIN", "MANAGER"],
  },
  {
    label: "Org & Departments",
    href: "/departments",
    icon: <Building2 className="w-4 h-4" />,
    roles: ["SUPER_ADMIN", "HR_ADMIN", "MANAGER"],
  },
  {
    label: "Attendance & Time",
    href: "/attendance",
    icon: <Clock className="w-4 h-4" />,
    badge: "Live",
  },
  {
    label: "Leaves & Time-off",
    href: "/leaves",
    icon: <CalendarCheck className="w-4 h-4" />,
  },
  {
    label: "Payroll & CTC",
    href: "/payroll",
    icon: <CreditCard className="w-4 h-4" />,
  },
  {
    label: "Performance & OKRs",
    href: "/performance",
    icon: <Target className="w-4 h-4" />,
  },
  {
    label: "Recruitment (ATS)",
    href: "/recruitment",
    icon: <Briefcase className="w-4 h-4" />,
    roles: ["SUPER_ADMIN", "HR_ADMIN", "MANAGER"],
  },
  {
    label: "Asset Inventory",
    href: "/assets",
    icon: <Laptop className="w-4 h-4" />,
  },
  {
    label: "Helpdesk & Tickets",
    href: "/tickets",
    icon: <LifeBuoy className="w-4 h-4" />,
  },
  {
    label: "Policies & Compliance",
    href: "/policies",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    label: "Reports & Analytics",
    href: "/reports",
    icon: <BarChart3 className="w-4 h-4" />,
    roles: ["SUPER_ADMIN", "HR_ADMIN", "MANAGER"],
  },
  {
    label: "Audit Security Trail",
    href: "/audit-logs",
    icon: <ShieldCheck className="w-4 h-4" />,
    roles: ["SUPER_ADMIN", "HR_ADMIN"],
  },
  {
    label: "Company Settings",
    href: "/settings",
    icon: <SettingsIcon className="w-4 h-4" />,
    roles: ["SUPER_ADMIN", "HR_ADMIN"],
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: <Bell className="w-4 h-4" />,
  },
  {
    label: "Expenses & Claims",
    href: "/expenses",
    icon: <Receipt className="w-4 h-4" />,
  },
  {
    label: "Document Vault",
    href: "/documents",
    icon: <FolderKanban className="w-4 h-4" />,
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);

  const userRole = user?.role || "EMPLOYEE";
  
  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email?.split("@")[0] || "Administrator";

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : (user?.email?.[0] || "A").toUpperCase();

  const { data: notifData } = useGetNotificationsQuery(undefined, {
    pollingInterval: 60000,
  });
  const unreadCount = notifData?.data?.unreadCount || 0;

  // RBAC filter: only show menu items authorized for the user's role
  const visibleNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole as any);
  });

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out",
        "bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 flex flex-col",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <Link href="/" className="flex items-center gap-3 overflow-hidden group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30 ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-300">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white drop-shadow-sm">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" fillOpacity="0.4" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {sidebarOpen && (
            <div className="animate-fadeIn flex flex-col justify-center">
              <span className="font-black text-lg bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight leading-none">
                NEXUS
              </span>
              <span className="text-[9px] text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] font-bold mt-1 block">
                Workspace
              </span>
            </div>
          )}
        </Link>

        {sidebarOpen && (
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        {visibleNavItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          const isNotificationItem = item.href === "/notifications";
          const displayBadge = isNotificationItem
            ? unreadCount > 0
              ? unreadCount > 9
                ? "9+"
                : String(unreadCount)
              : null
            : item.badge;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80"
              )}
            >
              <div
                className={cn(
                  "shrink-0 transition-transform group-hover:scale-110 relative",
                  isActive ? "text-white" : "text-slate-400 dark:text-slate-400"
                )}
              >
                {item.icon}
                {isNotificationItem && unreadCount > 0 && !sidebarOpen && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </div>

              {sidebarOpen && (
                <div className="flex-1 flex items-center justify-between overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {displayBadge && (
                    <span
                      className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                        isNotificationItem
                          ? "bg-rose-500 text-white rounded-full min-w-[18px] text-center px-1"
                          : "uppercase bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30"
                      )}
                    >
                      {displayBadge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <button
          type="button"
          onClick={() => dispatch(openModal({ modalType: "USER_PROFILE" }))}
          className={cn(
            "flex items-center w-full rounded-xl transition-colors text-left",
            sidebarOpen ? "gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800/80" : "justify-center"
          )}
          title="View Employee Profile"
        >
          <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-blue-500/20 overflow-hidden relative">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          
          {sidebarOpen && (
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {displayName}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                  <Shield className="w-2.5 h-2.5" />
                  {userRole.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
