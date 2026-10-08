export type GoalStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type AppraisalStatus =
  | "DRAFT"
  | "SELF_REVIEW_SUBMITTED"
  | "MANAGER_REVIEWED"
  | "COMPLETED";

export type PerformanceRating =
  | "OUTSTANDING"
  | "EXCEEDS_EXPECTATIONS"
  | "MEETS_EXPECTATIONS"
  | "NEEDS_IMPROVEMENT"
  | "UNSATISFACTORY";

export interface EmployeeRef {
  _id: string;
  empId: string;
  firstName: string;
  lastName: string;
  department?: string;
  designation?: string;
  email?: string;
}

export interface Goal {
  _id: string;
  employeeId: EmployeeRef | string;
  title: string;
  description: string;
  category: string;
  startDate?: string;
  targetDate: string;
  progress: number;
  weightage: number;
  status: GoalStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompetencyRatings {
  technical: number;
  communication: number;
  leadership: number;
  teamwork: number;
}

export interface PeerReview {
  peerId: EmployeeRef | string;
  rating: number;
  comments: string;
  submittedAt: string;
}

export interface Appraisal {
  _id: string;
  employeeId: EmployeeRef | string;
  reviewerId?: EmployeeRef | string;
  cycleName: string;
  year: number;
  status: AppraisalStatus;
  selfRating?: number | null;
  selfCompetencies?: CompetencyRatings | null;
  selfComments?: string | null;
  managerRating?: number | null;
  managerCompetencies?: CompetencyRatings | null;
  managerComments?: string | null;
  peerReviews?: PeerReview[];
  isCalibrated?: boolean;
  finalRating?: PerformanceRating | null;
  promotionRecommended?: boolean;
  salaryHikeRecommendedPercent?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GoalStats {
  totalGoals?: number;
  completedGoals?: number;
  inProgressGoals?: number;
  avgProgress?: number;
}
