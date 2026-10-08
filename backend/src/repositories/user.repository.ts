import { Types } from 'mongoose';
import { BaseRepository } from './base.repository';
import { IUser, UserModel } from '../models/user.model';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(UserModel);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.model
      .findOne({
        email: email.toLowerCase().trim(),
        isDeleted: false,
      })
      .exec();
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return this.model
      .findOne({
        email: email.toLowerCase().trim(),
        isDeleted: false,
      })
      .select('+passwordHash')
      .exec();
  }

  async findByIdWithPassword(id: string | Types.ObjectId): Promise<IUser | null> {
    return this.model
      .findOne({
        _id: id,
        isDeleted: false,
      })
      .select('+passwordHash')
      .exec();
  }

  async updateLastLogin(id: string | Types.ObjectId): Promise<void> {
    await this.model
      .updateOne({ _id: id }, { $set: { lastLoginAt: new Date() } })
      .exec();
  }
}
