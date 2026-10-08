import { Types, FilterQuery } from 'mongoose';
import { GoalRepository, AppraisalRepository } from '../repositories/performance.repository';
import { EmployeeRepository } from '../repositories/employee.repository';
import { ApiError } from '../utils/apiResponse';
import { GoalStatus, AppraisalStatus, UserRole } from '../constants/enums';
import {
  CreateGoalInput,
  UpdateGoalProgressInput,
  CreateAppraisalCycleInput,
  SubmitSelfReviewInput,
  SubmitManagerReviewInput,
  GoalsQueryParams,
  AppraisalsQueryParams,
} from '../validations/performance.validation';
import { AuthenticatedUser } from '../@types/express';
import { IGoal, IAppraisal } from '../models/performance.model';
import { EmployeeModel } from '../models/employee.model';

export class PerformanceService {
  private goalRepo: GoalRepository;
  private appraisalRepo: AppraisalRepository;
  private employeeRepo: EmployeeRepository;

  constructor() {
    this.goalRepo = new GoalRepository();
    this.appraisalRepo = new AppraisalRepository();
    this.employeeRepo = new EmployeeRepository();
  }

  // --- GOAL & OKR MANAGEMENT ---

  async createGoal(employeeId: string, input: CreateGoalInput) {
    const employee = await this.employeeRepo.findById(employeeId);
    if (!employee) {
      throw ApiError.notFound(`Employee not found with ID: ${employeeId}`);
    }

    // ENTERPRISE RULE: Total weightage of active goals cannot exceed 100%
    const existingGoals = await this.goalRepo.find({ 
      employeeId: employee._id, 
      isDeleted: false,
      status: { $ne: GoalStatus.CANCELLED }
    }, 0, 100);
    const currentWeightage = existingGoals.reduce((sum: number, g: any) => sum + (g.weightage || 0), 0);
    
    if (currentWeightage + input.weightage > 100) {
      throw ApiError.badRequest(`Enterprise Rule Violation: Adding this goal exceeds the 100% total weightage limit. Current total is ${currentWeightage}%.`);
    }

    const goal = await this.goalRepo.create({
      employeeId: new Types.ObjectId(employeeId),
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      startDate: input.startDate ? new Date(input.startDate) : new Date(),
      targetDate: new Date(input.targetDate),
      weightage: input.weightage,
      progress: 0,
      status: GoalStatus.NOT_STARTED,
      isDeleted: false,
    });

    return goal;
  }

  async updateGoalProgress(
    goalId: string,
    user: AuthenticatedUser,
    input: UpdateGoalProgressInput
  ) {
    const goal = await this.goalRepo.findById(goalId);
    if (!goal) {
      throw ApiError.notFound(`Goal not found with ID: ${goalId}`);
    }

    if (user.role === UserRole.EMPLOYEE && goal.employeeId.toString() !== user.employeeId) {
      throw ApiError.forbidden('You can only update your own assigned goals.');
    }

    let status = input.status || goal.status;
    let progress = input.progress;
    
    if (progress === 100) {
      status = GoalStatus.COMPLETED;
    } else if (status === GoalStatus.COMPLETED && progress < 100) {
      progress = 100;
    } else if (progress > 0 && status === GoalStatus.NOT_STARTED) {
      status = GoalStatus.IN_PROGRESS;
    }

    const updated = await this.goalRepo.updateById(goalId, {
      progress,
      status,
    });

    return updated;
  }

  async getGoals(query: GoalsQueryParams, user: AuthenticatedUser) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IGoal> = {};

    if (user.role === UserRole.EMPLOYEE) {
      if (!user.employeeId) throw ApiError.forbidden('No linked employee profile found');
      filter.employeeId = new Types.ObjectId(user.employeeId);
    } else if (user.role === UserRole.MANAGER && user.employeeId) {
      const managedEmployees = await EmployeeModel.find({ reportingManagerId: new Types.ObjectId(user.employeeId) }).select('_id').lean();
      const managedIds = managedEmployees.map(e => e._id);
      managedIds.push(new Types.ObjectId(user.employeeId));
      filter.employeeId = { $in: managedIds } as any;
    }

