"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  FileText,
  Eye,
  Edit2,
  Trash2,
  Send,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Tag,
  Shield,
  Layers,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  usePublishPolicyMutation,
  useDeletePolicyMutation,
} from "@/redux/services/policyApi";
import { Policy, POLICY_CATEGORY_METADATA } from "../types/policy.types";
import { Pagination } from "@/components/ui/Pagination";

interface PolicyTableProps {
  policies: Policy[];
  isLoading: boolean;
  onView: (policy: Policy) => void;
  onEdit?: (policy: Policy) => void;
  onViewCompliance?: (policy: Policy) => void;
  signedPolicyIds: Set<string>;
  isHrOrAdmin: boolean;
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const PolicyTable: React.FC<PolicyTableProps> = ({
  policies,
  isLoading,
  onView,
  onEdit,
  onViewCompliance,
  signedPolicyIds,
  isHrOrAdmin,
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onLimitChange,
}) => {
  const [publishPolicy, { isLoading: isPublishing }] = usePublishPolicyMutation();
  const [deletePolicy, { isLoading: isDeleting }] = useDeletePolicyMutation();

  const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);
  const [policyToPublish, setPolicyToPublish] = useState<Policy | null>(null);

  const handleConfirmPublish = async () => {
    if (!policyToPublish) return;
    try {
      const res = await publishPolicy(policyToPublish._id).unwrap();
      toast.success(res.message || "Policy published company-wide!");
      setPolicyToPublish(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to publish policy.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!policyToDelete) return;
    try {
      const res = await deletePolicy(policyToDelete._id).unwrap();
      toast.success(res.message || "Policy archived successfully!");
      setPolicyToDelete(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete policy.");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm p-8">
        <div className="space-y-4 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  if (policies.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          No Corporate Policies Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          No policies match your search filters. Adjust criteria or draft a new company standard.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Policy Standard</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Version & Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">My Compliance</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {policies.map((policy) => {
                const categoryMeta =
                  POLICY_CATEGORY_METADATA[policy.category] ||
                  POLICY_CATEGORY_METADATA.GENERAL;

                const hasSigned =
                  policy.hasAcknowledged || signedPolicyIds.has(policy._id);

                return (
                  <tr
                    key={policy._id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Policy Standard & Code */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors">
                              {policy.title}
                            </span>
                            {policy.isMandatory && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-wider">
                                Mandatory
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="font-mono font-medium">{policy.code}</span>
                            <span>•</span>
                            <span className="line-clamp-1 max-w-xs">{policy.description}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${categoryMeta.badgeClass}`}
                      >
                        {categoryMeta.label}
                      </span>
                    </td>

                    {/* Version & Date */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">
                        v{policy.version || "1.0"}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {policy.effectiveDate
                          ? new Date(policy.effectiveDate).toLocaleDateString()
                          : "Immediate"}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {policy.status === "PUBLISHED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Published
                        </span>
                      ) : policy.status === "DRAFT" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          <Layers className="w-3 h-3" />
                          Draft
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/10 text-slate-500 border border-slate-500/20">
                          Archived
                        </span>
                      )}
                    </td>

                    {/* My Compliance */}
                    <td className="py-3.5 px-4">
                      {policy.status !== "PUBLISHED" ? (
                        <span className="text-[11px] text-slate-400">Not in force</span>
                      ) : hasSigned ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Signed
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onView(policy)}
                          className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          Sign Required
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View / Read Terms */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onView(policy)}
                          title="Read Policy Document"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </Button>

                        {/* Compliance Report (HR/Admin) */}
                        {isHrOrAdmin && policy.status === "PUBLISHED" && onViewCompliance && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onViewCompliance(policy)}
                            title="Compliance Audit Report"
                            className="h-8 w-8 p-0"
                          >
                            <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </Button>
                        )}

                        {/* Publish (HR/Admin when DRAFT) */}
                        {isHrOrAdmin && policy.status === "DRAFT" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setPolicyToPublish(policy)}
                            title="Publish Policy Company-wide"
                            className="h-8 w-8 p-0"
                          >
                            <Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </Button>
                        )}

                        {/* Edit Policy (HR/Admin) */}
                        {isHrOrAdmin && onEdit && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit(policy)}
                            title="Edit Policy Terms"
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </Button>
                        )}

                        {/* Delete / Archive Policy (HR/Admin) */}
                        {isHrOrAdmin && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setPolicyToDelete(policy)}
                            title="Archive & Remove Policy"
                            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {onPageChange && (
            <div className="border-t border-slate-200 dark:border-slate-800">
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={onPageChange}
                onLimitChange={onLimitChange || (() => {})}
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete / Archive Confirmation Modal */}
      {policyToDelete && (
        <ConfirmModal
          isOpen={!!policyToDelete}
          onClose={() => setPolicyToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Archive Corporate Policy"
          description="Are you sure you want to archive this policy standard? It will no longer be enforced on active employee records."
          itemName={policyToDelete.title}
          itemSubtext={policyToDelete.code}
          warningNotice="Archiving will retain past historical employee signatures in compliance logs while retiring this standard from company-wide view."
          confirmText="Archive Policy"
          cancelText="Keep Active"
          variant="danger"
          isLoading={isDeleting}
        />
      )}

      {/* Publish Confirmation Modal */}
      {policyToPublish && (
        <ConfirmModal
          isOpen={!!policyToPublish}
          onClose={() => setPolicyToPublish(null)}
          onConfirm={handleConfirmPublish}
          title="Publish Policy Company-wide"
          description="Are you sure you want to officially publish this policy standard? All employees will be notified to digitally acknowledge the terms."
          itemName={policyToPublish.title}
          itemSubtext={policyToPublish.code}
          warningNotice="Once published, this policy standard becomes active and enforced across the organization."
          confirmText="Publish Company-Wide"
          cancelText="Cancel"
          variant="primary"
          isLoading={isPublishing}
        />
      )}
    </>
  );
};
