"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { useGetAttendanceHistoryQuery } from "@/redux/services/attendanceApi";
import { getTodayISO } from "../utils/dashboard.utils";

/**
 * Hydration-safe ticking clock. Returns `null` on the server / first paint
 * so SSR markup never mismatches the client.
 */
export const useNow = (intervalMs = 1000): Date | null => {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
};

/**
 * Today's attendance record for the logged-in user.
 * RTK Query de-duplicates identical args, so every widget calling this
 * shares a single network request + cache entry.
 */
export const useMyTodayAttendance = () => {
  const { user } = useAppSelector((state) => state.auth);
  const today = getTodayISO();
  const hasEmployeeProfile = Boolean(user?.employeeId);

  const query = useGetAttendanceHistoryQuery(
    { employeeId: user?.employeeId, startDate: today, endDate: today, limit: 1 },
    { skip: !hasEmployeeProfile, pollingInterval: 5 * 60 * 1000 }
  );

  return {
    ...query,
    hasEmployeeProfile,
    record: query.data?.data?.records?.[0] ?? null,
  };
};
