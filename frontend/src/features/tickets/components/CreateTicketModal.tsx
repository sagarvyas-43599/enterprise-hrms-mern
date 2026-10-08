"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LifeBuoy, CheckCircle, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  createTicketSchema,
  CreateTicketFormData,
} from "@/validations/ticket.schema";
import { useCreateTicketMutation } from "@/redux/services/ticketApi";
import { TicketCategory, TicketPriority } from "../types/ticket.types";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: "IT_SUPPORT", label: "IT Hardware, Software & Access Support" },
  { value: "PAYROLL_QUERY", label: "Payroll, Salary Slip & Reimbursement Query" },
  { value: "HR_POLICY", label: "HR Policies, Benefits & Leaves Consultation" },
  { value: "FACILITIES_ADMIN", label: "Facilities, Desk Space & Office Admin" },
  { value: "GENERAL", label: "General Inquiry / Other" },
];

const PRIORITIES: { value: TicketPriority; label: string }[] = [
  { value: "LOW", label: "Low Priority (General question)" },
  { value: "MEDIUM", label: "Medium Priority (Normal SLA)" },
  { value: "HIGH", label: "High Priority (Work affected)" },
  { value: "URGENT", label: "Urgent Priority (Business blocker)" },
];

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [createTicket, { isLoading: isSubmitting }] = useCreateTicketMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateTicketFormData>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      category: "" as any,
      priority: "" as any,
      subject: "",
      description: "",
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: CreateTicketFormData) => {
    try {
      const res = await createTicket({
        category: data.category,
        priority: data.priority,
        subject: data.subject.trim(),
        description: data.description.trim(),
      }).unwrap();

      toast.success(
        res.message || "Support ticket submitted successfully! SLA initiated."
      );
      handleClose();
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
        const msg =
          err?.data?.message || "Failed to submit ticket. Please check input fields.";
        toast.error(msg);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Raise Support Helpdesk Ticket"
      description="Submit your request to corporate IT, HR, or Facilities support for rapid resolution"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Category & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Support Category <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("category")}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="" disabled>Select a category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category?.message && (
              <p className="text-[11px] text-rose-500 mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Urgency / Priority Level <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("priority")}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="" disabled>Select a priority level...</option>
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            {errors.priority?.message && (
              <p className="text-[11px] text-rose-500 mt-1">
                {errors.priority.message}
              </p>
            )}
          </div>
        </div>

        {/* Subject */}
        <Input
          label="Ticket Subject"
          placeholder="Brief summary of the issue (e.g. VPN connection failing on corporate laptop)"
          required
          {...register("subject")}
          error={errors.subject?.message}
        />

        {/* Description Textarea */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Detailed Issue Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Please describe what happened, steps to reproduce, error codes, and how it impacts your work..."
            {...register("description")}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
          {errors.description?.message && (
            <p className="text-[11px] text-rose-500 mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* SLA Notice */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300">
          <span className="font-semibold text-blue-900 dark:text-blue-300 block mb-0.5">
            Service Level Agreement (SLA):
          </span>
          Your ticket will be assigned a unique tracking ID and routed to the
          responsible department queue. High & Urgent tickets receive response
          within 2 hours.
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<CheckCircle className="w-4 h-4" />}
          >
            Submit Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
};
