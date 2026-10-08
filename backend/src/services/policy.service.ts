import { Types, FilterQuery } from 'mongoose';
import { PolicyRepository, PolicyAcknowledgmentRepository } from '../repositories/policy.repository';
import { EmployeeRepository } from '../repositories/employee.repository';
import { ApiError } from '../utils/apiResponse';
import { PolicyStatus, UserRole } from '../constants/enums';
import {
  CreatePolicyInput,
  UpdatePolicyInput,
  PoliciesQueryParams,
} from '../validations/policy.validation';
import { AuthenticatedUser } from '../@types/express';
import { IPolicy } from '../models/policy.model';
import { NotificationModel, NotificationType, NotificationPriority } from '../models/notification.model';

export class PolicyService {
  private policyRepo: PolicyRepository;
  private ackRepo: PolicyAcknowledgmentRepository;
  private employeeRepo: EmployeeRepository;

  constructor() {
    this.policyRepo = new PolicyRepository();
    this.ackRepo = new PolicyAcknowledgmentRepository();
    this.employeeRepo = new EmployeeRepository();
  }

  async createPolicy(input: CreatePolicyInput) {
    const existing = await this.policyRepo.findByCode(input.code);
    if (existing) {
      throw ApiError.conflict(`Policy code '${input.code}' already exists.`);
    }

    const policy = await this.policyRepo.create({
      code: input.code.toUpperCase().trim(),
      title: input.title.trim(),
      category: input.category,
      description: input.description.trim(),
      content: input.content,
      version: input.version || '1.0',
      effectiveDate: input.effectiveDate ? new Date(input.effectiveDate) : new Date(),
      isMandatory: input.isMandatory !== undefined ? input.isMandatory : true,
      status: input.status || PolicyStatus.DRAFT,
      isDeleted: false,
    });

    return policy;
  }

  async updatePolicy(id: string, input: UpdatePolicyInput) {
    const policy = await this.policyRepo.findById(id);
    if (!policy) {
      throw ApiError.notFound(`Policy not found with ID: ${id}`);
    }

    const updatePayload: Partial<IPolicy> = {};
    if (input.title) updatePayload.title = input.title.trim();
    if (input.category) updatePayload.category = input.category;
    if (input.description) updatePayload.description = input.description.trim();
    if (input.content) updatePayload.content = input.content;
    if (input.version) updatePayload.version = input.version;
    if (input.effectiveDate) updatePayload.effectiveDate = new Date(input.effectiveDate);
    if (input.isMandatory !== undefined) updatePayload.isMandatory = input.isMandatory;
    if (input.status) updatePayload.status = input.status;

    const updated = await this.policyRepo.updateById(id, updatePayload);
    return updated;
  }

  async publishPolicy(id: string) {
    const policy = await this.policyRepo.findById(id);
    if (!policy) {
      throw ApiError.notFound(`Policy not found with ID: ${id}`);
    }

    const updated = await this.policyRepo.updateById(id, {
      status: PolicyStatus.PUBLISHED,
      effectiveDate: new Date(),
    });

    if (updated) {
      try {
        await NotificationModel.create({
          recipientId: null, // Company-wide broadcast
          title: `New Policy Published: ${updated.title}`,
          message: `Corporate policy '${updated.title}' (${updated.code}) is now active.${updated.isMandatory ? ' Digital acknowledgment is mandatory for all personnel.' : ''}`,
          type: NotificationType.POLICY_MANDATE,
          priority: updated.isMandatory ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
          actionLink: '/policies',
        });
      } catch (err) {
        console.error('Failed to dispatch policy notification:', err);
      }
    }

    return updated;
  }

  async getPolicies(query: PoliciesQueryParams, user: AuthenticatedUser) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IPolicy> = {};

    // Normal employees only see published corporate documents
    if (user.role === UserRole.EMPLOYEE) {
      filter.status = PolicyStatus.PUBLISHED;
    } else if (query.status) {
      filter.status = query.status;
    }

    if (query.category) filter.category = query.category;

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [{ title: searchRegex }, { code: searchRegex }, { description: searchRegex }];
    }

    const { policies, total } = await this.policyRepo.findPoliciesWithFilter(filter, skip, limit);

    return {
      policies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPolicyById(id: string, employeeId?: string) {
    const policy = await this.policyRepo.findById(id);
    if (!policy) {
      throw ApiError.notFound(`Policy not found with ID: ${id}`);
    }

    let userAcknowledgment = null;
    if (employeeId) {
      userAcknowledgment = await this.ackRepo.findAcknowledgment(id, employeeId);
    }

    return {
      ...policy.toObject(),
      hasAcknowledged: !!userAcknowledgment,
      acknowledgedAt: userAcknowledgment?.acknowledgedAt || null,
    };
  }

  async acknowledgePolicy(
    policyId: string,
    employeeId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const policy = await this.policyRepo.findById(policyId);
    if (!policy) {
      throw ApiError.notFound(`Policy not found with ID: ${policyId}`);
    }

    if (policy.status !== PolicyStatus.PUBLISHED) {
      throw ApiError.badRequest('Only published company policies can be acknowledged.');
    }

    const existing = await this.ackRepo.findAcknowledgment(policyId, employeeId);
    if (existing) {
      throw ApiError.conflict(
        `Policy '${policy.code}' was already acknowledged on ${existing.acknowledgedAt.toISOString()}`
      );
    }

    const acknowledgment = await this.ackRepo.create({
      policyId: new Types.ObjectId(policyId),
      employeeId: new Types.ObjectId(employeeId),
      acknowledgedAt: new Date(),
      ipAddress,
      userAgent,
    });

    return acknowledgment;
  }

  async getMyAcknowledgments(employeeId: string) {
    return this.ackRepo.findByEmployee(employeeId);
  }

  async getComplianceReport(policyId: string) {
    const policy = await this.policyRepo.findById(policyId);
    if (!policy) {
      throw ApiError.notFound(`Policy not found with ID: ${policyId}`);
    }

    const totalActiveEmployees = await this.employeeRepo.count();
    const acknowledgedCount = await this.ackRepo.countAcknowledgmentsByPolicy(policyId);
    const pendingCount = Math.max(0, totalActiveEmployees - acknowledgedCount);
    const complianceRatePercent =
      totalActiveEmployees > 0
        ? Math.round((acknowledgedCount / totalActiveEmployees) * 100)
        : 100;

    return {
      policy: {
        id: policy._id,
        code: policy.code,
        title: policy.title,
        version: policy.version,
        isMandatory: policy.isMandatory,
      },
      metrics: {
        totalActiveEmployees,
        acknowledgedCount,
        pendingCount,
        complianceRatePercent,
      },
    };
  }

  async deletePolicy(id: string) {
    const policy = await this.policyRepo.findById(id);
    if (!policy) {
      throw ApiError.notFound(`Policy not found with ID: ${id}`);
    }
    await this.policyRepo.softDelete(id);
    return { success: true };
  }
}
