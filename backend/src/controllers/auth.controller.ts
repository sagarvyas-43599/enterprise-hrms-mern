import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/apiResponse';
import { HttpStatusCode } from '../constants/enums';
import { LoginInput, RegisterUserInput, ChangePasswordInput, RefreshTokenInput } from '../validations/auth.validation';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input: LoginInput = req.body;
      const result = await this.authService.login(input);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Authentication successful'));
    } catch (error) {
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input: RegisterUserInput = req.body;
      const result = await this.authService.register(input);

      res
        .status(HttpStatusCode.CREATED)
        .json(ApiResponse.created(result, 'User and Employee account created successfully'));
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const result = await this.authService.getCurrentUser(userId);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Profile retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const input: ChangePasswordInput = req.body;
      const result = await this.authService.changePassword(userId, input);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Password changed successfully'));
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input: RefreshTokenInput = req.body;
      const result = await this.authService.refreshToken(input.refreshToken);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Token refreshed successfully'));
    } catch (error) {
      next(error);
    }
  };
}
