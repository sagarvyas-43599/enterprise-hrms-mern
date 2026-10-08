import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "purple"
    | "neutral"
    | "outline";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "md",
  className,
  ...props
}) => {
  const variants = {
    success:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    danger:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    warning:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    info:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
    purple:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
    neutral:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    outline:
      "bg-transparent text-slate-600 border-slate-300 dark:text-slate-300 dark:border-slate-700",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export function getAttendanceStatusBadge(status: string) {
  switch (status) {
    case "PRESENT":
      return <Badge variant="success">Present</Badge>;
    case "ABSENT":
      return <Badge variant="danger">Absent</Badge>;
    case "LATE":
      return <Badge variant="warning">Late</Badge>;
    case "HALF_DAY":
      return <Badge variant="purple">Half Day</Badge>;
    case "ON_LEAVE":
      return <Badge variant="info">On Leave</Badge>;
    case "WORK_FROM_HOME":
      return <Badge variant="info">Work from Home</Badge>;
    case "HOLIDAY":
      return <Badge variant="neutral">Holiday</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
}
