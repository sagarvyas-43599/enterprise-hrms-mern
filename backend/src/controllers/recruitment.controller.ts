import { Request, Response, NextFunction } from 'express';
import { RecruitmentService } from '../services/recruitment.service';
import { ApiResponse } from '../utils/apiResponse';
import { HttpStatusCode } from '../constants/enums';
import {
  JobPostingsQueryParams,
  CandidatesQueryParams,
} from '../validations/recruitment.validation';

export class RecruitmentController {
  private recruitmentService: RecruitmentService;

  constructor() {
    this.recruitmentService = new RecruitmentService();
  }

  // Jobs
  getJobPostings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.recruitmentService.getJobPostings(req.query as any as JobPostingsQueryParams);
      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Job openings retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  createJobPosting = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.recruitmentService.createJobPosting(req.body);
      res
        .status(HttpStatusCode.CREATED)
        .json(ApiResponse.created(result, 'Job opening created successfully'));
    } catch (error) {
      next(error);
    }
  };

  updateJobPosting = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.recruitmentService.updateJobPosting(id!, req.body);
      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Job opening updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteJobPosting = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.recruitmentService.deleteJobPosting(id!);
      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(null, 'Job opening archived successfully'));
    } catch (error) {
      next(error);
    }
  };

  // Candidates
  getCandidates = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.recruitmentService.getCandidates(req.query as any as CandidatesQueryParams);
      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Candidate pipeline retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  createCandidate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.recruitmentService.createCandidate(req.body);
      res
        .status(HttpStatusCode.CREATED)
        .json(ApiResponse.created(result, 'Candidate applicant registered successfully'));
    } catch (error) {
      next(error);
    }
  };

  updateCandidateStage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { stage, rating, interviewerNotes } = req.body;
      const result = await this.recruitmentService.updateCandidateStage(
        id!,
        stage,
        rating,
        interviewerNotes
      );
      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Candidate stage updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  getMetrics = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.recruitmentService.getRecruitmentMetrics();
      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Recruitment metrics retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };
}
