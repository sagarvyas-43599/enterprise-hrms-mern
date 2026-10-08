import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { Clock, ShieldCheck } from "lucide-react";
import { useRegularizeAttendanceMutation } from "@/redux/services/attendanceApi";
import { AttendanceRecord, AttendanceStatus } from "../types/attendance.types";

const regularizeSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  date: z.string().min(1, "Date is required"),
  clockIn: z.string().min(1, "Clock-in time is required"),
  clockOut: z.string().optional(),
  status: z.enum(["PRESENT", "ABSENT", "HALF_DAY", "LATE", "ON_LEAVE", "HOLIDAY"]).optional(),
  remarks: z.string().min(1, "Reason/Remarks are required"),
});

export type RegularizeFormData = z.infer<typeof regularizeSchema>;

interface RegularizeAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
}

export const RegularizeAttendanceModal: React.FC<RegularizeAttendanceModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  const [regularizeAttendance, { isLoading }] = useRegularizeAttendanceMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<RegularizeFormData>({
    resolver: zodResolver(regularizeSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (record) {
        // Edit mode
        const empId = typeof record.employeeId === 'object' ? record.employeeId._id : record.employeeId;
        setValue("employeeId", empId);
        setValue("date", record.date);
        
        // Format dates for datetime-local input
        if (record.clockIn) {
          const inDate = new Date(record.clockIn);
          inDate.setMinutes(inDate.getMinutes() - inDate.getTimezoneOffset());
          setValue("clockIn", inDate.toISOString().slice(0, 16));
        }
        if (record.clockOut) {
          const outDate = new Date(record.clockOut);
          outDate.setMinutes(outDate.getMinutes() - outDate.getTimezoneOffset());
          setValue("clockOut", outDate.toISOString().slice(0, 16));
        }
        setValue("status", record.status);
        setValue("remarks", record.remarks || "");
      } else {
        // Create mode - wait, right now this component handles editing via record!
        reset();
      }
    }
  }, [isOpen, record, reset, setValue]);

  const onSubmit = async (data: RegularizeFormData) => {
    try {
      // Ensure clockOut is a valid datetime string if provided
      let finalClockOut: string | undefined = data.clockOut;
      if (typeof finalClockOut === 'string' && finalClockOut.trim() === '') {
         finalClockOut = undefined;
      } else if (typeof finalClockOut === 'string') {
         finalClockOut = new Date(finalClockOut).toISOString();
      }

      const payload = {
        employeeId: data.employeeId,
        date: data.date,
        clockIn: new Date(data.clockIn).toISOString(),
        clockOut: finalClockOut,
        status: data.status,
        remarks: data.remarks,
      };

      await regularizeAttendance(payload).unwrap();
      toast.success("Attendance regularized successfully");
      onClose();
    } catch (error: any) {
      console.error("Regularize failed:", error);
      toast.error(error?.data?.message || "Failed to regularize attendance");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Regularize Attendance"
      description="Manually edit or add a punch-in/out record for an employee."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        
        {record && typeof record.employeeId === 'object' ? (
          <div className="w-full space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Employee
            </label>
            <div className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm py-2.5 px-3 text-left shadow-sm">
              {record.employeeId.firstName} {record.employeeId.lastName} ({record.employeeId.empId})
            </div>
            <input type="hidden" {...register("employeeId")} />
          </div>
        ) : (
          <Input
            label="Employee ID (ObjectId)"
            placeholder="65e..."
            required
            {...register("employeeId")}
            error={errors.employeeId?.message}
            disabled={!!record}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            required
            {...register("date")}
            error={errors.date?.message}
            disabled={!!record}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Status
            </label>
            <select
              {...register("status")}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
            >
              <option className="bg-white dark:bg-slate-900" value="PRESENT">PRESENT</option>
              <option className="bg-white dark:bg-slate-900" value="HALF_DAY">HALF DAY</option>
              <option className="bg-white dark:bg-slate-900" value="LATE">LATE</option>
              <option className="bg-white dark:bg-slate-900" value="ABSENT">ABSENT</option>
              <option className="bg-white dark:bg-slate-900" value="ON_LEAVE">ON LEAVE</option>
              <option className="bg-white dark:bg-slate-900" value="HOLIDAY">HOLIDAY</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Clock In Time"
            type="datetime-local"
            required
            {...register("clockIn")}
            error={errors.clockIn?.message}
          />
          <Input
            label="Clock Out Time"
            type="datetime-local"
            {...register("clockOut")}
            error={errors.clockOut?.message}
          />
        </div>

        <Input
          label="Reason for Regularization"
          placeholder="e.g. Forgot to clock in, system issue..."
          required
          {...register("remarks")}
          error={errors.remarks?.message}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          >
            {isLoading ? "Saving..." : "Regularize Record"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
