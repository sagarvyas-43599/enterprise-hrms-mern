import { Types, FilterQuery } from 'mongoose';
import { AssetRepository } from '../repositories/asset.repository';
import { EmployeeRepository } from '../repositories/employee.repository';
import { ApiError } from '../utils/apiResponse';
import { AssetStatus, AssetCondition } from '../constants/enums';
import {
  CreateAssetInput,
  UpdateAssetInput,
  AllocateAssetInput,
  ReturnAssetInput,
  AssetsQueryParams,
} from '../validations/asset.validation';
import { IAsset } from '../models/asset.model';
import { EmployeeModel } from '../models/employee.model';

export class AssetService {
  private assetRepo: AssetRepository;
  private employeeRepo: EmployeeRepository;

  constructor() {
    this.assetRepo = new AssetRepository();
    this.employeeRepo = new EmployeeRepository();
  }

  async createAsset(input: CreateAssetInput) {
    const existingTag = await this.assetRepo.findByAssetTag(input.assetTag);
    if (existingTag) {
      throw ApiError.conflict(`An asset with tag '${input.assetTag}' already exists.`);
    }

    const existingSerial = await this.assetRepo.findBySerialNumber(input.serialNumber);
    if (existingSerial) {
      throw ApiError.conflict(`An asset with serial number '${input.serialNumber}' already exists.`);
    }

    const asset = await this.assetRepo.create({
      assetTag: input.assetTag.toUpperCase().trim(),
      name: input.name.trim(),
      category: input.category,
      brand: input.brand.trim(),
      modelNumber: input.modelNumber?.trim(),
      serialNumber: input.serialNumber.trim(),
      condition: input.condition || AssetCondition.NEW,
      status: AssetStatus.AVAILABLE,
      purchaseCost: input.purchaseCost,
      purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : new Date(),
      warrantyExpiry: input.warrantyExpiry ? new Date(input.warrantyExpiry) : null,
      notes: input.notes,
      allocatedTo: null,
      isDeleted: false,
    });

    return asset;
  }

  async updateAsset(id: string, input: UpdateAssetInput) {
    const asset = await this.assetRepo.findById(id);
    if (!asset) {
      throw ApiError.notFound(`Asset not found with ID: ${id}`);
    }

    const updatePayload: Partial<IAsset> = {};
    if (input.name) updatePayload.name = input.name.trim();
    if (input.brand) updatePayload.brand = input.brand.trim();
    if (input.modelNumber !== undefined) updatePayload.modelNumber = input.modelNumber.trim();
    if (input.condition) updatePayload.condition = input.condition;
    if (input.status) updatePayload.status = input.status;
    if (input.purchaseCost !== undefined) updatePayload.purchaseCost = input.purchaseCost;
    if (input.warrantyExpiry !== undefined) {
      updatePayload.warrantyExpiry = input.warrantyExpiry ? new Date(input.warrantyExpiry) : null;
    }
    if (input.notes) updatePayload.notes = input.notes;

    const updated = await this.assetRepo.updateById(id, updatePayload);
    return updated;
  }

  async allocateAsset(id: string, input: AllocateAssetInput) {
    const asset = await this.assetRepo.findById(id);
    if (!asset) {
      throw ApiError.notFound(`Asset not found with ID: ${id}`);
    }

    if (asset.status === AssetStatus.ALLOCATED) {
      throw ApiError.conflict(`Asset '${asset.assetTag}' is already allocated to another employee.`);
    }

    if (asset.status === AssetStatus.UNDER_REPAIR || asset.status === AssetStatus.RETIRED) {
      throw ApiError.badRequest(`Cannot allocate asset with status '${asset.status}'.`);
    }

    const employee = await this.employeeRepo.findById(input.employeeId);
    if (!employee) {
      throw ApiError.notFound(`Employee not found with ID: ${input.employeeId}`);
    }

    const updated = await this.assetRepo.updateById(id, {
      allocatedTo: new Types.ObjectId(input.employeeId),
      allocatedAt: new Date(),
      status: AssetStatus.ALLOCATED,
      ...(input.notes && { notes: `${asset.notes || ''} | Allocation: ${input.notes}`.trim() }),
    });

    return updated;
  }

  async returnAsset(id: string, input: ReturnAssetInput) {
    const asset = await this.assetRepo.findById(id);
    if (!asset) {
      throw ApiError.notFound(`Asset not found with ID: ${id}`);
    }

    if (asset.status !== AssetStatus.ALLOCATED) {
      throw ApiError.badRequest(`Asset '${asset.assetTag}' is not currently allocated to any employee.`);
    }

    // If returned damaged, move to UNDER_REPAIR automatically
    const newStatus =
      input.condition === AssetCondition.DAMAGED
        ? AssetStatus.UNDER_REPAIR
        : AssetStatus.AVAILABLE;

    const updated = await this.assetRepo.updateById(id, {
      allocatedTo: null,
      allocatedAt: null,
      status: newStatus,
      condition: input.condition,
      ...(input.notes && { notes: `${asset.notes || ''} | Return: ${input.notes}`.trim() }),
    });

    return updated;
  }

  async deleteAsset(id: string) {
    const asset = await this.assetRepo.findById(id);
    if (!asset) {
      throw ApiError.notFound(`Asset not found with ID: ${id}`);
    }

    if (asset.status === AssetStatus.ALLOCATED) {
      throw ApiError.conflict(
        `Cannot delete asset '${asset.assetTag}'. Please process asset return from employee before deletion.`
      );
    }

    await this.assetRepo.softDelete(id);
    return { message: `Asset '${asset.assetTag}' (${asset.name}) soft-deleted successfully.` };
  }

  async getAssets(query: AssetsQueryParams) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IAsset> = {};

    if (query.category) filter.category = query.category;
    if (query.status) filter.status = query.status;
    if (query.allocatedTo) filter.allocatedTo = new Types.ObjectId(query.allocatedTo);

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
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
        { name: searchRegex },
        { assetTag: searchRegex },
        { serialNumber: searchRegex },
        { brand: searchRegex },
        { allocatedTo: { $in: matchedEmployeeIds } as any }
      ];
    }

    const { assets, total } = await this.assetRepo.findAssetsWithDetails(filter, skip, limit);

    return {
      assets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEmployeeAssets(employeeId: string) {
    return this.assetRepo.findEmployeeAllocatedAssets(employeeId);
  }

  async getInventoryMetrics() {
    return this.assetRepo.getInventoryMetrics();
  }
}
