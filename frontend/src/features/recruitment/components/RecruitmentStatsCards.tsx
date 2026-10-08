"use client";

import React from "react";
import { Briefcase, Users, CalendarCheck2, Award } from "lucide-react";
import { RecruitmentMetrics } from "../types/recruitment.types";

interface RecruitmentStatsCardsProps {
  metrics?: RecruitmentMetrics;
  isLoading?: boolean;
}

export const RecruitmentStatsCards: React.FC<RecruitmentStatsCardsProps> = ({
  metrics,
  isLoading = false,
}) => {
  const cards = [
    {
      label: "Active Openings",
      value: (metrics?.activeOpenings ?? 0).toString(),
      subtext: `${metrics?.openJobRoles || 0} active job postings`,
      icon: <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      bgIcon: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Candidate Pipeline",
      value: (metrics?.totalApplicants ?? 0).toString(),
      subtext: "Total active applicants across roles",
      icon: <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      bgIcon: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Interviews Scheduled",
      value: (metrics?.interviewsScheduled ?? 0).toString(),
      subtext: "Screening & technical evaluations",
      icon: <CalendarCheck2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      bgIcon: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400",
    },
    {
      label: "Offers Extended & Hired",
      value: (metrics?.hiredCount ?? 0).toString(),
      subtext: `${metrics?.offersExtended || 0} active offers pending acceptance, ${metrics?.hiredCount || 0} hired`,
      icon: <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bgIcon: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
              {card.label}
            </span>
            <div className={`p-2.5 rounded-xl ${card.bgIcon}`}>
              {card.icon}
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            ) : (
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {card.value}
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium truncate">
              {card.subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
