import { connect } from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Adjust path if needed
dotenv.config({ path: path.join(__dirname, '../.env') });

import { DepartmentModel } from '../src/models/department.model';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hrms';

const departments = [
  { code: 'D-006', name: 'Information Security', description: 'Manages enterprise security and compliance.', annualBudget: 2500000 },
  { code: 'D-007', name: 'Quality Assurance', description: 'Product testing and quality control.', annualBudget: 1500000 },
  { code: 'D-008', name: 'Customer Success', description: 'Client onboarding and success management.', annualBudget: 3200000 },
  { code: 'D-009', name: 'Business Development', description: 'New business acquisition and partnerships.', annualBudget: 4100000 },
  { code: 'D-010', name: 'Data Science & AI', description: 'Advanced analytics and machine learning.', annualBudget: 6000000 },
  { code: 'D-011', name: 'Public Relations', description: 'Corporate communications and PR.', annualBudget: 1200000 },
  { code: 'D-012', name: 'Legal & Compliance', description: 'Legal advisory and regulatory compliance.', annualBudget: 2800000 },
  { code: 'D-013', name: 'Procurement', description: 'Vendor management and purchasing.', annualBudget: 1900000 },
  { code: 'D-014', name: 'Infrastructure & Cloud', description: 'IT infrastructure and cloud operations.', annualBudget: 8500000 },
  { code: 'D-015', name: 'Internal Audit', description: 'Financial and operational auditing.', annualBudget: 1100000 },
  { code: 'D-016', name: 'Creative Studio', description: 'Graphic design and video production.', annualBudget: 1400000 },
  { code: 'D-017', name: 'Research & Development', description: 'Innovation and new product R&D.', annualBudget: 9500000 },
  { code: 'D-018', name: 'Talent Acquisition', description: 'Recruitment and hiring strategy.', annualBudget: 1300000 },
  { code: 'D-019', name: 'Global Strategy', description: 'International expansion and strategy.', annualBudget: 5500000 },
  { code: 'D-020', name: 'Logistics & Supply', description: 'Supply chain management.', annualBudget: 3800000 },
  { code: 'D-021', name: 'Learning & Development', description: 'Employee training and growth.', annualBudget: 1600000 },
  { code: 'D-022', name: 'Corporate Social Responsibility', description: 'Community outreach and CSR initiatives.', annualBudget: 900000 },
  { code: 'D-023', name: 'Investor Relations', description: 'Shareholder communication and relations.', annualBudget: 1000000 },
  { code: 'D-024', name: 'Facilities Management', description: 'Office management and facilities.', annualBudget: 2100000 },
  { code: 'D-025', name: 'Enterprise Architecture', description: 'Systems architecture and planning.', annualBudget: 3400000 },
];

async function seedDepartments() {
  try {
    await connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    let count = 0;
    for (const dept of departments) {
      const exists = await DepartmentModel.findOne({ code: dept.code });
      if (!exists) {
        await DepartmentModel.create({ ...dept, isActive: true, isDeleted: false });
        count++;
      }
    }
    
    console.log(`Successfully added ${count} new departments.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDepartments();
