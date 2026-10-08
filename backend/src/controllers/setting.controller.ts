import { Request, Response, NextFunction } from 'express';
import { SettingService } from '../services/setting.service';
import { ApiResponse } from '../utils/apiResponse';
import { HttpStatusCode } from '../constants/enums';

export class SettingController {
  private settingService: SettingService;

  constructor() {
    this.settingService = new SettingService();
  }

  getSettings = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.settingService.getSettings();
      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Company configurations retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actorEmail = req.user?.email;
      const result = await this.settingService.updateSettings(req.body, actorEmail);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Company configurations updated successfully'));
    } catch (error) {
      next(error);
    }
  };
}
