import { Document, FilterQuery, Model, UpdateQuery, Types } from 'mongoose';

export abstract class BaseRepository<T extends Document> {
  protected readonly model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async findById(id: string | Types.ObjectId): Promise<T | null> {
    return this.model.findOne({ _id: id, isDeleted: false } as FilterQuery<T>).exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne({ ...filter, isDeleted: false }).exec();
  }

  async find(
    filter: FilterQuery<T> = {},
    skip: number = 0,
    limit: number = 20,
    sort: Record<string, 1 | -1> = { createdAt: -1 }
  ): Promise<T[]> {
    return this.model
      .find({ ...filter, isDeleted: false })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments({ ...filter, isDeleted: false }).exec();
  }

  async updateById(id: string | Types.ObjectId, updateData: UpdateQuery<T>): Promise<T | null> {
    return this.model
      .findOneAndUpdate({ _id: id, isDeleted: false } as FilterQuery<T>, updateData, {
        new: true,
        runValidators: true,
      })
      .exec();
  }

  async softDelete(id: string | Types.ObjectId): Promise<T | null> {
    return this.model
      .findOneAndUpdate(
        { _id: id, isDeleted: false } as FilterQuery<T>,
        { isDeleted: true, deletedAt: new Date() } as unknown as UpdateQuery<T>,
        { new: true }
      )
      .exec();
  }
}
