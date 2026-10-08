import { Request, Response, NextFunction } from 'express';
import { AssetService } from '../services/asset.service';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { HttpStatusCode, UserRole } from '../constants/enums';
import {
  CreateAssetInput,
  UpdateAssetInput,
  AllocateAssetInput,
  ReturnAssetInput,
  AssetsQueryParams,
} from '../validations/asset.validation';

export class AssetController {
  private assetService: AssetService;

  constructor() {
    this.assetService = new AssetService();
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input: CreateAssetInput = req.body;
      const result = await this.assetService.createAsset(input);

      res
        .status(HttpStatusCode.CREATED)
        .json(ApiResponse.created(result, 'Asset item registered in corporate inventory successfully'));
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const input: UpdateAssetInput = req.body;
      const result = await this.assetService.updateAsset(id!, input);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Asset metadata updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  allocate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const input: AllocateAssetInput = req.body;
      const result = await this.assetService.allocateAsset(id!, input);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Asset allocated to employee successfully'));
    } catch (error) {
      next(error);
    }
  };

  returnAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const input: ReturnAssetInput = req.body;
      const result = await this.assetService.returnAsset(id!, input);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Asset return processed and logged successfully'));
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.assetService.deleteAsset(id!);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Asset item soft-deleted successfully'));
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = { ...(req.query as unknown as AssetsQueryParams) };

      // Normal employees can only view their own allocated assets
      if (req.user && req.user.role === UserRole.EMPLOYEE) {
        if (!req.user.employeeId) {
          throw ApiError.forbidden('No linked employee profile found');
        }
        query.allocatedTo = req.user.employeeId;
      }

      const result = await this.assetService.getAssets(query);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result.assets, 'Asset inventory retrieved successfully', result.meta));
    } catch (error) {
      next(error);
    }
  };

  getMyAssets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employeeId = req.user?.employeeId;
      if (!employeeId) {
        throw ApiError.badRequest('No linked employee profile found to retrieve assets');
      }

      const result = await this.assetService.getEmployeeAssets(employeeId);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Your allocated company assets retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getMetrics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.assetService.getInventoryMetrics();

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Corporate inventory metrics retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };
}
