import { connect } from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

import { AttendanceModel } from '../src/models/attendance.model';
import { EmployeeModel } from '../src/models/employee.model';
import { AttendanceStatus } from '../src/constants/enums';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hrms';

function generateRandomAttendanceForDay(date: Date, employeeId: any) {
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  
  if (isWeekend) {
    return null; // Skip weekends or maybe we can mark as OFF, but let's skip
  }

  const random = Math.random();
  let status = AttendanceStatus.PRESENT;
  if (random > 0.95) status = AttendanceStatus.ABSENT;
  else if (random > 0.90) status = AttendanceStatus.ON_LEAVE;
  else if (random > 0.85) status = AttendanceStatus.HALF_DAY;
  else if (random > 0.75) status = AttendanceStatus.WORK_FROM_HOME;

  // clockIn around 9 AM +/- 30 mins
  const clockIn = new Date(date);
  clockIn.setHours(9, Math.floor(Math.random() * 60), 0, 0);

  // clockOut around 6 PM +/- 30 mins (9 hours later)
  const clockOut = new Date(clockIn);
  let durationMinutes = 0;
  
  if (status === AttendanceStatus.ABSENT || status === AttendanceStatus.ON_LEAVE) {
    return {
      employeeId,
      date: date.toISOString().split('T')[0],
      clockIn: new Date(date.setHours(0,0,0,0)), // dummy clock in for absent
      status,
      workDurationMinutes: 0
    };
  } else if (status === AttendanceStatus.HALF_DAY) {
    clockOut.setHours(clockIn.getHours() + 4, Math.floor(Math.random() * 30), 0, 0);
    durationMinutes = Math.round((clockOut.getTime() - clockIn.getTime()) / 60000);
  } else {
    clockOut.setHours(clockIn.getHours() + 9, Math.floor(Math.random() * 30), 0, 0);
    durationMinutes = Math.round((clockOut.getTime() - clockIn.getTime()) / 60000);
  }

  return {
    employeeId,
    date: date.toISOString().split('T')[0],
    clockIn,
    clockOut,
    status,
    workDurationMinutes: durationMinutes,
    location: {
      latitude: 28.6139 + (Math.random() * 0.1),
      longitude: 77.2090 + (Math.random() * 0.1),
      address: 'Corporate Office Area'
    },
    ipAddress: '192.168.1.' + Math.floor(Math.random() * 255)
  };
}

async function seedAttendance() {
  try {
    await connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const employees = await EmployeeModel.find({ isDeleted: false });
    console.log(`Found ${employees.length} employees`);

    if (employees.length === 0) {
      console.log('No employees found. Cannot seed attendance.');
      process.exit(0);
    }

    let recordsInserted = 0;
    
    // For each employee, generate attendance for last 30 days
    const today = new Date();
    
    for (const emp of employees) {
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        
        const record = generateRandomAttendanceForDay(d, emp._id);
        
        if (record) {
          // Check if exists
          const exists = await AttendanceModel.findOne({ employeeId: emp._id, date: record.date });
          if (!exists) {
            await AttendanceModel.create(record);
            recordsInserted++;
          }
        }
      }
    }

    console.log(`Successfully added ${recordsInserted} attendance records.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedAttendance();
