"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ListChecks, CheckCircle2, Circle, ChevronRight, PartyPopper } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { useGetPoliciesQuery } from "@/redux/services/policyApi";
import { useGetDocumentsQuery } from "@/redux/services/documentApi";
import { useGetExpensesQuery } from "@/redux/services/expenseApi";
import { useGetLeaveBalancesQuery } from "@/redux/services/leaveApi";
import { useMyTodayAttendance } from "../hooks/useDashboardData";

interface ChecklistItem {
  id: string;
  title: string;
  hint: string;
  href: string;
  done: boolean;
  severity: "high" | "medium" | "low";
}

const SEVERITY_DOT: Record<ChecklistItem["severity"], string> = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-sky-500",
};

export const ActionChecklistWidget: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const hasProfile = Boolean(user?.employeeId);

  const { record: todayAttendance, isLoading: attLoading } = useMyTodayAttendance();
  const { data: policyData, isLoading: polLoading } = useGetPoliciesQuery({ status: "PUBLISHED", limit: 100 });
  const { data: docData, isLoading: docLoading } = useGetDocumentsQuery(
    { isMyDocuments: true, limit: 100 },
    { skip: !hasProfile }
  );
  const { data: expData } = useGetExpensesQuery({ isMyExpenses: true, limit: 100 }, { skip: !hasProfile });
  const { data: balanceData } = useGetLeaveBalancesQuery(undefined, { skip: !hasProfile });

  const items = useMemo<ChecklistItem[]>(() => {
    const list: ChecklistItem[] = [];

    // 1. Attendance
    if (hasProfile) {
      list.push({
        id: "punch-in",
        title: todayAttendance ? "Punched in for today" : "Punch in for today's shift",
        hint: todayAttendance ? "Attendance captured" : "Your shift hasn't been recorded yet",
        href: "/attendance",
        done: Boolean(todayAttendance),
        severity: "high",
      });
    }

    // 2. Mandatory policy sign-offs
    const pendingPolicies = (policyData?.data ?? []).filter((p) => p.isMandatory && !p.hasAcknowledged);
    list.push({
      id: "policies",
      title:
        pendingPolicies.length > 0
          ? `Sign ${pendingPolicies.length} mandatory ${pendingPolicies.length === 1 ? "policy" : "policies"}`
          : "All mandatory policies signed",
      hint: pendingPolicies.length > 0 ? pendingPolicies.slice(0, 2).map((p) => p.title).join(", ") : "Compliance up to date",
      href: "/policies",
      done: pendingPolicies.length === 0,
      severity: "high",
    });

    if (hasProfile) {
      // 3. KYC / identity document
      const docs = docData?.data?.documents ?? [];
      const hasIdentity = docs.some((d) => d.category === "IDENTITY" && d.status !== "REJECTED");
      list.push({
        id: "kyc",
        title: hasIdentity ? "Identity proof on file" : "Upload identity proof (KYC)",
        hint: hasIdentity ? "Aadhaar / PAN submitted" : "Required for payroll & statutory compliance",
        href: "/documents",
        done: hasIdentity,
        severity: "medium",
      });

      // 4. Rejected documents needing re-upload
      const rejectedDocs = docs.filter((d) => d.status === "REJECTED");
      if (rejectedDocs.length > 0) {
        list.push({
          id: "rejected-docs",
          title: `Re-upload ${rejectedDocs.length} rejected document${rejectedDocs.length > 1 ? "s" : ""}`,
          hint: rejectedDocs[0]?.rejectionReason || rejectedDocs[0]?.title || "",
          href: "/documents",
          done: false,
          severity: "medium",
        });
      }

      // 5. Rejected expense claims
      const rejectedExpenses = (expData?.data?.expenses ?? []).filter((e) => e.status === "REJECTED");
      if (rejectedExpenses.length > 0) {
        list.push({
          id: "rejected-expenses",
          title: `Review ${rejectedExpenses.length} rejected expense claim${rejectedExpenses.length > 1 ? "s" : ""}`,
          hint: rejectedExpenses[0]?.rejectionReason || rejectedExpenses[0]?.title || "",
          href: "/expenses",
          done: false,
          severity: "low",
        });
      }

      // 6. Leave balance health
      const casual = balanceData?.data?.balances?.find((b) => b.leaveType === "CASUAL");
      if (casual && casual.remainingDays <= 2) {
        list.push({
          id: "leave-balance",
          title: `Only ${casual.remainingDays} casual leave${casual.remainingDays === 1 ? "" : "s"} left`,
          hint: "Plan upcoming time-off carefully",
          href: "/leaves",
          done: false,
          severity: "low",
        });
      }
    }

    // Pending first, sorted by severity; completed at the bottom.
    const weight = { high: 0, medium: 1, low: 2 };
    return list.sort((a, b) => Number(a.done) - Number(b.done) || weight[a.severity] - weight[b.severity]);
  }, [hasProfile, todayAttendance, policyData, docData, expData, balanceData]);

  const doneCount = items.filter((i) => i.done).length;
  const progress = items.length ? Math.round((doneCount / items.length) * 100) : 100;
  const isLoading = attLoading || polLoading || docLoading;

  return (
    <section
      aria-labelledby="checklist-title"
      className="h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col overflow-hidden"
    >
      <header className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
        <div className="flex items-center justify-between">
          <h3 id="checklist-title" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-violet-500" />
            My Action Items
          </h3>
          <span className="text-[11px] font-bold text-slate-500 tabular-nums">
            {doneCount}/{items.length} done
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <ul className="flex-1 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto max-h-[320px]">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="p-4 flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  <div className="h-2.5 w-1/3 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                </div>
              </li>
            ))
          : items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  id={`checklist-${item.id}`}
                  className="group p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {item.done ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        item.done
                          ? "line-through decoration-slate-300 text-slate-400 dark:text-slate-500"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {item.title}
                    </p>
                    {item.hint && <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.hint}</p>}
                  </div>
                  {!item.done && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${SEVERITY_DOT[item.severity]}`} />}
                  <ChevronRight className="w-4 h-4 shrink-0 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </li>
            ))}
      </ul>

      {!isLoading && progress === 100 && (
        <div className="p-3 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-t border-emerald-100 dark:border-emerald-900/40">
          <PartyPopper className="w-4 h-4" /> You&apos;re all caught up!
        </div>
      )}
    </section>
  );
};
