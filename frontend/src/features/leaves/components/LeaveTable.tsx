"use client";

import React, { useState } from "react";
import {
  Calendar,
  Check,
  X,
  Ban,
  Clock,
  MessageSquare,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { LeaveRecord } from "../types/leave.types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import {
  useReviewLeaveMutation,
  useCancelLeaveMutation,
} from "@/redux/services/leaveApi";
import { TableSkeleton } from "@/components/ui/SkeletonLoader";
import { useAppSelector } from "@/redux/hooks";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Pagination } from "@/components/ui/Pagination";

interface LeaveTableProps {
  leaves?: LeaveRecord[];
  isLoading: boolean;
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const LeaveTable: React.FC<LeaveTableProps> = ({
  leaves = [],
  isLoading,
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onLimitChange,
}) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [reviewLeave, { isLoading: isReviewing }] = useReviewLeaveMutation();
  const [cancelLeave, { isLoading: isCanceling }] = useCancelLeaveMutation();
  const [actingId, setActingId] = useState<string | null>(null);
  const [actingAction, setActingAction] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [leaveToCancel, setLeaveToCancel] = useState<LeaveRecord | null>(null);

  const canReview =
    currentUser?.role === "SUPER_ADMIN" ||
    currentUser?.role === "HR_ADMIN" ||
    currentUser?.role === "MANAGER";

  const handleReview = async (
    id: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      setActingId(id);
      setActingAction(status);
      await reviewLeave({
        id,
        body: {
          status,
          remarks: `Processed via Corporate Dashboard as ${status}`,
        },
      }).unwrap();
      toast.success(`Leave request successfully marked as ${status}`);
    } catch {
      toast.error("Failed to process leave review. Please try again.");
    } finally {
      setActingId(null);
      setActingAction(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!leaveToCancel) return;

    try {
      await cancelLeave(leaveToCancel._id).unwrap();
      toast.success(
        "Leave application cancelled successfully. Balance restored."
      );
      setLeaveToCancel(null);
    } catch {
      toast.error("Failed to cancel leave application. Please try again.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge variant="success">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="danger">Rejected</Badge>;
      case "PENDING":
        return <Badge variant="warning">Pending Review</Badge>;
      case "CANCELLED":
      default:
        return <Badge variant="neutral">Cancelled</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <TableSkeleton rows={6} cols={6} />
      </div>
    );
  }

  if (leaves.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-4">
          <Calendar className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          No Leave Records Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          No leave requests recorded for this selected criteria. Click Submit
          Leave Application to request time-off.
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
              <th className="py-3.5 px-4">Employee</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Requested Period</th>
              <th className="py-3.5 px-4">Duration</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Reason & Approver Notes</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {leaves.map((leave) => {
              const employeeDisplay =
                typeof leave.employeeId === "object" && leave.employeeId
                  ? `${leave.employeeId.firstName || ""} ${
                      leave.employeeId.lastName || ""
                    }`.trim() || leave.employeeId.empId
                  : "Self Request";

              const empCode =
                typeof leave.employeeId === "object" && leave.employeeId
                  ? leave.employeeId.empId
                  : "";

              const isPending = leave.approvalStatus === "PENDING";
              const isActing = actingId === leave._id;

              return (
                <tr
                  key={leave._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Staff Info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      <span>{employeeDisplay}</span>
                    </div>
                    {empCode && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {empCode}
                      </span>
                    )}
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200">
                    {leave.leaveType}
                  </td>

                  {/* Dates */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {formatDate(leave.startDate)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      to {formatDate(leave.endDate)}
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                    {leave.daysCount}{" "}
                    {leave.daysCount === 1 ? "day" : "days"}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(leave.approvalStatus)}
                  </td>

                  {/* Reason & Notes */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-slate-700 dark:text-slate-300 truncate">
                      {leave.reason}
                    </p>
                    {leave.approvalRemarks && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 italic mt-0.5">
                        <MessageSquare className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {leave.approvalRemarks}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    {isPending ? (
                      <div className="flex items-center justify-end gap-1.5">
                        {canReview && (
                          <>
                            {/* Approve Button */}
                            <Button
                              size="sm"
                              variant="primary"
                              className="bg-emerald-600 hover:bg-emerald-700 px-2 py-1 text-xs"
                              onClick={() => handleReview(leave._id, "APPROVED")}
                              isLoading={isActing && actingAction === "APPROVED" && isReviewing}
                              title="Approve leave"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </Button>

                            {/* Reject Button */}
                            <Button
                              size="sm"
                              variant="danger"
                              className="px-2 py-1 text-xs"
                              onClick={() => handleReview(leave._id, "REJECTED")}
                              isLoading={isActing && actingAction === "REJECTED" && isReviewing}
                              title="Reject leave"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}

                        {/* Cancel Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="px-2 py-1 text-xs text-slate-400 hover:text-rose-500"
                          onClick={() => setLeaveToCancel(leave)}
                          title="Cancel application"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">
                        Concluded
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && totalItems > 0 && onPageChange && onLimitChange && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      )}

      {/* Cancel Confirmation Popup Modal - Same styling as Create Employee Modal */}
      <ConfirmModal
        isOpen={!!leaveToCancel}
        onClose={() => setLeaveToCancel(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Leave Application"
        description="Are you sure you want to cancel this leave application? Quota days will be restored to your account."
        itemName={leaveToCancel ? `${leaveToCancel.leaveType} Leave` : ""}
        itemSubtext={
          leaveToCancel
            ? `${leaveToCancel.daysCount} ${
                leaveToCancel.daysCount === 1 ? "day" : "days"
              }`
            : ""
        }
        confirmText="Cancel Application"
        cancelText="Keep Leave"
        variant="warning"
        isLoading={isCanceling}
      />
    </div>
  );
};
