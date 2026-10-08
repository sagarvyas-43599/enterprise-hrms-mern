"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Users, Building2, Plane, CircleDashed } from "lucide-react";
import { useGetEmployeesQuery } from "@/redux/services/employeeApi";
import { useGetAttendanceHistoryQuery } from "@/redux/services/attendanceApi";
import { useGetLeavesQuery } from "@/redux/services/leaveApi";
import type { Employee } from "@/features/employees/types/employee.types";
import {
  getAvatarGradient,
  getInitials,
  getRefId,
  getTodayISO,
  isDayWithinRange,
} from "../utils/dashboard.utils";

type PulseBucket = "PRESENT" | "ON_LEAVE" | "AWAITED";

const BUCKETS: Record<
  PulseBucket,
  { label: string; icon: React.ReactNode; bar: string; chip: string; ring: string }
> = {
  PRESENT: {
    label: "Checked In",
    icon: <Building2 className="w-3.5 h-3.5" />,
    bar: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    ring: "ring-emerald-500",
  },
  ON_LEAVE: {
    label: "On Leave",
    icon: <Plane className="w-3.5 h-3.5" />,
    bar: "bg-amber-500",
    chip: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    ring: "ring-amber-500",
  },
  AWAITED: {
    label: "Not Yet In",
    icon: <CircleDashed className="w-3.5 h-3.5" />,
    bar: "bg-slate-300 dark:bg-slate-600",
    chip: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    ring: "ring-slate-300 dark:ring-slate-600",
  },
};

const MAX_AVATARS = 8;

export const TeamPulseWidget: React.FC = () => {
  const today = getTodayISO();
  const [active, setActive] = useState<PulseBucket>("PRESENT");

  const { data: empData, isLoading: empLoading } = useGetEmployeesQuery({ limit: 100 });
  const { data: attData } = useGetAttendanceHistoryQuery(
    { startDate: today, endDate: today, limit: 100 },
    { pollingInterval: 2 * 60 * 1000 }
  );
  const { data: leaveData } = useGetLeavesQuery({ status: "APPROVED", limit: 100 });

  const groups = useMemo(() => {
    const employees: Employee[] = empData?.data ?? [];
    const presentIds = new Set(
      (attData?.data?.records ?? [])
        .filter((r) => r.status !== "ABSENT" && r.status !== "ON_LEAVE")
        .map((r) => getRefId(r.employeeId as any))
        .filter(Boolean) as string[]
    );
    const leaveIds = new Set(
      (leaveData?.data ?? [])
        .filter((l) => isDayWithinRange(today, l.startDate, l.endDate))
        .map((l) => getRefId(l.employeeId as any))
        .filter(Boolean) as string[]
    );

    const result: Record<PulseBucket, Employee[]> = { PRESENT: [], ON_LEAVE: [], AWAITED: [] };
    employees.forEach((e) => {
      if (leaveIds.has(e._id)) result.ON_LEAVE.push(e);
      else if (presentIds.has(e._id)) result.PRESENT.push(e);
      else result.AWAITED.push(e);
    });
    return result;
  }, [empData, attData, leaveData, today]);

  const total = groups.PRESENT.length + groups.ON_LEAVE.length + groups.AWAITED.length;
  const pct = (n: number) => (total ? (n / total) * 100 : 0);
  const activeList = groups[active];

  return (
    <section
      aria-labelledby="team-pulse-title"
      className="h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col overflow-hidden"
    >
      <header className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <h3 id="team-pulse-title" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-sky-500" />
          Workforce Pulse · Today
        </h3>
        <span className="text-[11px] font-semibold text-slate-500">
          {total ? `${Math.round(pct(groups.PRESENT.length))}% present` : "—"}
        </span>
      </header>

      <div className="p-5 flex-1 flex flex-col gap-5">
        {/* Stacked distribution bar */}
        <div>
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            {(Object.keys(BUCKETS) as PulseBucket[]).map((key) => (
              <div
                key={key}
                className={`${BUCKETS[key].bar} transition-all duration-700`}
                style={{ width: `${pct(groups[key].length)}%` }}
                title={`${BUCKETS[key].label}: ${groups[key].length}`}
              />
            ))}
          </div>
        </div>

        {/* Bucket filter tabs */}
        <div role="tablist" className="grid grid-cols-3 gap-2">
          {(Object.keys(BUCKETS) as PulseBucket[]).map((key) => {
            const cfg = BUCKETS[key];
            const selected = active === key;
            return (
              <button
                key={key}
                id={`pulse-tab-${key.toLowerCase()}`}
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(key)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  selected
                    ? "border-indigo-300 dark:border-indigo-700 bg-indigo-50/60 dark:bg-indigo-950/30 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${cfg.chip}`}>
                  {cfg.icon}
                  {cfg.label}
                </span>
                <p className="mt-2 text-xl font-black tabular-nums text-slate-900 dark:text-white">
                  {empLoading ? "…" : groups[key].length}
                </p>
              </button>
            );
          })}
        </div>

        {/* Avatar stack */}
        <div className="min-h-[64px]">
          {activeList.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">Nobody in this group right now.</p>
          ) : (
            <ul className="flex flex-wrap gap-3">
              {activeList.slice(0, MAX_AVATARS).map((e) => (
                <li key={e._id} className="group relative">
                  <Link href={`/employees?search=${encodeURIComponent(e.firstName)}`} aria-label={`${e.firstName} ${e.lastName}`}>
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(e._id)} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ${BUCKETS[active].ring} flex items-center justify-center text-xs font-bold text-white transition-transform group-hover:-translate-y-0.5`}
                    >
                      {getInitials(e.firstName, e.lastName)}
                    </div>
                  </Link>
                  <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-10">
                    {e.firstName} {e.lastName} · {e.designation || e.department}
                  </span>
                </li>
              ))}
              {activeList.length > MAX_AVATARS && (
                <li className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  +{activeList.length - MAX_AVATARS}
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      <Link
        href="/attendance"
        className="p-3 text-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800"
      >
        Open Attendance Register
      </Link>
    </section>
  );
};
