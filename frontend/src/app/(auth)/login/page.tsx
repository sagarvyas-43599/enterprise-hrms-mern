"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, LogIn, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginSchema, LoginFormData } from "@/validations/auth.schema";
import { useLoginMutation } from "@/redux/services/authApi";
import { parseAndSetApiErrors } from "@/lib/errorParser";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await login({
        email: data.email,
        password: data.password,
      }).unwrap();

      const userName =
        res.data.user.email?.split("@")[0] || "User";

      toast.success(`Welcome back, ${userName}!`);
      router.push("/");
    } catch (err: unknown) {
      const msg = parseAndSetApiErrors(
        err,
        setError,
        "Invalid Email or Password. Please try again."
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
          Sign In
        </h2>
      </div>

      {/* Form with noValidate to block native browser popups */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Root form error banner if any */}
        {errors.root && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {errors.root.message}
          </div>
        )}

        {/* Email Field: Label is 'Email', Placeholder is 'Email' */}
        <Input
          label="Email"
          type="email"
          placeholder="Email"
          leftIcon={<Mail className="w-4 h-4" />}
          required
          {...register("email")}
          error={errors.email?.message}
        />

        {/* Password Field: Label is 'Password', Placeholder is 'Password' */}
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

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
            />
            <span>Remember me</span>
          </label>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              toast.info("Please contact your HR administrator to reset your password.");
            }}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Forgot password?
          </a>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full font-semibold shadow-sm"
          isLoading={isLoading}
          leftIcon={<LogIn className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      {/* Switch to Register */}
      <div className="text-center pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <span>Don&apos;t have an account? </span>
        <Link
          href="/register"
          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
