"use client";

import React from "react";
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useGetPolicyComplianceQuery } from "@/redux/services/policyApi";
import { Policy } from "../types/policy.types";

interface ComplianceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy | null;
}

export const ComplianceReportModal: React.FC<ComplianceReportModalProps> = ({
  isOpen,
  onClose,
  policy,
}) => {
  const policyId = policy?._id || "";
  const { data, isLoading } = useGetPolicyComplianceQuery(policyId, {
    skip: !isOpen || !policyId,
  });

  if (!policy) return null;

  const metrics = data?.data?.metrics || {
    totalActiveEmployees: 0,
    acknowledgedCount: 0,
    pendingCount: 0,
    complianceRatePercent: 0,
  };

  const rate = metrics.complianceRatePercent;

  let statusBadge = {
    label: "High Compliance",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  };
  if (rate < 60) {
    statusBadge = {
      label: "Critical Attention Required",
      color: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    };
  } else if (rate < 85) {
    statusBadge = {
      label: "Adoption In Progress",
      color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    };
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Organizational Compliance Audit"
      description={`Tracking corporate adherence for: ${policy.title}`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* KPI Banner */}
        <div className="p-5 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-slate-800/80 dark:via-slate-900 dark:to-indigo-950/30 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Overall Compliance Rate
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {isLoading ? "--%" : `${rate}%`}
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.color}`}
            >
              {statusBadge.label}
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="mt-4">
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-700 rounded-full ${
                  rate >= 80
                    ? "bg-emerald-500"
                    : rate >= 60
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
              <span>0% Signed</span>
              <span>100% Full Corporate Adherence</span>
            </div>
          </div>
        </div>

        {/* 3 Metric Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
            <Users className="w-4 h-4 mx-auto text-blue-500 mb-1" />
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {isLoading ? "-" : metrics.totalActiveEmployees}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Active Staff
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
            <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {isLoading ? "-" : metrics.acknowledgedCount}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Acknowledged
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
            <Clock className="w-4 h-4 mx-auto text-amber-500 mb-1" />
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {isLoading ? "-" : metrics.pendingCount}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Pending Sign
            </p>
          </div>
        </div>

        {/* Audit Compliance Notes */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
          <span>
            Compliance signatures are cryptographically tied with employee timestamps and remote IP logging to adhere to ISO 27001, SOC 2, and labor regulatory audits.
          </span>
        </div>

        {/* Modal Close */}
        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            Close Report
          </Button>
        </div>
      </div>
    </Modal>
  );
};
