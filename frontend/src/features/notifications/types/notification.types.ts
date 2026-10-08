export type NotificationType =
  | "ANNOUNCEMENT"
  | "ALERT"
  | "LEAVE_UPDATE"
  | "PAYROLL_GENERATED"
  | "POLICY_MANDATE"
  | "TICKET_UPDATE"
  | "GENERAL";

export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface AppNotification {
  _id: string;
  recipientId?: string | null;
  senderId?: string | null;
  senderName?: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: string | null;
  actionLink?: string | null;
  targetRole?: string | null;
  targetDepartment?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export const getTypeMetadata = (type: NotificationType) => {
  switch (type) {
    case "ANNOUNCEMENT":
      return {
        label: "Company Broadcast",
        badgeClass: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      };
    case "ALERT":
      return {
        label: "System Alert",
        badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      };
    case "LEAVE_UPDATE":
      return {
        label: "Leave & Absence",
        badgeClass: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      };
    case "PAYROLL_GENERATED":
      return {
        label: "Payroll & Compensation",
        badgeClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      };
    case "POLICY_MANDATE":
      return {
        label: "Policy Mandate",
        badgeClass: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      };
    case "TICKET_UPDATE":
      return {
        label: "Support Ticket",
        badgeClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      };
    default:
      return {
        label: "General Notice",
        badgeClass: "bg-slate-500/10 text-slate-500 border-slate-500/20",
      };
  }
};

export const getPriorityBadgeClass = (priority: NotificationPriority) => {
  switch (priority) {
    case "URGENT":
      return "bg-rose-500/10 text-rose-500 border-rose-500/20 font-bold";
    case "HIGH":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20 font-semibold";
    case "MEDIUM":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "LOW":
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
};
