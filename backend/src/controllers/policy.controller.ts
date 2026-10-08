import { Request, Response, NextFunction } from 'express';
import { PolicyService } from '../services/policy.service';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { HttpStatusCode } from '../constants/enums';
import {
  CreatePolicyInput,
  UpdatePolicyInput,
  PoliciesQueryParams,
} from '../validations/policy.validation';

export class PolicyController {
  private policyService: PolicyService;

  constructor() {
    this.policyService = new PolicyService();
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input: CreatePolicyInput = req.body;
      const result = await this.policyService.createPolicy(input);

      res
        .status(HttpStatusCode.CREATED)
        .json(ApiResponse.created(result, 'Company policy drafted successfully'));
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const input: UpdatePolicyInput = req.body;
      const result = await this.policyService.updatePolicy(id!, input);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Policy document updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  publish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.policyService.publishPolicy(id!);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Policy officially published company-wide'));
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as PoliciesQueryParams;
      const result = await this.policyService.getPolicies(query, req.user!);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result.policies, 'Policies retrieved successfully', result.meta));
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const employeeId = req.user?.employeeId;
      const result = await this.policyService.getPolicyById(id!, employeeId);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Policy document details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  acknowledge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const employeeId = req.user?.employeeId;

      if (!employeeId) {
        throw ApiError.badRequest('No linked employee profile found to record policy acknowledgment');
      }

      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await this.policyService.acknowledgePolicy(id!, employeeId, clientIp, userAgent);

      res
        .status(HttpStatusCode.CREATED)
        .json(ApiResponse.created(result, 'Policy digitally acknowledged and accepted'));
    } catch (error) {
      next(error);
    }
  };

  getMyAcknowledgments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employeeId = req.user?.employeeId;
      if (!employeeId) {
        throw ApiError.badRequest('No linked employee profile found');
      }

      const result = await this.policyService.getMyAcknowledgments(employeeId);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Signed policies history retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getComplianceReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.policyService.getComplianceReport(id!);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Policy organizational compliance report generated successfully'));
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.policyService.deletePolicy(id!);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(null, 'Policy archived and removed successfully'));
    } catch (error) {
      next(error);
    }
  };
}
