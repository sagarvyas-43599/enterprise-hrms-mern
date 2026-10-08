"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Building,
  Briefcase,
  Phone,
  Users,
  ShieldCheck,
  Check,
  Camera,
  ArrowLeft,
  Loader2,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  updateEmployeeSchema,
  UpdateEmployeeFormData,
} from "@/validations/employee.schema";
import {
  useUpdateEmployeeMutation,
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
} from "@/redux/services/employeeApi";

const STANDARD_DEPARTMENTS = [
  "Executive Leadership",
  "Engineering & Technology",
  "Human Resources",
  "Finance & Accounts",
  "Operations & Facilities",
  "Product & Design",
  "Marketing & Sales",
];

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;

  const [profileImageBase64, setProfileImageBase64] = useState<string>("");
  const [updateEmployee, { isLoading: isSubmitting }] = useUpdateEmployeeMutation();

  const { data: employeeData, isLoading: isEmployeeLoading } = useGetEmployeeByIdQuery(employeeId, {
    skip: !employeeId,
  });
  const employee = employeeData?.data;

  // Fetch managers for reporting manager dropdown
  const { data: employeesData } = useGetEmployeesQuery({ limit: 100, includeSelf: "true" } as any);
  const managers = (employeesData?.data || []).filter(
    (emp) =>
      emp._id !== employee?._id &&
      (emp.userId?.role === "MANAGER" ||
        emp.userId?.role === "HR_ADMIN" ||
        emp.userId?.role === "SUPER_ADMIN")
  );

  const availableDepartments = React.useMemo(() => {
    if (employee?.department && !STANDARD_DEPARTMENTS.includes(employee.department)) {
      return [employee.department, ...STANDARD_DEPARTMENTS];
    }
    return STANDARD_DEPARTMENTS;
  }, [employee?.department]);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<UpdateEmployeeFormData>({
    resolver: zodResolver(updateEmployeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      department: "",
      designation: "",
      phone: "",
      reportingManagerId: "",
      isActive: true,
      profileImage: "",
    },
  });

  useEffect(() => {
    if (employee) {
      const reportingMgrId =
        typeof employee.reportingManagerId === "object" && employee.reportingManagerId
          ? (employee.reportingManagerId as any)._id
          : employee.reportingManagerId || "";

      reset({
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        department: employee.department || "",
        designation: employee.designation || "",
        phone: employee.phone || "",
        reportingManagerId: reportingMgrId,
        isActive: employee.userId?.isActive !== false,
        profileImage: employee.profileImage || "",
      });
      if (employee.profileImage) {
        setProfileImageBase64(employee.profileImage);
      }
    }
  }, [employee, reset]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error("Image must be smaller than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfileImageBase64(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: UpdateEmployeeFormData) => {
    if (!employee?._id) return;

    try {
      const payload = {
        firstName: data.firstName?.trim(),
        lastName: data.lastName?.trim(),
        department: data.department?.trim(),
        designation: data.designation?.trim(),
        phone: data.phone?.trim() ? data.phone.trim() : "",
        reportingManagerId: data.reportingManagerId || null,
        isActive: data.isActive,
        profileImage: profileImageBase64 || undefined,
      };

      await updateEmployee({
        id: employee._id,
        body: payload,
      }).unwrap();

      toast.success(
        `Profile for ${data.firstName} ${data.lastName} updated successfully.`
      );
      router.push("/employees");
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
        toast.error(apiErrors.map((i: any) => i.message).join(", "));
      } else {
        const errorMsg =
          err?.data?.message ||
          "Failed to update employee profile. Please check inputs.";
        toast.error(errorMsg);
      }
    }
  };

  if (isEmployeeLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm">Loading employee profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 rounded-xl"
            onClick={() => router.push("/employees")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Edit Employee
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Update personnel information and assignments for {employee?.empId}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm">
            {employee?.empId}
          </span>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {employee?.userId?.email || "No Email"}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 space-y-8">
          
          {/* Profile Photo Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                {profileImageBase64 ? (
                  <img src={profileImageBase64} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-2xl cursor-pointer transition-opacity">
                <span className="text-xs font-semibold">Upload Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Profile Photo</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Upload a professional photo. Recommended size is 256x256px. Max file size is 2MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Personal Details
              </h3>
              <Input
                label="First Name"
                placeholder="First Name"
                required
                {...register("firstName")}
                error={errors.firstName?.message}
              />
              <Input
                label="Last Name"
                placeholder="Last Name"
                required
                {...register("lastName")}
                error={errors.lastName?.message}
              />
              <Input
                label="Phone Number"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '');
                }}
                placeholder="Phone Number"
                leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                {...register("phone")}
                error={errors.phone?.message}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Work & Role Assignment
              </h3>
              
              <div className="w-full space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Department <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <select
                    {...register("department")}
                    className={`block w-full rounded-lg border text-sm transition-colors py-2.5 pl-9 pr-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                      errors.department
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                        : "border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                  >
                    <option value="">Select Department</option>
                    {availableDepartments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                {errors.department && <p className="text-xs text-rose-500">{errors.department.message}</p>}
              </div>

              <Input
                label="Designation"
                placeholder="Designation"
                leftIcon={<Briefcase className="w-4 h-4 text-slate-400" />}
                required
                {...register("designation")}
                error={errors.designation?.message}
              />

              <div className="w-full space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Reporting Manager
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <select
                    {...register("reportingManagerId")}
                    className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Select Reporting Manager</option>
                    {managers.map((mgr) => (
                      <option key={mgr._id} value={mgr._id}>
                        {mgr.firstName} {mgr.lastName} ({mgr.empId} — {mgr.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
             {/* Status Toggle */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Account Status
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Active employees can log in and clock attendance.
                  </p>
                </div>
              </div>
              <label className="flex items-center cursor-pointer gap-2">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Active Status
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 dark:border-rose-900/50 dark:hover:bg-rose-950/30 dark:text-rose-500"
              onClick={() => router.push("/employees")}
              disabled={isSubmitting}
              leftIcon={<X className="w-4 h-4" />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
              isLoading={isSubmitting}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Update
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
