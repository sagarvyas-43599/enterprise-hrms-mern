"use client";

import React from "react";
import Link from "next/link";
import { Clock, CalendarPlus, Sparkles, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { openModal } from "@/redux/slices/uiSlice";
import { useNow } from "../hooks/useDashboardData";
import { getGreeting } from "../utils/dashboard.utils";

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Administrator",
  HR_ADMIN: "HR Administrator",
  MANAGER: "People Manager",
  EMPLOYEE: "Team Member",
};

/**
 * Personalised hero. Owns its own 1s clock so the rest of the dashboard
 * does not re-render every tick.
 */
export const DashboardHero: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const now = useNow();

  const firstName = user?.firstName || user?.email?.split("@")[0] || "there";

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 dark:from-slate-900 dark:via-indigo-950 dark:to-blue-950 p-6 sm:p-8 text-white shadow-xl">
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-indigo-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{ROLE_LABEL[user?.role ?? "EMPLOYEE"]}</span>
            {user?.department && <span className="text-white/50">· {user.department}</span>}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {now ? getGreeting(now) : "Welcome"}, {firstName} <span aria-hidden="true">👋</span>
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Here&apos;s what&apos;s happening across your workspace today — your shift, pending actions,
            team availability and company updates, all in one place.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="primary"
              leftIcon={<Clock className="w-4 h-4" />}
              onClick={() => dispatch(openModal({ modalType: "CHECK_IN_ATTENDANCE" }))}
            >
              Punch In
            </Button>
            <Button
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              leftIcon={<CalendarPlus className="w-4 h-4" />}
              onClick={() => dispatch(openModal({ modalType: "APPLY_LEAVE" }))}
            >
              Apply Leave
            </Button>
            <Link href="/tickets">
              <Button
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                leftIcon={<LifeBuoy className="w-4 h-4" />}
              >
                Raise Ticket
              </Button>
            </Link>
          </div>
        </div>

        {/* Live clock */}
        <div className="shrink-0 rounded-2xl bg-white/5 border border-white/10 backdrop-blur px-5 py-4 text-right">
          <p className="text-4xl font-black tabular-nums tracking-tight" suppressHydrationWarning>
            {now ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--"}
          </p>
          <p className="text-xs text-slate-300 mt-1" suppressHydrationWarning>
            {now
              ? now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long", year: "numeric" })
              : "\u00A0"}
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-blue-600/30 blur-3xl" />
      <div className="pointer-events-none absolute right-40 bottom-0 -mb-10 h-60 w-60 rounded-full bg-indigo-600/25 blur-3xl" />
    </section>
  );
};
