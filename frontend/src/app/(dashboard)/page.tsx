"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  CalendarCheck,
  CreditCard,
  ArrowUpRight,
  TrendingUp,
  LayoutGrid,
  Receipt,
  FileText,
  LifeBuoy,
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { useGetEmployeesQuery } from "@/redux/services/employeeApi";
import { useGetLeavesQuery } from "@/redux/services/leaveApi";
import { useGetPayrollAnalyticsQuery } from "@/redux/services/payrollApi";
import { useGetAttendanceHistoryQuery } from "@/redux/services/attendanceApi";
import { GlobalSearchWidget, PendingInboxWidget, ActivityFeedWidget } from "@/features/core/components/EnterpriseWidgets";
import {
  DashboardHero,
  AnnouncementsCarousel,
  ShiftTrackerWidget,
  ActionChecklistWidget,
  TeamPulseWidget,
} from "@/features/dashboard";
import { getTodayISO } from "@/features/dashboard/utils/dashboard.utils";
import { ApplyLeaveModal } from "@/features/leaves/components/ApplyLeaveModal";

export default function DashboardOverviewPage() {
  const { user } = useAppSelector((state) => state.auth);

  const isStaffOrAdmin =
    user?.role === "SUPER_ADMIN" || user?.role === "HR_ADMIN" || user?.role === "MANAGER";
  const isFinanceAuthorized = user?.role === "SUPER_ADMIN" || user?.role === "HR_ADMIN";
  const today = getTodayISO();

  // Live KPI sources (only fetched for roles allowed to see them)
  const { data: employeesData } = useGetEmployeesQuery({ limit: 1 }, { skip: !isStaffOrAdmin });
  const { data: leavesData } = useGetLeavesQuery(
    { status: "PENDING", limit: 1 },
    { skip: !isStaffOrAdmin }
  );
  const { data: payrollData } = useGetPayrollAnalyticsQuery(undefined, { skip: !isFinanceAuthorized });
  const { data: todayAttendance } = useGetAttendanceHistoryQuery(
    { startDate: today, endDate: today, limit: 1 },
    { skip: !isStaffOrAdmin }
  );

  const fmt = (v: number | undefined) => (v === undefined ? "—" : v.toLocaleString());

  const kpis = [
    {
      title: "Total Headcount",
      value: fmt(employeesData?.meta?.total),
      change: "Active in directory",
      icon: <Users className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50 dark:bg-blue-950/40",
      href: "/employees",
    },
    {
      title: "Checked In Today",
      value: fmt(todayAttendance?.data?.meta?.total),
      change: "Live shift punches",
      icon: <Clock className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      href: "/attendance",
    },
    {
      title: "Pending Leave Requests",
      value: fmt(leavesData?.meta?.total),
      change: (leavesData?.meta?.total ?? 0) > 0 ? "Requires review" : "All caught up",
      icon: <CalendarCheck className="w-5 h-5 text-amber-600" />,
      bg: "bg-amber-50 dark:bg-amber-950/40",
      href: "/leaves",
    },
    ...(isFinanceAuthorized
      ? [
          {
            title: "Payroll Disbursed",
            value: payrollData?.data?.totalDisbursed
              ? `₹${payrollData.data.totalDisbursed.toLocaleString("en-IN")}`
              : "—",
            change: "Year to date",
            icon: <CreditCard className="w-5 h-5 text-purple-600" />,
            bg: "bg-purple-50 dark:bg-purple-950/40",
            href: "/payroll",
          },
        ]
      : []),
  ];

  const launchpad = [
    { title: "Attendance", href: "/attendance", icon: <Clock className="w-5 h-5 text-blue-600" /> },
    { title: "Leaves", href: "/leaves", icon: <CalendarCheck className="w-5 h-5 text-emerald-600" /> },
    { title: "Expenses", href: "/expenses", icon: <Receipt className="w-5 h-5 text-rose-600" /> },
    { title: "Documents", href: "/documents", icon: <FileText className="w-5 h-5 text-amber-600" /> },
    { title: "Helpdesk", href: "/tickets", icon: <LifeBuoy className="w-5 h-5 text-sky-600" /> },
    ...(isStaffOrAdmin
      ? [{ title: "Directory", href: "/employees", icon: <Users className="w-5 h-5 text-indigo-600" /> }]
      : []),
    ...(isFinanceAuthorized
      ? [{ title: "Payroll", href: "/payroll", icon: <CreditCard className="w-5 h-5 text-purple-600" /> }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <GlobalSearchWidget />

      <DashboardHero />

      <AnnouncementsCarousel />

      {/* Executive KPIs — management only */}
      {isStaffOrAdmin && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${kpis.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          {kpis.map((kpi) => (
            <Link
              key={kpi.title}
              href={kpi.href}
              className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{kpi.title}</span>
                <div className={`p-2.5 rounded-xl ${kpi.bg}`}>{kpi.icon}</div>
              </div>
              <div className="mt-4">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{kpi.value}</h2>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{kpi.change}</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-blue-600 font-semibold">
                <span>View details</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Personal productivity row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ShiftTrackerWidget />
        <div className={isStaffOrAdmin ? "" : "lg:col-span-2"}>
          <ActionChecklistWidget />
        </div>
        {isStaffOrAdmin && <TeamPulseWidget />}
      </div>

      {/* Management row */}
      {isStaffOrAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PendingInboxWidget />
          </div>
          <ActivityFeedWidget />
        </div>
      )}

      {/* Launchpad */}
      <section aria-labelledby="launchpad-title" className="space-y-3">
        <h2 id="launchpad-title" className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-blue-600" />
          Quick Launchpad
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {launchpad.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col items-center gap-2 text-center"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{item.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <ApplyLeaveModal />
    </div>
  );
}
