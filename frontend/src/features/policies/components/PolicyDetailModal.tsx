"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  FileText,
  Calendar,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Printer,
  AlertCircle,
  Tag,
  Clock,
  Award,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAcknowledgePolicyMutation } from "@/redux/services/policyApi";
import { Policy, POLICY_CATEGORY_METADATA } from "../types/policy.types";

interface PolicyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy | null;
  hasAcknowledged?: boolean;
  acknowledgedAt?: string | null;
}

export const PolicyDetailModal: React.FC<PolicyDetailModalProps> = ({
  isOpen,
  onClose,
  policy,
  hasAcknowledged = false,
  acknowledgedAt,
}) => {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [acknowledgePolicy, { isLoading: isSigning }] =
    useAcknowledgePolicyMutation();

  if (!policy) return null;

  const categoryMeta =
    POLICY_CATEGORY_METADATA[policy.category] || POLICY_CATEGORY_METADATA.GENERAL;

  const handleAcknowledge = async () => {
    if (!hasAgreed) {
      toast.error("Please tick the confirmation checkbox to digitally sign.");
      return;
    }

    try {
      const res = await acknowledgePolicy(policy._id).unwrap();
      toast.success(res.message || "Policy digitally acknowledged and accepted!");
      setHasAgreed(false);
      onClose();
    } catch (err: any) {
      toast.error(
        err?.data?.message || "Failed to acknowledge policy. Please try again."
      );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={policy.title}
      description={`Official Corporate Standard • Code: ${policy.code}`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Document Metadata Bar */}
        <div className="flex flex-wrap items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 font-mono text-slate-700 dark:text-slate-300 font-semibold">
            <Tag className="w-3.5 h-3.5 text-indigo-500" />
            <span>{policy.code}</span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          <span
            className={`px-2 py-0.5 rounded-full font-medium border text-[11px] ${categoryMeta.badgeClass}`}
          >
            {categoryMeta.label}
          </span>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <Layers className="w-3.5 h-3.5" />
            <span>Version {policy.version || "1.0"}</span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              Effective:{" "}
              {policy.effectiveDate
                ? new Date(policy.effectiveDate).toLocaleDateString()
                : "Immediate"}
            </span>
          </div>

          {policy.isMandatory && (
            <>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-wider">
                Mandatory
              </span>
            </>
          )}

          <div className="ml-auto print:hidden">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Terms</span>
            </button>
          </div>
        </div>

        {/* Short Executive Summary */}
        <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 mb-1">
            Executive Summary & Scope
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {policy.description}
          </p>
        </div>

        {/* Main Document Body */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Policy Terms & Compliance Obligations
          </h4>
          <div className="max-h-72 overflow-y-auto print:max-h-none print:overflow-visible print:border-none print:bg-transparent p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
            {policy.content}
          </div>
        </div>

        {/* Acknowledgment Status Section */}
        {hasAcknowledged ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  Digitally Signed & Acknowledged
                </h5>
                <p className="text-xs text-emerald-600 dark:text-emerald-400/90 mt-0.5">
                  Your electronic signature was verified and recorded in the compliance audit trail.
                  {acknowledgedAt &&
                    ` Signed on ${new Date(acknowledgedAt).toLocaleString()}.`}
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
              Verified
            </span>
          </div>
        ) : policy.status === "PUBLISHED" ? (
          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800 dark:text-amber-300">
                <p className="font-semibold">Electronic Signature Required</p>
                <p className="text-amber-700 dark:text-amber-400/90 mt-0.5">
                  As an active employee, you are legally required to review and digitally accept this policy standard.
                </p>
              </div>
            </div>

            <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasAgreed}
                onChange={(e) => setHasAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                I hereby declare that I have carefully read, understood, and agree to strictly comply with all policies, codes, and obligations set forth in this document.
              </span>
            </label>

            <div className="flex justify-end pt-1">
              <Button
                type="button"
                onClick={handleAcknowledge}
                disabled={!hasAgreed || isSigning}
                className="w-full sm:w-auto"
              >
                {isSigning ? (
                  "Recording Electronic Signature..."
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Digitally Sign & Acknowledge
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-center text-xs text-slate-500">
            This policy document is in {policy.status} status and is not currently open for employee signatures.
          </div>
        )}

        {/* Modal Close Action */}
        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800 print:hidden">
          <Button variant="ghost" onClick={onClose}>
            Close Document
          </Button>
        </div>
      </div>
    </Modal>
  );
};
