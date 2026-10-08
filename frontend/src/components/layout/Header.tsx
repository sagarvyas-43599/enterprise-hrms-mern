"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  Clock,
  Sun,
  Moon,
  Shield,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  toggleSidebar,
  openModal,
  toggleTheme,
} from "@/redux/slices/uiSlice";
import { useLogoutUserMutation } from "@/redux/services/authApi";
import { toast } from "sonner";
import { NotificationPopover } from "@/features/notifications/components/NotificationPopover";

export const Header: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { theme, sidebarOpen } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);
  const [logoutUser] = useLogoutUserMutation();

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      toast.success("Logged out successfully");
      router.replace("/login");
    } catch {
      router.replace("/login");
    }
  };

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email?.split("@")[0] || "Administrator";

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : (user?.email?.[0] || "A").toUpperCase();

  const userRole = user?.role || "SUPER_ADMIN";

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Side: Hamburger */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Right Side: Quick Action, Profile & Logout */}
        <div className="flex items-center gap-3">
          {/* Quick Punch In Action Button */}
          <Button
            size="sm"
            variant="primary"
            onClick={() =>
              dispatch(openModal({ modalType: "CHECK_IN_ATTENDANCE" }))
            }
            leftIcon={<Clock className="w-3.5 h-3.5" />}
          >
            Punch Clock-In
          </Button>

          {/* Theme toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Notifications Popover */}
          <NotificationPopover />

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

          {/* User profile dropdown badge - Clickable to open Profile */}
          <button
            type="button"
            onClick={() => dispatch(openModal({ modalType: "USER_PROFILE" }))}
            className="flex items-center gap-2.5 px-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left"
            title="View Employee Profile"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-blue-500/20 overflow-hidden">
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
            <div className="hidden md:block text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {displayName}
                </span>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  <Shield className="w-2.5 h-2.5" />
                  {userRole.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[150px]">
                {user?.email || "Authenticated"}
              </p>
            </div>
          </button>

          {/* Logout CTA button */}
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-1"
            title="Sign Out of Portal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
