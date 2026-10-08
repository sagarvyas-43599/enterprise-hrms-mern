"use client";

import React from "react";
import {
  Users,
  DollarSign,
  Laptop,
  CheckCircle2,
  FileCheck2,
  LifeBuoy,
} from "lucide-react";
import { KpiSummary } from "../types/report.types";

interface ExecutiveKpiCardsProps {
  kpis?: KpiSummary;
  isLoading?: boolean;
  onDrillDown?: (type: string) => void;
}

export const ExecutiveKpiCards: React.FC<ExecutiveKpiCardsProps> = ({
  kpis,
  isLoading = false,
  onDrillDown,
}) => {
  const cards = [
    {
      id: "HEADCOUNT",
      label: "Total Workforce",
      value: kpis?.totalHeadcount?.toString() || "0",
      subtext: "Active corporate staff across departments",
      icon: <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      bgIcon: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400",
    },
    {
      id: "PAYROLL",
      label: "Disbursed Payroll Net",
      value: kpis?.monthlyNetPayroll ? `₹${kpis.monthlyNetPayroll.toLocaleString()}` : "₹0",
      subtext: "Monthly net compensation processed",
      icon: <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bgIcon: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    },
    {
      id: "ASSETS",
      label: "Hardware Asset Capital",
      value: kpis?.totalAssetValuation ? `₹${kpis.totalAssetValuation.toLocaleString()}` : "₹0",
      subtext: `${kpis?.totalAssetsCount || 0} tracked company devices`,
      icon: <Laptop className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      bgIcon: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
    },
    {
      id: "ATTENDANCE",
      label: "Attendance Health",
      value: `${kpis?.attendanceRatePercent || 0}%`,
      subtext: "Daily operational presence & WFH",
      icon: <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      bgIcon: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400",
    },
    {
      id: "POLICIES",
      label: "Policy Signatures",
      value: `${kpis?.totalAcknowledgments || 0} signed`,
      subtext: `${kpis?.publishedPolicies || 0} published mandatory policies`,
      icon: <FileCheck2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
      bgIcon: "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400",
    },
    {
      id: "TICKETS",
      label: "Helpdesk Resolution",
      value: `${kpis?.resolvedTicketsCount || 0} / ${(kpis?.openTicketsCount || 0) + (kpis?.resolvedTicketsCount || 0)}`,
      subtext: `${kpis?.openTicketsCount || 0} active tickets pending SLA`,
      icon: <LifeBuoy className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      bgIcon: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          onClick={() => onDrillDown?.(card.id)}
          className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between transition-all duration-200 ${onDrillDown ? "cursor-pointer hover:shadow-md hover:ring-2 hover:ring-indigo-500/50 hover:border-indigo-500" : ""}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase truncate">
              {card.label}
            </span>
            <div className={`p-2 rounded-xl flex-shrink-0 ${card.bgIcon}`}>
              {card.icon}
            </div>
          </div>
          <div className="mt-3">
            {isLoading ? (
              <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            ) : (
              <div className="text-xl font-bold text-slate-900 dark:text-white truncate">
                {card.value}
              </div>
            )}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium truncate">
              {card.subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
