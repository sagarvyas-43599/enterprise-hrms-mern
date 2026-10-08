"use client";

import React from "react";
import {
  Award,
  Star,
  UserCheck,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
} from "lucide-react";
import {
  Appraisal,
  AppraisalStatus,
  PerformanceRating,
} from "../types/performance.types";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/SkeletonLoader";
import { Pagination } from "@/components/ui/Pagination";
import { useAppSelector } from "@/redux/hooks";

interface AppraisalTableProps {
  appraisals?: Appraisal[];
  isLoading: boolean;
  onSelfReview?: (appraisal: Appraisal) => void;
  onManagerReview?: (appraisal: Appraisal) => void;
  onViewDetails?: (appraisal: Appraisal) => void;
  // Pagination
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const AppraisalTable: React.FC<AppraisalTableProps> = ({
  appraisals = [],
  isLoading,
  onSelfReview,
  onManagerReview,
  onViewDetails,
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onLimitChange,
}) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const canManagerReview =
    currentUser?.role === "SUPER_ADMIN" ||
    currentUser?.role === "HR_ADMIN" ||
    currentUser?.role === "MANAGER";

  const getStatusBadge = (status: AppraisalStatus) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="success">COMPLETED</Badge>;
      case "MANAGER_REVIEWED":
        return <Badge variant="purple">MANAGER REVIEWED</Badge>;
      case "SELF_REVIEW_SUBMITTED":
        return <Badge variant="info">SELF REVIEW SUBMITTED</Badge>;
      case "DRAFT":
      default:
        return <Badge variant="warning">DRAFT</Badge>;
    }
  };

  const getRatingBadge = (rating?: PerformanceRating | null) => {
    if (!rating) {
      return (
        <span className="text-[11px] text-slate-400 italic">Not Calibrated</span>
      );
    }

    switch (rating) {
      case "OUTSTANDING":
        return <Badge variant="purple">OUTSTANDING</Badge>;
      case "EXCEEDS_EXPECTATIONS":
        return <Badge variant="info">EXCEEDS EXP.</Badge>;
      case "MEETS_EXPECTATIONS":
        return <Badge variant="success">MEETS EXP.</Badge>;
      case "NEEDS_IMPROVEMENT":
        return <Badge variant="warning">NEEDS IMPROVEMENT</Badge>;
      case "UNSATISFACTORY":
        return <Badge variant="danger">UNSATISFACTORY</Badge>;
      default:
        return <Badge variant="neutral">{rating}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  }

  if (appraisals.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center mb-4">
          <Award className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          No Appraisal Cycles Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          No appraisal records initiated for this review cycle. Click Initiate
          Cycle to launch performance appraisals for team members.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">
              <th className="py-3.5 px-4">Employee Member</th>
              <th className="py-3.5 px-4">Review Cycle</th>
              <th className="py-3.5 px-4">Self Rating</th>
              <th className="py-3.5 px-4">Manager Rating</th>
              <th className="py-3.5 px-4">Final Grade</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {appraisals.map((appraisal) => {
              const emp =
                typeof appraisal.employeeId === "object" && appraisal.employeeId
                  ? appraisal.employeeId
                  : null;
              const empName = emp
                ? `${emp.firstName} ${emp.lastName}`
                : "Staff Member";
              const empCode = emp?.empId || "EMP";

              const isSelf =
                currentUser?.id === (typeof appraisal.employeeId === "object" ? appraisal.employeeId?._id : appraisal.employeeId);

              const canDoSelfReview =
                isSelf && appraisal.status === "DRAFT";

              const canDoManagerReview =
                canManagerReview &&
                (appraisal.status === "SELF_REVIEW_SUBMITTED" ||
                  appraisal.status === "DRAFT");

              return (
                <tr
                  key={appraisal._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Employee Details */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center shrink-0 uppercase text-xs">
                        {empName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {empName}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {empCode}
                          </span>
                        </div>
                        {emp?.department && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {emp.department}{" "}
                            {emp.designation ? `• ${emp.designation}` : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Review Cycle */}
                  <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                    <span>{appraisal.cycleName}</span>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Year: {appraisal.year}
                    </p>
                  </td>

                  {/* Self Rating */}
                  <td className="py-3.5 px-4">
                    {appraisal.selfRating ? (
                      <div className="flex items-center gap-1 font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{appraisal.selfRating} / 5</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Manager Rating */}
                  <td className="py-3.5 px-4">
                    {appraisal.managerRating ? (
                      <div className="flex items-center gap-1 font-bold text-blue-500">
                        <Star className="w-3.5 h-3.5 fill-blue-400" />
                        <span>{appraisal.managerRating} / 5</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Final Calibrated Grade */}
                  <td className="py-3.5 px-4">
                    {getRatingBadge(appraisal.finalRating)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(appraisal.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Self Review Action */}
                      {canDoSelfReview && (
                        <button
                          type="button"
                          onClick={() => onSelfReview?.(appraisal)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                          title="Submit your self review"
                        >
                          Self Review
                        </button>
                      )}

                      {/* Manager Review Action */}
                      {canDoManagerReview && (
                        <button
                          type="button"
                          onClick={() => onManagerReview?.(appraisal)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-100 transition-colors"
                          title="Complete manager evaluation"
                        >
                          Evaluate
                        </button>
                      )}

                      {/* View Details Action */}
                      <button
                        type="button"
                        onClick={() => onViewDetails?.(appraisal)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View complete appraisal breakdown"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {totalItems > 0 && onPageChange && onLimitChange && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
};