    if (query.employeeId && user.role !== UserRole.EMPLOYEE) {
      filter.employeeId = new Types.ObjectId(query.employeeId);
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      if (user.role !== UserRole.EMPLOYEE) {
        const matchedEmployees = await EmployeeModel.find({
          $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { empId: searchRegex }
          ],
          isDeleted: false
        }).lean();
        
        const matchedEmployeeIds = matchedEmployees.map(e => e._id);
        filter.$or = [
          { employeeId: { $in: matchedEmployeeIds } as any },
          { title: searchRegex },
          { description: searchRegex },
          { category: searchRegex }
        ];
      } else {
        filter.$or = [
          { title: searchRegex },
          { description: searchRegex },
          { category: searchRegex }
        ];
      }
    }

    if (query.status) filter.status = query.status;

    const { goals, total } = await this.goalRepo.findGoalsWithDetails(filter, skip, limit);

    return {
      goals,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getGoalStats(employeeId: string) {
    return this.goalRepo.getGoalStats(employeeId);
  }

  // --- APPRAISAL REVIEW WORKFLOW ---

  async initiateAppraisal(input: CreateAppraisalCycleInput) {
    const employee = await this.employeeRepo.findById(input.employeeId);
    if (!employee) {
      throw ApiError.notFound(`Employee not found with ID: ${input.employeeId}`);
    }

    const existing = await this.appraisalRepo.findByEmployeeCycleYear(
      input.employeeId,
      input.cycleName,
      input.year
    );

    if (existing) {
      throw ApiError.conflict(
        `Appraisal cycle '${input.cycleName}' (${input.year}) is already created for this employee.`
      );
    }

    // Auto assign reviewer to reporting manager or employee themselves if no manager
    const reviewerId = employee.reportingManagerId || employee._id;

    const appraisal = await this.appraisalRepo.create({
      employeeId: new Types.ObjectId(input.employeeId),
      reviewerId,
      cycleName: input.cycleName.trim(),
      year: input.year,
      status: AppraisalStatus.DRAFT,
      promotionRecommended: false,
      salaryHikeRecommendedPercent: 0,
      isDeleted: false,
    });

    return appraisal;
  }

  async submitSelfReview(
    appraisalId: string,
    user: AuthenticatedUser,
    input: SubmitSelfReviewInput
  ) {
    const appraisal = await this.appraisalRepo.findById(appraisalId);
    if (!appraisal) {
      throw ApiError.notFound(`Appraisal not found with ID: ${appraisalId}`);
    }

    if (user.role === UserRole.EMPLOYEE && appraisal.employeeId.toString() !== user.employeeId) {
      throw ApiError.forbidden('You can only submit self-assessment for your own appraisal.');
    }

    const updated = await this.appraisalRepo.updateById(appraisalId, {
      selfRating: input.selfRating,
      selfCompetencies: input.selfCompetencies,
      selfComments: input.selfComments.trim(),
      status: AppraisalStatus.SELF_REVIEW_SUBMITTED,
    });

    return updated;
  }

  async submitManagerReview(
    appraisalId: string,
    reviewer: AuthenticatedUser,
    input: SubmitManagerReviewInput
  ) {
    const appraisal = await this.appraisalRepo.findById(appraisalId);
    if (!appraisal) {
      throw ApiError.notFound(`Appraisal not found with ID: ${appraisalId}`);
    }

    if (reviewer.role === UserRole.MANAGER) {
      if (appraisal.reviewerId.toString() !== reviewer.employeeId) {
        throw ApiError.forbidden('You are only authorized to evaluate your direct reports.');
      }
    }

    const updated = await this.appraisalRepo.updateById(appraisalId, {
      managerRating: input.managerRating,
      managerCompetencies: input.managerCompetencies,
      managerComments: input.managerComments.trim(),
      finalRating: input.finalRating,
      promotionRecommended: input.promotionRecommended,
      salaryHikeRecommendedPercent: input.salaryHikeRecommendedPercent,
      status: AppraisalStatus.COMPLETED,
    });

    return updated;
  }

  async getAppraisals(query: AppraisalsQueryParams, user: AuthenticatedUser) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IAppraisal> = {};

    if (user.role === UserRole.EMPLOYEE) {
      if (!user.employeeId) throw ApiError.forbidden('No linked employee profile found');
      filter.employeeId = new Types.ObjectId(user.employeeId);
    } else if (user.role === UserRole.MANAGER) {
      filter.$or = [
        { reviewerId: new Types.ObjectId(user.employeeId) },
        { employeeId: new Types.ObjectId(user.employeeId) },
      ];
    }

    if (query.employeeId && user.role !== UserRole.EMPLOYEE) {
      filter.employeeId = new Types.ObjectId(query.employeeId);
    }
    
    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      if (user.role !== UserRole.EMPLOYEE) {
        const matchedEmployees = await EmployeeModel.find({
          $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { empId: searchRegex }
          ],
          isDeleted: false
        }).lean();
        
        const matchedEmployeeIds = matchedEmployees.map(e => e._id);
        
        const searchCondition = {
          $or: [
            { employeeId: { $in: matchedEmployeeIds } as any },
            { cycleName: searchRegex }
          ]
        };
        
        if (user.role === UserRole.MANAGER) {
          filter.$and = [
            { $or: filter.$or },
            searchCondition
          ];
          delete filter.$or;
        } else {
          filter.$or = searchCondition.$or;
        }
      } else {
        filter.$or = [
          { cycleName: searchRegex }
        ];
      }
    }

    if (query.year) filter.year = query.year;
    if (query.status) filter.status = query.status;

    const { appraisals, total } = await this.appraisalRepo.findAppraisalsWithDetails(filter, skip, limit);

    return {
      appraisals,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPerformanceDistribution(year: number) {
    return this.appraisalRepo.getPerformanceDistribution(year);
  }
}
