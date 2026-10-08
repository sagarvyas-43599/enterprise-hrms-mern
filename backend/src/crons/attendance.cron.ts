import cron from 'node-cron';
import { AttendanceModel } from '../models/attendance.model';
import { EmployeeModel } from '../models/employee.model';
import { LeaveModel } from '../models/leave.model';
import { logger } from '../utils/logger';
import { AttendanceStatus, LeaveStatus } from '../constants/enums';
import { Types } from 'mongoose';

export const startAttendanceCron = () => {
  // Run every night at 11:59 PM (23:59)
  cron.schedule('59 23 * * *', async () => {
    logger.info('Running Auto-Checkout Cron Job...');
    
    try {
      const today = new Date().toISOString().split('T')[0];

      // Find all attendances that are missing clockOut
      const pendingAttendances = await AttendanceModel.find({
        clockOut: null,
        status: AttendanceStatus.PRESENT
      });

      if (pendingAttendances.length === 0) {
        logger.info('No pending auto-checkouts found for today.');
        return;
      }

      logger.info(`Found ${pendingAttendances.length} users who forgot to punch out. Auto-checking out...`);

      let updatedCount = 0;

      for (const attendance of pendingAttendances) {
        // Standard shift is 9 hours
        const STANDARD_SHIFT_MINUTES = 9 * 60;
        
        // Assume they worked exactly 9 hours from clockIn
        const clockInTime = new Date(attendance.clockIn);
        const clockOutTime = new Date(clockInTime.getTime() + STANDARD_SHIFT_MINUTES * 60000);
        
        attendance.clockOut = clockOutTime;
        attendance.workDurationMinutes = STANDARD_SHIFT_MINUTES;
        attendance.overtimeMinutes = 0;
        attendance.shortfallMinutes = 0;
        
        // Append auto-checkout remark
        const autoRemark = '[System Auto-Checkout]';
        attendance.remarks = attendance.remarks ? `${attendance.remarks} | ${autoRemark}` : autoRemark;
        
        await attendance.save();
        updatedCount++;
      }

      logger.info(`Successfully auto-checked out ${updatedCount} employees.`);

      // ----------------------------------------------------------------------
      // PHASE 2: AUTO-ABSENT 
      // Anyone who hasn't punched in at all today gets marked as ABSENT
      // ----------------------------------------------------------------------
      logger.info('Running Auto-Absent Job...');
      
      const allActiveEmployees = await EmployeeModel.find({ isDeleted: false }).lean();
      let absentCount = 0;

      for (const emp of allActiveEmployees) {
        // 1. Did they punch in today?
        const hasAttendance = await AttendanceModel.exists({
          employeeId: emp._id,
          date: today,
          isDeleted: false
        });

        if (!hasAttendance) {
          // 2. Are they on an approved leave today?
          // We check if today's date falls between startDate and endDate
          const currentDateTime = new Date();
          const isOnLeave = await LeaveModel.exists({
            employeeId: emp._id,
            approvalStatus: LeaveStatus.APPROVED,
            startDate: { $lte: currentDateTime },
            endDate: { $gte: currentDateTime },
            isDeleted: false
          });

          if (!isOnLeave) {
            // 3. Mark as Absent
            await AttendanceModel.create({
              employeeId: emp._id,
              date: today,
              clockIn: currentDateTime, // Required field
              clockOut: currentDateTime,
              status: AttendanceStatus.ABSENT,
              workDurationMinutes: 0,
              overtimeMinutes: 0,
              shortfallMinutes: 9 * 60, // Total shortfall for absent
              remarks: '[System Auto-Absent]',
            });
            absentCount++;
          }
        }
      }

      logger.info(`Successfully marked ${absentCount} employees as ABSENT.`);
    } catch (error) {
      logger.error({ err: error }, 'Error running Auto-Checkout Cron Job');
    }
  });

  logger.info('⏰ Auto-Checkout Cron Job Scheduled (Runs daily at 23:59)');
};
