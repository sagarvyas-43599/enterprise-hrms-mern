export interface AuditLog {
  _id: string;
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLogStats {
  totalEvents: number;
  todayEvents: number;
  totalUniqueActors: number;
  topActions: { _id: string; count: number }[];
}

export interface AuditLogsQueryParams {
  action?: string;
  entity?: string;
  actorEmail?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const getActionBadgeClass = (action: string): string => {
  const upper = action.toUpperCase();
  if (upper.includes("LOGIN") || upper.includes("AUTH")) {
    return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
  }
  if (upper.includes("CREATE") || upper.includes("DRAFT")) {
    return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
  }
  if (upper.includes("UPDATE") || upper.includes("EDIT")) {
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  }
  if (upper.includes("DELETE") || upper.includes("REMOVE") || upper.includes("ARCHIVE")) {
    return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
  }
  if (upper.includes("STATUS") || upper.includes("APPROVE")) {
    return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
  }
  if (upper.includes("PUBLISH") || upper.includes("ACKNOWLEDGE")) {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  }
  return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
};

export const getEntityBadgeClass = (entity: string): string => {
  const upper = entity.toUpperCase();
  switch (upper) {
    case "USER":
    case "AUTH":
      return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
    case "EMPLOYEE":
      return "bg-sky-500/10 text-sky-500 border-sky-500/20";
    case "DEPARTMENT":
    case "DESIGNATION":
      return "bg-teal-500/10 text-teal-500 border-teal-500/20";
    case "LEAVE":
    case "ATTENDANCE":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "PAYROLL":
      return "bg-violet-500/10 text-violet-500 border-violet-500/20";
    case "ASSET":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "POLICY":
      return "bg-pink-500/10 text-pink-500 border-pink-500/20";
    case "TICKET":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    default:
      return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  }
};

export const formatActionText = (action: string): string => {
  if (!action) return "";
  return action
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
