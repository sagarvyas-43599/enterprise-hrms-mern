"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Building,
  Briefcase,
  Phone,
  Hash,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { registerSchema, RegisterFormData } from "@/validations/auth.schema";
import { useRegisterMutation } from "@/redux/services/authApi";
import { parseAndSetApiErrors } from "@/lib/errorParser";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [registerUser, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      empId: "",
      password: "",
      role: "EMPLOYEE",
      department: "",
      designation: "",
      phone: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const res = await registerUser(data).unwrap();
      toast.success(
        res.message || "Account registered successfully! Please sign in."
      );
      router.push("/login");
    } catch (err: unknown) {
      const msg = parseAndSetApiErrors(
        err,
        setError,
        "Failed to register. Please check the provided information."
      );
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Enterprise HRMS Logo & Branding inside the card box */}
      <div className="flex flex-col items-center text-center space-y-3 pb-2">
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center shrink-0 shadow-xl shadow-indigo-500/30 ring-1 ring-white/20">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white drop-shadow-sm">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" fillOpacity="0.4" />
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="font-black text-3xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight leading-none">
            NEXUS
          </span>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.35em] font-bold mt-1.5 block">
            Workspace
          </span>
        </div>
      </div>

      {/* Heading */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Register
        </h2>
      </div>

      {/* Form with noValidate */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
        {/* Root form error banner if any */}
        {errors.root && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {errors.root.message}
          </div>
        )}

        {/* First Name & Last Name */}
        <div className="grid grid-cols-2 gap-3">
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
        </div>

        {/* Email */}
        <Input
          label="Email"
          type="email"
          placeholder="Email"
          leftIcon={<Mail className="w-4 h-4" />}
          required
          {...register("email")}
          error={errors.email?.message}
        />

        {/* Employee ID */}
        <Input
          label="Employee ID"
          placeholder="Employee ID"
          leftIcon={<Hash className="w-4 h-4" />}
          required
          {...register("empId")}
          error={errors.empId?.message}
        />

        {/* Password */}
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
              tabIndex={-1}
              title={showPassword ? "Hide password" : "Show password"}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          }
          required
          {...register("password")}
          error={errors.password?.message}
        />

        {/* Department & Designation */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Department"
            placeholder="Department"
            leftIcon={<Building className="w-4 h-4" />}
            required
            {...register("department")}
            error={errors.department?.message}
          />
          <Input
            label="Designation"
            placeholder="Designation"
            leftIcon={<Briefcase className="w-4 h-4" />}
            required
            {...register("designation")}
            error={errors.designation?.message}
          />
        </div>

        {/* Phone */}
        <Input
          label="Phone"
          type="number"
          placeholder="Phone"
          leftIcon={<Phone className="w-4 h-4" />}
          {...register("phone")}
          error={errors.phone?.message}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full font-semibold shadow-sm mt-1"
          isLoading={isLoading}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Create Account
        </Button>
      </form>

      {/* Switch to Sign In */}
      <div className="text-center pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <span>Already have an account? </span>
        <Link
          href="/login"
          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
