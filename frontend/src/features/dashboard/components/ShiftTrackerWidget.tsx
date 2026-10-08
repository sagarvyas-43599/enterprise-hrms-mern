"use client";

import React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Timer, LogIn, LogOut, CheckCircle2, AlertTriangle, MapPin, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAppDispatch } from "@/redux/hooks";
import { openModal } from "@/redux/slices/uiSlice";
import { useClockOutMutation } from "@/redux/services/attendanceApi";
import { useMyTodayAttendance, useNow } from "../hooks/useDashboardData";
import { STANDARD_SHIFT_MINUTES, formatDuration } from "../utils/dashboard.utils";

const RING_SIZE = 156;
const STROKE = 12;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type ShiftState = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export const ShiftTrackerWidget: React.FC = () => {
  const dispatch = useAppDispatch();
  const now = useNow();
  const { record, isLoading, hasEmployeeProfile } = useMyTodayAttendance();
  const [clockOut, { isLoading: isClockingOut }] = useClockOutMutation();

  const state: ShiftState = !record ? "NOT_STARTED" : record.clockOut ? "COMPLETED" : "IN_PROGRESS";

  const workedMinutes = (() => {
    if (!record) return 0;
    if (record.clockOut) return record.workDurationMinutes;
    if (!now) return 0;
    return Math.max(0, (now.getTime() - new Date(record.clockIn).getTime()) / 60000);
  })();

  const progress = Math.min(1, workedMinutes / STANDARD_SHIFT_MINUTES);
  const overtime = Math.max(0, workedMinutes - STANDARD_SHIFT_MINUTES);
  const remaining = Math.max(0, STANDARD_SHIFT_MINUTES - workedMinutes);
  const expectedOut = record
    ? new Date(new Date(record.clockIn).getTime() + STANDARD_SHIFT_MINUTES * 60000)
    : null;

  const ringColor =
    overtime > 0 ? "stroke-amber-500" : state === "COMPLETED" ? "stroke-emerald-500" : "stroke-indigo-500";

  const handleClockOut = async () => {
    try {
      await clockOut({}).unwrap();
      toast.success("Shift closed. Great work today!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Unable to clock out");
    }
  };

  const fmtTime = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <section
      aria-labelledby="shift-tracker-title"
      className="relative overflow-hidden h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col"
    >
      <header className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <h3 id="shift-tracker-title" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Timer className="w-4 h-4 text-indigo-500" />
          My Shift Today
        </h3>
        {state === "IN_PROGRESS" && (
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Live
          </span>
        )}
      </header>

      {!hasEmployeeProfile ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-2">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No employee profile linked</p>
          <p className="text-xs text-slate-500 max-w-[220px]">Shift tracking requires your account to be mapped to an employee record.</p>
        </div>
      ) : isLoading ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-[156px] h-[156px] rounded-full border-[12px] border-slate-100 dark:border-slate-800 animate-pulse" />
        </div>
      ) : (
        <div className="flex-1 p-5 flex flex-col items-center gap-4">
          {/* Progress ring */}
          <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
            <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90" aria-hidden="true">
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                strokeWidth={STROKE}
                className="fill-none stroke-slate-100 dark:stroke-slate-800"
              />
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
                className={`fill-none transition-[stroke-dashoffset] duration-1000 ease-out ${ringColor}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                {formatDuration(workedMinutes)}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                of {STANDARD_SHIFT_MINUTES / 60}h shift
              </span>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {Math.round(progress * 100)}%
              </span>
            </div>
          </div>

          {/* Stats */}
          <dl className="grid grid-cols-3 w-full text-center divide-x divide-slate-100 dark:divide-slate-800">
            <div>
              <dt className="text-[10px] uppercase font-semibold text-slate-400">In</dt>
              <dd className="text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                {record ? fmtTime(new Date(record.clockIn)) : "--:--"}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase font-semibold text-slate-400">
                {state === "COMPLETED" ? "Out" : "Exp. Out"}
              </dt>
              <dd className="text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                {record?.clockOut ? fmtTime(new Date(record.clockOut)) : expectedOut ? fmtTime(expectedOut) : "--:--"}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase font-semibold text-slate-400">{overtime > 0 ? "Overtime" : "Left"}</dt>
              <dd
                className={`text-xs font-bold tabular-nums ${
                  overtime > 0 ? "text-amber-600" : "text-slate-800 dark:text-slate-200"
                }`}
              >
                {overtime > 0 ? `+${formatDuration(overtime)}` : formatDuration(remaining)}
              </dd>
            </div>
          </dl>

          {record?.location?.address && (
            <p className="flex items-center gap-1 text-[11px] text-slate-500">
              <MapPin className="w-3 h-3" /> {record.location.address}
            </p>
          )}

          {/* Primary action */}
          <div className="w-full mt-auto">
            {state === "NOT_STARTED" && (
              <Button
                className="w-full"
                leftIcon={<LogIn className="w-4 h-4" />}
                onClick={() => dispatch(openModal({ modalType: "CHECK_IN_ATTENDANCE" }))}
              >
                Punch In
              </Button>
            )}
            {state === "IN_PROGRESS" && (
              <Button
                variant="outline"
                className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/30"
                leftIcon={<LogOut className="w-4 h-4" />}
                isLoading={isClockingOut}
                onClick={handleClockOut}
              >
                Punch Out
              </Button>
            )}
            {state === "COMPLETED" && (
              <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {overtime > 0 ? <Zap className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                Shift completed · {record?.status?.replace("_", " ")}
              </div>
            )}
          </div>
        </div>
      )}

      <Link
        href="/attendance"
        className="p-3 text-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800"
      >
        View Timesheet
      </Link>
    </section>
  );
};
