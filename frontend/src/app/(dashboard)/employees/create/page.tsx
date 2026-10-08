"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  UserPlus,
  Shield,
  Building,
  Briefcase,
  Mail,
  Phone,
  Lock,
  Hash,
  Calendar,
  Users,
  Camera,
  ArrowLeft,
  X,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  createEmployeeSchema,
  CreateEmployeeFormData,
} from "@/validations/employee.schema";
import {
  useCreateEmployeeMutation,
  useGetEmployeesQuery,
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

export default function CreateEmployeePage() {
  const router = useRouter();
  const [profileImageBase64, setProfileImageBase64] = useState<string>("");
  const [createEmployee, { isLoading: isSubmitting }] = useCreateEmployeeMutation();

  // Fetch managers for reporting manager dropdown
  const { data: employeesData } = useGetEmployeesQuery({ limit: 100, includeSelf: "true" } as any);
  const managers = (employeesData?.data || []).filter(
    (emp) =>
      emp.userId?.role === "MANAGER" ||
      emp.userId?.role === "HR_ADMIN" ||
      emp.userId?.role === "SUPER_ADMIN"
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateEmployeeFormData>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      empId: "",
      password: "",
      role: "",
      department: "",
      designation: "",
      phone: "",
      reportingManagerId: "",
      joinedAt: "",
      profileImage: "",
    },
  });

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

  const onSubmit = async (data: CreateEmployeeFormData) => {
    try {
      const payload = {
        ...data,
        profileImage: profileImageBase64 || undefined,
        reportingManagerId: data.reportingManagerId || null,
        phone: data.phone?.trim() ? data.phone.trim() : undefined,
        joinedAt: data.joinedAt ? data.joinedAt : undefined,
      };

      const res = await createEmployee(payload as any).unwrap();
      toast.success(res.message || "Employee successfully created.");
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
          "Failed to onboard employee. Please verify input fields.";
        toast.error(errorMsg);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
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
            Create Employee
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Add a new employee and assign their departmental role
          </p>
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
              <Input
                label="Date of Joining"
                type="date"
                leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
                {...register("joinedAt")}
                error={errors.joinedAt?.message}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Account Credentials
              </h3>
              <Input
                label="Email"
                type="email"
                placeholder="Email"
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                required
                autoComplete="off"
                {...register("email")}
                error={errors.email?.message}
              />
              <Input
                label="Employee ID"
                placeholder="EMP-XXX"
                leftIcon={<Hash className="w-4 h-4 text-slate-400" />}
                required
                {...register("empId")}
                error={errors.empId?.message}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Password"
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                helperText="Minimum 8 characters"
                required
                autoComplete="new-password"
                {...register("password")}
                error={errors.password?.message}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Work & Role Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="w-full space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  System Role <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <select
                    {...register("role")}
                    className={`block w-full rounded-lg border text-sm transition-colors py-2.5 pl-9 pr-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                      errors.role
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                        : "border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                  >
                    <option value="">Select Role</option>
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="HR_ADMIN">HR ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER ADMIN</option>
                  </select>
                </div>
                {errors.role && <p className="text-xs text-rose-500">{errors.role.message}</p>}
              </div>

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
                    {STANDARD_DEPARTMENTS.map((dept) => (
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
                {errors.reportingManagerId && <p className="text-xs text-rose-500">{errors.reportingManagerId.message}</p>}
              </div>
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
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
