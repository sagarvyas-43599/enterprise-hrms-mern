import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import { connectDatabase, disconnectDatabase } from '../config/database';
import { UserModel } from '../models/user.model';
import { EmployeeModel } from '../models/employee.model';
import { DepartmentModel, DesignationModel } from '../models/department.model';
import { PolicyModel } from '../models/policy.model';
import { UserRole, PolicyCategory, PolicyStatus } from '../constants/enums';
import { logger } from '../utils/logger';

export const seedDatabase = async () => {
  logger.info('🌱 Starting Enterprise HRMS Database Seeder...');
  await connectDatabase();

  try {
    const commonPassword = 'Password@123';

    // 1. All 4 Enterprise Roles Definition
    const corporateUsers = [
      {
        email: 'superadmin@company.com',
        role: UserRole.SUPER_ADMIN,
        empId: 'EMP001',
        firstName: 'Chief',
        lastName: 'Executive',
        department: 'Executive Leadership',
        designation: 'Chief Executive Officer',
        phone: '+91 9876543210',
      },
      {
        email: 'hradmin@company.com',
        role: UserRole.HR_ADMIN,
        empId: 'EMP002',
        firstName: 'Ananya',
        lastName: 'Sharma',
        department: 'Human Resources',
        designation: 'Head of Human Resources',
        phone: '+91 9876543211',
      },
      {
        email: 'manager@company.com',
        role: UserRole.MANAGER,
        empId: 'EMP003',
        firstName: 'Rajesh',
        lastName: 'Verma',
        department: 'Engineering & Technology',
        designation: 'Engineering Manager',
        phone: '+91 9876543212',
      },
      {
        email: 'employee@company.com',
        role: UserRole.EMPLOYEE,
        empId: 'EMP004',
        firstName: 'Aarav',
        lastName: 'Patel',
        department: 'Engineering & Technology',
        designation: 'Senior Software Engineer',
        phone: '+91 9876543213',
      },
    ];

    const seededEmployees = new Map<string, any>();

    for (const u of corporateUsers) {
      let user = await UserModel.findOne({ email: u.email });
      if (!user) {
        user = await UserModel.create({
          email: u.email,
          passwordHash: commonPassword,
          role: u.role,
          isActive: true,
          isDeleted: false,
        });
        logger.info(`✅ User created: ${u.email} (${u.role})`);
      } else {
        // Ensure active and password reset to common password
        user.passwordHash = commonPassword;
        user.isActive = true;
        user.isDeleted = false;
        user.role = u.role;
        await user.save();
        logger.info(`🔄 User updated with common password: ${u.email} (${u.role})`);
      }

      let employee = await EmployeeModel.findOne({ empId: u.empId });
      if (!employee) {
        employee = await EmployeeModel.create({
          userId: user._id,
          empId: u.empId,
          firstName: u.firstName,
          lastName: u.lastName,
          department: u.department,
          designation: u.designation,
          phone: u.phone,
          joinedAt: new Date(),
          isDeleted: false,
        });
        logger.info(`✅ Employee profile created: ${u.empId} - ${u.firstName} ${u.lastName}`);
      } else {
        employee.userId = user._id;
        employee.firstName = u.firstName;
        employee.lastName = u.lastName;
        employee.department = u.department;
        employee.designation = u.designation;
        employee.phone = u.phone;
        employee.isDeleted = false;
        await employee.save();
        logger.info(`🔄 Employee profile updated: ${u.empId}`);
      }

      seededEmployees.set(u.empId, employee);
    }

    // Link Manager hierarchy: Employee EMP004 reports to Manager EMP003
    const managerEmp = seededEmployees.get('EMP003');
    const staffEmp = seededEmployees.get('EMP004');
    if (managerEmp && staffEmp) {
      staffEmp.reportingManagerId = managerEmp._id;
      await staffEmp.save();
      logger.info('🔗 Manager reporting hierarchy established (EMP004 -> EMP003)');
    }

    // 2. Seed Standard Enterprise Departments
    const adminEmployee = seededEmployees.get('EMP001');
    const defaultDepartments = [
      { code: 'DEP-EXEC', name: 'Executive Leadership', description: 'C-Suite and executive direction', annualBudget: 50000000 },
      { code: 'DEP-ENG', name: 'Engineering & Technology', description: 'Software architecture, development and DevOps', annualBudget: 35000000 },
      { code: 'DEP-HR', name: 'Human Resources', description: 'Talent acquisition, employee welfare and payroll', annualBudget: 10000000 },
      { code: 'DEP-FIN', name: 'Finance & Accounts', description: 'Corporate taxation, financial planning and audit', annualBudget: 8000000 },
      { code: 'DEP-OPS', name: 'Operations & Facilities', description: 'Infrastructure, facilities and admin operations', annualBudget: 6000000 },
    ];

    for (const dept of defaultDepartments) {
      const exists = await DepartmentModel.findOne({ code: dept.code });
      if (!exists) {
        await DepartmentModel.create({
          ...dept,
          headOfDepartmentId: adminEmployee?._id,
          isActive: true,
          isDeleted: false,
        });
      }
    }
    logger.info('✅ Standard enterprise departments verified/seeded');

    // 3. Seed Standard Designations
    const engDept = await DepartmentModel.findOne({ code: 'DEP-ENG' });
    if (engDept) {
      const defaultDesignations = [
        { code: 'DSG-CTO', title: 'Chief Technology Officer', departmentId: engDept._id, payGrade: 'EXEC', minSalary: 6000000, maxSalary: 12000000 },
        { code: 'DSG-ARCH', title: 'Principal Software Architect', departmentId: engDept._id, payGrade: 'L6', minSalary: 4500000, maxSalary: 8000000 },
        { code: 'DSG-SDE3', title: 'Staff Software Engineer', departmentId: engDept._id, payGrade: 'L4', minSalary: 2800000, maxSalary: 4500000 },
        { code: 'DSG-SDE2', title: 'Senior Software Engineer', departmentId: engDept._id, payGrade: 'L3', minSalary: 1600000, maxSalary: 2800000 },
      ];

      for (const desg of defaultDesignations) {
        const exists = await DesignationModel.findOne({ code: desg.code });
        if (!exists) {
          await DesignationModel.create({ ...desg, isActive: true, isDeleted: false });
        }
      }
      logger.info('✅ Standard corporate designations seeded');
    }

    // 4. Seed Mandatory Company Policies
    const defaultPolicies = [
      {
        code: 'POL-COC-2026',
        title: 'Corporate Code of Conduct & Ethical Business Standards',
        category: PolicyCategory.CODE_OF_CONDUCT,
        description: 'Mandatory ethics, anti-bribery, workplace harassment (POSH), and anti-discrimination standards.',
        content: 'All employees must maintain the highest standards of professional integrity, respect, and compliance with national and international laws.',
        isMandatory: true,
        status: PolicyStatus.PUBLISHED,
      },
      {
        code: 'POL-IT-SEC-2026',
        title: 'Enterprise Information Security & Data Protection Policy',
        category: PolicyCategory.IT_SECURITY,
        description: 'Mandatory information security standards, two-factor authentication, remote device compliance, and data governance.',
        content: 'Company data must remain confidential. Access to internal production databases, repositories, and servers must strictly utilize MFA credentials.',
        isMandatory: true,
        status: PolicyStatus.PUBLISHED,
      },
    ];

    for (const policy of defaultPolicies) {
      const exists = await PolicyModel.findOne({ code: policy.code });
      if (!exists) {
        await PolicyModel.create({ ...policy, isDeleted: false });
      }
    }
    logger.info('✅ Mandatory enterprise policies verified/seeded');

    logger.info('🎉 Database seeding completed successfully with all 4 corporate roles!');
  } catch (error) {
    logger.error({ err: error }, '❌ Database seeding failed');
    throw error;
  } finally {
    await disconnectDatabase();
  }
};

// Direct script execution handler
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
