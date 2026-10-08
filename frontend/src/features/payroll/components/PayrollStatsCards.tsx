"use client";

import React from "react";
import {
  CreditCard,
  Clock,
  FileCheck2,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import { PayrollSlip } from "../types/payroll.types";

interface PayrollStatsCardsProps {
  payrolls?: PayrollSlip[];
  analytics?: any;
  isLoading?: boolean;
}

export const PayrollStatsCards: React.FC<PayrollStatsCardsProps> = ({
  payrolls = [],
  analytics,
  isLoading = false,
}) => {
  // Aggregate from current payroll list as well as backend analytics
  const totalPaid = payrolls
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + (p.netSalary || 0), 0);

  const pendingPayout = payrolls
    .filter((p) => p.status === "DRAFT" || p.status === "PROCESSED")
    .reduce((sum, p) => sum + (p.netSalary || 0), 0);

  const totalSlips = payrolls.length;
  const avgNet =
    totalSlips > 0
      ? Math.round(
          payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0) / totalSlips
        )
      : 0;

  const cards = [
    {
      label: "Total Disbursed (Paid)",
      value: `$${totalPaid.toLocaleString()}`,
      subtext: "Successfully disbursed to staff accounts",
      icon: <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bgIcon: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Pending Disbursal",
      value: `$${pendingPayout.toLocaleString()}`,
      subtext: `${
        payrolls.filter((p) => p.status !== "PAID").length
      } slips in Draft / Processed queue`,
      icon: <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      bgIcon: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
      accent: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Total Salary Slips",
      value: totalSlips.toString(),
      subtext: "Pay records for active fiscal cycle",
      icon: <FileCheck2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      bgIcon: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
      accent: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Average Net Compensation",
      value: `$${avgNet.toLocaleString()}`,
      subtext: "Net monthly average per employee",
      icon: <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      bgIcon: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400",
      accent: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {card.label}
            </span>
            <div
              className={`w-10 h-10 rounded-xl ${card.bgIcon} flex items-center justify-center shrink-0`}
            >
              {card.icon}
            </div>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            ) : (
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {card.value}
              </h3>
            )}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {card.subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
