"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, User, Sliders } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  updateTicketStatusSchema,
  UpdateTicketStatusFormData,
} from "@/validations/ticket.schema";
import { useUpdateTicketStatusMutation } from "@/redux/services/ticketApi";
import { useGetEmployeesQuery } from "@/redux/services/employeeApi";
import { Ticket, TicketStatus } from "../types/ticket.types";

interface UpdateTicketStatusModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateTicketStatusModal: React.FC<UpdateTicketStatusModalProps> = ({
  ticket,
  isOpen,
  onClose,
}) => {
  const [updateStatus, { isLoading: isSubmitting }] =
    useUpdateTicketStatusMutation();

  const { data: employeesData } = useGetEmployeesQuery(
    { limit: 100 },
    { skip: !isOpen }
  );
  const employees = employeesData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UpdateTicketStatusFormData>({
    resolver: zodResolver(updateTicketStatusSchema),
    defaultValues: {
      status: "IN_PROGRESS",
      assignedTo: "",
      resolutionNotes: "",
    },
  });

  useEffect(() => {
    if (ticket && isOpen) {
      const assigneeId =
        typeof ticket.assignedTo === "object" && ticket.assignedTo
          ? ticket.assignedTo._id
          : ticket.assignedTo || "";

      reset({
        status: ticket.status || "IN_PROGRESS",
        assignedTo: assigneeId,
        resolutionNotes: ticket.resolutionNotes || "",
      });
    }
  }, [ticket, isOpen, reset]);

  if (!ticket) return null;

  const onSubmit = async (data: UpdateTicketStatusFormData) => {
    try {
      const res = await updateStatus({
        id: ticket._id,
        body: {
          status: data.status,
          assignedTo: data.assignedTo || null,
          resolutionNotes: data.resolutionNotes?.trim() || undefined,
        },
      }).unwrap();

      toast.success(res.message || "Ticket status and assignment updated successfully!");
      onClose();
    } catch (err: any) {
      const apiErrors = err?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        apiErrors.forEach((issue: any) => {
          if (issue.field) {
            setError(issue.field as any, {
              type: "server",
              message: issue.message,
            });
          }
        });
        toast.error("Please correct the highlighted validation errors.");
      } else {
        const msg = err?.data?.message || "Failed to update ticket status.";
        toast.error(msg);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Ticket Status & Assignment"
      description={`Update status lifecycle and assign support agent for ${ticket.ticketId}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Ticket Header Pill */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white">
              {ticket.subject}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
              {ticket.ticketId}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Category: {ticket.category.replace(/_/g, " ")} • Priority:{" "}
            {ticket.priority}
          </p>
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Support Status <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("status")}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="OPEN">OPEN (Awaiting Action)</option>
            <option value="IN_PROGRESS">IN PROGRESS (Active Investigation)</option>
            <option value="RESOLVED">RESOLVED (Solution Provided)</option>
            <option value="CLOSED">CLOSED (Concluded)</option>
          </select>
          {errors.status?.message && (
            <p className="text-[11px] text-rose-500 mt-1">
              {errors.status.message}
            </p>
          )}
        </div>

        {/* Assign To Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Assign Support Agent
          </label>
          <select
            {...register("assignedTo")}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">Unassigned (Queue)</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.firstName} {emp.lastName} ({emp.empId}) — {emp.department || "Staff"}
              </option>
            ))}
          </select>
          {errors.assignedTo?.message && (
            <p className="text-[11px] text-rose-500 mt-1">
              {errors.assignedTo.message}
            </p>
          )}
        </div>

        {/* Resolution Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Resolution Remarks / Conclusion Notes
          </label>
          <textarea
            rows={3}
            placeholder="Document the resolution steps, fix applied, or communication with user..."
            {...register("resolutionNotes")}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
          {errors.resolutionNotes?.message && (
            <p className="text-[11px] text-rose-500 mt-1">
              {errors.resolutionNotes.message}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Update Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
};
