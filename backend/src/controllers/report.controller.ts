import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { ApiResponse } from '../utils/apiResponse';
import { HttpStatusCode } from '../constants/enums';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  getExecutiveSummary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.reportService.getExecutiveSummary(req.query);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Executive BI reports and analytics retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };
}
