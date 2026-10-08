"use client";

import React from "react";
import {
  Target,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Goal, Appraisal } from "../types/performance.types";

interface PerformanceStatsCardsProps {
  goals?: Goal[];
  appraisals?: Appraisal[];
  isLoading?: boolean;
}

export const PerformanceStatsCards: React.FC<PerformanceStatsCardsProps> = ({
  goals = [],
  appraisals = [],
  isLoading = false,
}) => {
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === "COMPLETED").length;
  const avgProgress =
    totalGoals > 0
      ? Math.round(
          goals.reduce((acc, g) => acc + (g.progress || 0), 0) / totalGoals
        )
      : 0;

  const totalAppraisals = appraisals.length;
  const completedAppraisals = appraisals.filter(
    (a) => a.status === "COMPLETED"
  ).length;

  const cards = [
    {
      label: "Active OKRs & Goals",
      value: totalGoals.toString(),
      subtext: `${completedGoals} targets achieved so far`,
      icon: <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      bgIcon: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Average Goal Progress",
      value: `${avgProgress}%`,
      subtext: "Across all departmental milestones",
      icon: <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bgIcon:
        "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Appraisal Review Cycles",
      value: totalAppraisals.toString(),
      subtext: `${totalAppraisals - completedAppraisals} reviews awaiting completion`,
      icon: <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      bgIcon: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Finalized Appraisals",
      value: completedAppraisals.toString(),
      subtext: "Calibrated with final grade & increments",
      icon: <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      bgIcon:
        "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400",
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
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
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
