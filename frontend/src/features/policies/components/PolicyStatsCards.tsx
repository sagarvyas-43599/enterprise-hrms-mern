"use client";

import React from "react";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { Policy } from "../types/policy.types";

interface PolicyStatsCardsProps {
  policies?: Policy[];
  myAcknowledgments?: any[];
  isLoading?: boolean;
}

export const PolicyStatsCards: React.FC<PolicyStatsCardsProps> = ({
  policies = [],
  myAcknowledgments = [],
  isLoading = false,
}) => {
  const total = policies.length;
  const published = policies.filter((p) => p.status === "PUBLISHED").length;
  const mandatoryCount = policies.filter((p) => p.isMandatory && p.status === "PUBLISHED").length;
  
  // Pending acknowledgment for current user
  const signedIds = new Set(
    myAcknowledgments.map((a) => (typeof a.policyId === "object" ? a.policyId?._id : a.policyId))
  );
  const pendingSignatures = policies.filter(
    (p) => p.status === "PUBLISHED" && !p.hasAcknowledged && !signedIds.has(p._id)
  ).length;

  // Compliance percentage of published policies signed by user
  const complianceRate =
    published > 0
      ? Math.round(((published - pendingSignatures) / published) * 100)
      : 100;

  const cards = [
    {
      label: "Total Policies Tracked",
      value: total.toString(),
      subtext: `${published} published, ${total - published} in review/draft`,
      icon: <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      bgIcon: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Active & Enforced",
      value: published.toString(),
      subtext: `${mandatoryCount} mandatory compliance standards`,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bgIcon: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Pending My Signature",
      value: pendingSignatures.toString(),
      subtext:
        pendingSignatures > 0
          ? "Immediate electronic acknowledgment required"
          : "All active company policies acknowledged",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      bgIcon: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Corporate Compliance Health",
      value: `${complianceRate}%`,
      subtext: "Personal adherence to mandatory policies",
      icon: <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      bgIcon: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400",
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
