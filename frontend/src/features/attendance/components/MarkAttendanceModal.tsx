"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MapPin, Navigation, Clock } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  attendanceCheckInSchema,
  AttendanceCheckInFormData,
} from "@/validations/attendance.schema";
import { useClockInMutation } from "@/redux/services/attendanceApi";
import { parseAndSetApiErrors } from "@/lib/errorParser";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeModal } from "@/redux/slices/uiSlice";

export const MarkAttendanceModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeModal } = useAppSelector((state) => state.ui);
  const isOpen = activeModal === "CHECK_IN_ATTENDANCE";

  const [clockIn, { isLoading: isSubmitting }] = useClockInMutation();
  const [isLocating, setIsLocating] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<AttendanceCheckInFormData>({
    resolver: zodResolver(attendanceCheckInSchema),
    defaultValues: {
      employeeId: "",
      remarks: "",
      latitude: undefined,
      longitude: undefined,
      address: "",
    },
  });

  const handleClose = () => {
    reset();
    dispatch(closeModal());
  };

  // Get current device GPS coordinates
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setValue("latitude", Number(latitude.toFixed(6)));
        setValue("longitude", Number(longitude.toFixed(6)));
        setValue("address", "HQ Office Campus - Detected via GPS");
        setIsLocating(false);
        toast.success("GPS Coordinates Acquired Successfully");
      },
      (error) => {
        setIsLocating(false);
        toast.error(`Unable to get location: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const onSubmit = async (data: AttendanceCheckInFormData) => {
    try {
      const payload = {
        employeeId: data.employeeId || undefined,
        remarks: data.remarks || undefined,
        location:
          data.latitude !== undefined && data.longitude !== undefined
            ? {
                latitude: data.latitude,
                longitude: data.longitude,
                address: data.address || "Corporate Office",
              }
            : undefined,
      };

      const response = await clockIn(payload).unwrap();
      toast.success(response.message || "Clock In marked successfully!");
      handleClose();
    } catch (err: unknown) {
      const parsedMsg = parseAndSetApiErrors(
        err,
        setError,
        "Failed to mark clock in. Please try again."
      );
      toast.error(parsedMsg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Punch Clock-In"
      description="Record your work shift commencement with automatic timestamp and optional GPS verification."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Root form error banner if any */}
        {errors.root && (
          <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
            {errors.root.message}
          </div>
        )}

        {/* GPS Location Bar */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Geofencing & Location
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Attach coordinates to verify office presence
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDetectLocation}
            isLoading={isLocating}
            leftIcon={<Navigation className="w-3.5 h-3.5" />}
          >
            Detect GPS
          </Button>
        </div>

        {/* Lat/Long display if present */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Latitude"
            type="number"
            step="any"
            placeholder="e.g. 28.6139"
            {...register("latitude", { valueAsNumber: true })}
            error={errors.latitude?.message}
          />
          <Input
            label="Longitude"
            type="number"
            step="any"
            placeholder="e.g. 77.2090"
            {...register("longitude", { valueAsNumber: true })}
            error={errors.longitude?.message}
          />
        </div>

        {/* Address / Location Name */}
        <Input
          label="Location Tag"
          placeholder="e.g. Headquarters / Remote WFH"
          {...register("address")}
          error={errors.address?.message}
        />

        {/* Work Remarks */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Shift Remarks / Work Note (Optional)
          </label>
          <textarea
            {...register("remarks")}
            rows={2}
            placeholder="e.g. Starting sprint feature work from Bangalore Tech Park..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          {errors.remarks && (
            <p className="text-xs text-rose-500">{errors.remarks.message}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-150 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<Clock className="w-4 h-4" />}
          >
            Confirm Clock-In
          </Button>
        </div>
      </form>
    </Modal>
  );
};
