import { Types, FilterQuery } from 'mongoose';
import {
  JobPostingsQueryParams,
  CandidatesQueryParams,
  CreateJobPostingInput,
  UpdateJobPostingInput,
  CreateCandidateInput,
} from '../validations/recruitment.validation';
import {
  JobPostingModel,
  CandidateModel,
  IJobPosting,
  ICandidate,
  JobStatus,
  CandidateStage,
} from '../models/recruitment.model';
import { ApiError } from '../utils/apiResponse';

export class RecruitmentService {
  // 1. Job Postings
  async getJobPostings(query: JobPostingsQueryParams) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IJobPosting> = { isDeleted: false };
    if (query.status) filter.status = query.status;
    if (query.departmentId) filter.departmentId = new Types.ObjectId(query.departmentId);
    
    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [
        { title: searchRegex },
        { jobCode: searchRegex },
        { location: searchRegex }
      ];
    }

    const [jobs, total] = await Promise.all([
      JobPostingModel.find(filter)
        .populate('departmentId', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      JobPostingModel.countDocuments(filter),
    ]);

    return {
      jobs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async createJobPosting(payload: Partial<IJobPosting>) {
    const existing = await JobPostingModel.findOne({
      jobCode: payload.jobCode?.toUpperCase().trim(),
      isDeleted: false,
    });
    if (existing) {
      throw ApiError.conflict(`Job Code '${payload.jobCode}' already exists`);
    }

    const job = await JobPostingModel.create({
      ...payload,
      jobCode: payload.jobCode?.toUpperCase().trim(),
      isDeleted: false,
    });

    return job;
  }

  async updateJobPosting(id: string, payload: Partial<IJobPosting>) {
    const job = await JobPostingModel.findById(id);
    if (!job || job.isDeleted) {
      throw ApiError.notFound('Job posting not found');
    }

    Object.assign(job, payload);
    await job.save();

    return job;
  }

  async deleteJobPosting(id: string) {
    const job = await JobPostingModel.findById(id);
    if (!job || job.isDeleted) {
      throw ApiError.notFound('Job posting not found');
    }

    job.isDeleted = true;
    await job.save();

    return { success: true };
  }

  // 2. Candidates
  async getCandidates(query: CandidatesQueryParams) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<ICandidate> = { isDeleted: false };
    if (query.jobId) filter.jobId = new Types.ObjectId(query.jobId);
    if (query.stage && query.stage !== 'ALL') filter.stage = query.stage;

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [
        { fullName: searchRegex },
        { candidateCode: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    const [candidates, total] = await Promise.all([
      CandidateModel.find(filter)
        .populate('jobId', 'title jobCode location')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      CandidateModel.countDocuments(filter),
    ]);

    return {
      candidates,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async createCandidate(payload: Partial<ICandidate>) {
    const code = `CAN-${Date.now().toString().slice(-4)}`;
    const candidate = await CandidateModel.create({
      ...payload,
      candidateCode: code,
      stage: CandidateStage.APPLIED,
      isDeleted: false,
    });

    return candidate;
  }

  async updateCandidateStage(
    id: string,
    stage: CandidateStage,
    rating?: number,
    notes?: string
  ) {
    const candidate = await CandidateModel.findById(id);
    if (!candidate || candidate.isDeleted) {
      throw ApiError.notFound('Candidate record not found');
    }

    candidate.stage = stage;
    if (rating !== undefined) candidate.rating = rating;
    if (notes !== undefined) candidate.interviewerNotes = notes;

    await candidate.save();
    return candidate;
  }

  // 3. Recruitment Metrics
  async getRecruitmentMetrics() {
    const [jobs, candidates] = await Promise.all([
      JobPostingModel.find({ isDeleted: false }),
      CandidateModel.find({ isDeleted: false }),
    ]);

    const openJobs = jobs.filter((j) => j.status === JobStatus.OPEN);
    const totalOpenings = openJobs.reduce((sum, j) => sum + (j.openPositions || 1), 0);

    const interviews = candidates.filter(
      (c) =>
        c.stage === CandidateStage.INTERVIEW_SCHEDULED ||
        c.stage === CandidateStage.TECHNICAL_EVALUATION
    ).length;

    const hired = candidates.filter((c) => c.stage === CandidateStage.HIRED).length;
    const offers = candidates.filter((c) => c.stage === CandidateStage.OFFER_EXTENDED).length;

    return {
      activeOpenings: totalOpenings,
      openJobRoles: openJobs.length,
      totalApplicants: candidates.length,
      interviewsScheduled: interviews,
      offersExtended: offers,
      hiredCount: hired,
    };
  }
}
