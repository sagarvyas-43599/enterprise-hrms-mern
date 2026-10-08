import { Types, FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import { IAsset, AssetModel } from '../models/asset.model';
import { AssetStatus } from '../constants/enums';

export class AssetRepository extends BaseRepository<IAsset> {
  constructor() {
    super(AssetModel);
  }

  async findByAssetTag(assetTag: string): Promise<IAsset | null> {
    return this.model.findOne({ assetTag: assetTag.toUpperCase().trim(), isDeleted: false }).exec();
  }

  async findBySerialNumber(serialNumber: string): Promise<IAsset | null> {
    return this.model.findOne({ serialNumber: serialNumber.trim(), isDeleted: false }).exec();
  }

  async findAssetsWithDetails(
    filter: FilterQuery<IAsset>,
    skip: number,
    limit: number
  ): Promise<{ assets: IAsset[]; total: number }> {
    const finalFilter = { ...filter, isDeleted: false };

    const [assets, total] = await Promise.all([
      this.model
        .find(finalFilter)
        .populate({
          path: 'allocatedTo',
          select: 'empId firstName lastName department designation phone',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(finalFilter).exec(),
    ]);

    return { assets, total };
  }

  async findEmployeeAllocatedAssets(employeeId: string | Types.ObjectId): Promise<IAsset[]> {
    return this.model
      .find({
        allocatedTo: new Types.ObjectId(employeeId),
        status: AssetStatus.ALLOCATED,
        isDeleted: false,
      })
      .exec();
  }

  async getInventoryMetrics() {
    const stats = await this.model.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalAssets: { $sum: 1 },
          totalValue: { $sum: '$purchaseCost' },
          allocated: {
            $sum: { $cond: [{ $eq: ['$status', AssetStatus.ALLOCATED] }, 1, 0] },
          },
          available: {
            $sum: { $cond: [{ $eq: ['$status', AssetStatus.AVAILABLE] }, 1, 0] },
          },
          underRepair: {
            $sum: { $cond: [{ $eq: ['$status', AssetStatus.UNDER_REPAIR] }, 1, 0] },
          },
          retired: {
            $sum: { $cond: [{ $eq: ['$status', AssetStatus.RETIRED] }, 1, 0] },
          },
        },
      },
    ]);

    return (
      stats[0] || {
        totalAssets: 0,
        totalValue: 0,
        allocated: 0,
        available: 0,
        underRepair: 0,
        retired: 0,
      }
    );
  }
}
