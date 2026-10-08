import { Types, FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import {
  IPolicy,
  IPolicyAcknowledgment,
  PolicyModel,
  PolicyAcknowledgmentModel,
} from '../models/policy.model';

export class PolicyRepository extends BaseRepository<IPolicy> {
  constructor() {
    super(PolicyModel);
  }

  async findByCode(code: string): Promise<IPolicy | null> {
    return this.model.findOne({ code: code.toUpperCase().trim(), isDeleted: false }).exec();
  }

  async findPoliciesWithFilter(
    filter: FilterQuery<IPolicy>,
    skip: number,
    limit: number
  ): Promise<{ policies: IPolicy[]; total: number }> {
    const finalFilter = { ...filter, isDeleted: false };

    const [policies, total] = await Promise.all([
      this.model
        .find(finalFilter)
        .sort({ effectiveDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(finalFilter).exec(),
    ]);

    return { policies, total };
  }
}

export class PolicyAcknowledgmentRepository extends BaseRepository<IPolicyAcknowledgment> {
  constructor() {
    super(PolicyAcknowledgmentModel);
  }

  async findAcknowledgment(
    policyId: string | Types.ObjectId,
    employeeId: string | Types.ObjectId
  ): Promise<IPolicyAcknowledgment | null> {
    return this.model
      .findOne({
        policyId: new Types.ObjectId(policyId),
        employeeId: new Types.ObjectId(employeeId),
      })
      .exec();
  }

  async countAcknowledgmentsByPolicy(policyId: string | Types.ObjectId): Promise<number> {
    return this.model
      .countDocuments({
        policyId: new Types.ObjectId(policyId),
      })
      .exec();
  }

  async findByEmployee(employeeId: string | Types.ObjectId): Promise<IPolicyAcknowledgment[]> {
    return this.model
      .find({
        employeeId: new Types.ObjectId(employeeId),
      })
      .populate('policyId', 'code title category version')
      .exec();
  }
}
