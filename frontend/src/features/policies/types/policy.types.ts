export type PolicyCategory =
  | "HR_POLICY"
  | "IT_SECURITY"
  | "COMPLIANCE_LEGAL"
  | "HEALTH_SAFETY"
  | "CODE_OF_CONDUCT"
  | "GENERAL";

export type PolicyStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Policy {
  _id: string;
  code: string;
  title: string;
  category: PolicyCategory;
  description: string;
  content: string;
  version: string;
  effectiveDate: string;
  isMandatory: boolean;
  status: PolicyStatus;
  hasAcknowledged?: boolean;
  acknowledgedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PolicyComplianceReport {
  policy: {
    id: string;
    code: string;
    title: string;
    version: string;
    isMandatory: boolean;
  };
  metrics: {
    totalActiveEmployees: number;
    acknowledgedCount: number;
    pendingCount: number;
    complianceRatePercent: number;
  };
}

export const POLICY_CATEGORY_METADATA: Record<
  PolicyCategory,
  { label: string; badgeClass: string; iconName: string }
> = {
  CODE_OF_CONDUCT: {
    label: "Code of Conduct",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    iconName: "Scale",
  },
  IT_SECURITY: {
    label: "IT & Cybersecurity",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    iconName: "ShieldCheck",
  },
  COMPLIANCE_LEGAL: {
    label: "Compliance & Legal",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    iconName: "FileCheck",
  },
  HR_POLICY: {
    label: "HR & People",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    iconName: "Users",
  },
  HEALTH_SAFETY: {
    label: "Health & Safety",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    iconName: "HeartPulse",
  },
  GENERAL: {
    label: "General Guidelines",
    badgeClass: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    iconName: "BookOpen",
  },
};
