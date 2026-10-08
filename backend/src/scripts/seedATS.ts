import mongoose from 'mongoose';
import { env } from '../config/env.config';
import { DepartmentModel } from '../models/department.model';
import { JobPostingModel, CandidateModel, ICandidate, IJobPosting, EmploymentType, JobStatus, CandidateStage } from '../models/recruitment.model'; 
import { DocumentModel, DocumentCategory, DocumentStatus } from '../models/document.model';
import { EmployeeModel } from '../models/employee.model';

const seed = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const department = await DepartmentModel.findOne();
    const employee = await EmployeeModel.findOne();

    if (!department || !employee) {
      console.log('No department or employee found to associate with. Exiting.');
      return;
    }

    // 1. Create Job Postings
    const job1 = await JobPostingModel.create({
      jobCode: 'ENG-FE-001',
      title: 'Senior Frontend Engineer',
      departmentId: department._id,
      employmentType: 'FULL_TIME',
      location: 'Bengaluru (Hybrid)',
      experienceMinYears: 4,
      salaryMin: 1500000,
      salaryMax: 2500000,
      openPositions: 2,
      status: 'OPEN',
      description: 'We are looking for a Senior Frontend Engineer to build and optimize our enterprise HRMS web application.',
      requirements: 'Experience with React, Next.js, TypeScript, Tailwind CSS, and RTK Query.'
    });

    const job2 = await JobPostingModel.create({
      jobCode: 'ENG-BE-002',
      title: 'Backend Developer (Node.js)',
      departmentId: department._id,
      employmentType: 'FULL_TIME',
      location: 'Remote',
      experienceMinYears: 3,
      salaryMin: 1200000,
      salaryMax: 2000000,
      openPositions: 1,
      status: 'OPEN',
      description: 'Join our backend team to build scalable microservices and APIs for our HR platform.',
      requirements: 'Strong experience in Node.js, Express, MongoDB, and RESTful APIs.'
    });

    const job3 = await JobPostingModel.create({
      jobCode: 'HR-TA-001',
      title: 'Talent Acquisition Specialist',
      departmentId: department._id,
      employmentType: 'FULL_TIME',
      location: 'Mumbai (On-site)',
      experienceMinYears: 2,
      salaryMin: 600000,
      salaryMax: 1000000,
      openPositions: 1,
      status: 'OPEN',
      description: 'Looking for a TA specialist to help us scale our engineering and sales teams.',
      requirements: 'Proven experience in tech recruitment and sourcing.'
    });

    console.log('Created Job Postings');

    // 2. Create Candidates
    await CandidateModel.create({
      candidateCode: 'CAN-0001',
      jobId: job1._id,
      fullName: 'Rahul Verma',
      email: 'rahul.verma@example.com',
      phone: '+919876543210',
      currentCompany: 'Tech Corp',
      expectedSalary: 2000000,
      stage: 'INTERVIEW_SCHEDULED',
      rating: 4,
      interviewerNotes: 'Strong React skills, good communication.'
    });

    await CandidateModel.create({
      candidateCode: 'CAN-0002',
      jobId: job1._id,
      fullName: 'Neha Sharma',
      email: 'neha.s@example.com',
      phone: '+919876543211',
      currentCompany: 'Startup Inc',
      expectedSalary: 1800000,
      stage: 'APPLIED',
      rating: 0
    });

    await CandidateModel.create({
      candidateCode: 'CAN-0003',
      jobId: job2._id,
      fullName: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      phone: '+919876543212',
      currentCompany: 'Enterprise IT',
      expectedSalary: 2200000,
      stage: 'TECHNICAL_EVALUATION',
      rating: 5,
      interviewerNotes: 'Excellent understanding of Node.js event loop and MongoDB indexing.'
    });

    console.log('Created Candidates');

    // 3. Create Documents for Vault
    await DocumentModel.create({
      employee: employee._id,
      title: 'Aadhar Card',
      category: DocumentCategory.IDENTITY,
      fileUrl: 'https://example.com/aadhar.pdf',
      fileType: 'application/pdf',
      fileSize: 1048576,
      status: DocumentStatus.VERIFIED,
      verifiedBy: employee._id
    });

    await DocumentModel.create({
      employee: employee._id,
      title: 'B.Tech Degree Certificate',
      category: DocumentCategory.EDUCATION,
      fileUrl: 'https://example.com/degree.pdf',
      fileType: 'application/pdf',
      fileSize: 2048576,
      status: DocumentStatus.PENDING_VERIFICATION
    });

    await DocumentModel.create({
      employee: employee._id,
      title: 'Previous Company Relieving Letter',
      category: DocumentCategory.EMPLOYMENT,
      fileUrl: 'https://example.com/relieving.pdf',
      fileType: 'application/pdf',
      fileSize: 512000,
      status: DocumentStatus.PENDING_VERIFICATION
    });

    console.log('Created Documents');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seed();
