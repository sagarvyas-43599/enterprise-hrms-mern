import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { ApiResponse } from '../utils/apiResponse';
import { HttpStatusCode } from '../constants/enums';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  getMyNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = {
        userId: req.user!.userId,
        employeeId: req.user?.employeeId,
        role: req.user!.role,
      };

      const result = await this.notificationService.getMyNotifications(
        user,
        req.query as any
      );

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Notifications feed retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const user = {
        userId: req.user!.userId,
        employeeId: req.user?.employeeId,
        role: req.user!.role,
      };

      const result = await this.notificationService.markAsRead(id!, user);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Notification marked as read'));
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = {
        userId: req.user!.userId,
        employeeId: req.user?.employeeId,
        role: req.user!.role,
      };

      const result = await this.notificationService.markAllAsRead(user);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'All notifications marked as read'));
    } catch (error) {
      next(error);
    }
  };

  deleteNotification = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const user = {
        userId: req.user!.userId,
        employeeId: req.user?.employeeId,
        role: req.user!.role,
      };

      const result = await this.notificationService.deleteNotification(id!, user);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, result.message));
    } catch (error) {
      next(error);
    }
  };

  clearAllRead = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = {
        userId: req.user!.userId,
        employeeId: req.user?.employeeId,
        role: req.user!.role,
      };

      const result = await this.notificationService.clearAllRead(user);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, result.message));
    } catch (error) {
      next(error);
    }
  };

  createBroadcast = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const senderId = req.user?.employeeId || req.user?.userId;
      const senderName = req.user?.email || 'Corporate Administration';
      const result = await this.notificationService.createBroadcast(
        req.body,
        senderId,
        senderName
      );

      res
        .status(HttpStatusCode.CREATED)
        .json(ApiResponse.created(result, 'Company announcement broadcasted successfully'));
    } catch (error) {
      next(error);
    }
  };
}
