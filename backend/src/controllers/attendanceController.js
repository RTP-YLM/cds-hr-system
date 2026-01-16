import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import Position from '../models/Position.js';
import SystemConfig from '../models/SystemConfig.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { calculateAttendanceWage, calculateLateMinutes } from '../utils/payrollCalculator.js';

/**
 * Attendance Controller
 */

// @desc   Get all attendance records
// @route  GET /api/attendance
export const getAttendanceRecords = asyncHandler(async (req, res) => {
  const filters = {
    employee_id: req.query.employee_id,
    date: req.query.date,
    start_date: req.query.start_date,
    end_date: req.query.end_date
  };

  const records = await Attendance.getAll(filters);

  res.json({
    success: true,
    count: records.length,
    data: records
  });
});

// @desc   Get attendance by employee and month
// @route  GET /api/attendance/:employee_id/:month
export const getAttendanceByMonth = asyncHandler(async (req, res) => {
  const { employee_id, month } = req.validatedParams || req.params;

  const employee = await Employee.getById(employee_id);
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'ไม่พบข้อมูลพนักงาน'
    });
  }

  const [records, summary] = await Promise.all([
    Attendance.getByEmployeeMonth(employee_id, month),
    Attendance.getSummaryByMonth(employee_id, month)
  ]);

  res.json({
    success: true,
    data: {
      employee,
      month,
      records,
      summary
    }
  });
});

// @desc   Get single attendance record
// @route  GET /api/attendance/:id
export const getAttendance = asyncHandler(async (req, res) => {
  const record = await Attendance.getById(req.params.id);

  if (!record) {
    return res.status(404).json({
      success: false,
      message: 'ไม่พบข้อมูลการเข้างาน'
    });
  }

  res.json({
    success: true,
    data: record
  });
});

// @desc   Create attendance record
// @route  POST /api/attendance
export const createAttendance = asyncHandler(async (req, res) => {
  const data = req.validatedData;

  // เช็คว่ามีบันทึกวันนี้แล้วหรือยัง
  const existing = await Attendance.getByEmployeeDate(data.employee_id, data.date);
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'มีบันทึกการเข้างานในวันนี้แล้ว'
    });
  }

  // ดึงข้อมูลพนักงานและตำแหน่ง
  const employee = await Employee.getById(data.employee_id);
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'ไม่พบข้อมูลพนักงาน'
    });
  }

  const position = await Position.getById(employee.position_id);
  const configs = await SystemConfig.getAllAsObject();

  // คำนวณนาทีที่สาย (ใช้เวลาเข้างานของพนักงานคนนั้น)
  if (data.check_in_time && !data.late_minutes) {
    const workStartTime = employee.work_start_time || configs.standard_check_in_time;
    data.late_minutes = calculateLateMinutes(data.check_in_time, workStartTime);
  }

  // คำนวณค่าแรง/เงินเดือนรายวัน
  if (!data.calculated_wage_daily) {
    data.calculated_wage_daily = calculateAttendanceWage(data, employee, position, configs);
  }

  const record = await Attendance.create(data);

  res.status(201).json({
    success: true,
    message: 'บันทึกการเข้างานสำเร็จ',
    data: record
  });
});

// @desc   Update attendance record
// @route  PATCH /api/attendance/:id
export const updateAttendance = asyncHandler(async (req, res) => {
  const record = await Attendance.getById(req.params.id);

  if (!record) {
    return res.status(404).json({
      success: false,
      message: 'ไม่พบข้อมูลการเข้างาน'
    });
  }

  const data = req.validatedData || req.body;

  // ดึงข้อมูลพนักงานและตำแหน่ง
  const employee = await Employee.getById(record.employee_id);
  const position = await Position.getById(employee.position_id);
  const configs = await SystemConfig.getAllAsObject();

  // คำนวณนาทีที่สายใหม่ ถ้ามีการเปลี่ยน check_in_time (ใช้เวลาเข้างานของพนักงานคนนั้น)
  if (data.check_in_time) {
    const workStartTime = employee.work_start_time || configs.standard_check_in_time;
    data.late_minutes = calculateLateMinutes(data.check_in_time, workStartTime);
  }

  // รวมข้อมูลเก่ากับใหม่
  const updatedData = {
    ...record,
    ...data
  };

  // คำนวณค่าแรง/เงินเดือนรายวันใหม่
  data.calculated_wage_daily = calculateAttendanceWage(updatedData, employee, position, configs);

  const updated = await Attendance.update(req.params.id, data);

  res.json({
    success: true,
    message: 'อัพเดทการเข้างานสำเร็จ',
    data: updated
  });
});

// @desc   Delete attendance record
// @route  DELETE /api/attendance/:id
export const deleteAttendance = asyncHandler(async (req, res) => {
  const record = await Attendance.getById(req.params.id);

  if (!record) {
    return res.status(404).json({
      success: false,
      message: 'ไม่พบข้อมูลการเข้างาน'
    });
  }

  await Attendance.delete(req.params.id);

  res.json({
    success: true,
    message: 'ลบการเข้างานสำเร็จ'
  });
});

// @desc   Get attendance summary
// @route  GET /api/attendance/summary/:employee_id/:month
export const getAttendanceSummary = asyncHandler(async (req, res) => {
  const { employee_id, month } = req.params;

  const employee = await Employee.getById(employee_id);
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'ไม่พบข้อมูลพนักงาน'
    });
  }

  const summary = await Attendance.getSummaryByMonth(employee_id, month);

  res.json({
    success: true,
    data: {
      employee,
      month,
      summary
    }
  });
});

// @desc   Batch upsert attendance records
// @route  POST /api/attendance/batch
export const batchUpsertAttendance = asyncHandler(async (req, res) => {
  const { date, items } = req.validatedData;
  const results = [];

  const configs = await SystemConfig.getAllAsObject();

  for (const item of items) {
    const employee = await Employee.getById(item.employee_id);
    if (!employee) continue;

    const position = await Position.getById(employee.position_id);

    const attendanceData = {
      ...item,
      date
    };

    // คำนวณนาทีที่สาย
    if (attendanceData.check_in_time && !attendanceData.is_leave) {
      const workStartTime = employee.work_start_time || configs.standard_check_in_time;
      attendanceData.late_minutes = calculateLateMinutes(attendanceData.check_in_time, workStartTime);
    } else {
      attendanceData.late_minutes = 0;
    }

    // คำนวณค่าแรง
    attendanceData.calculated_wage_daily = calculateAttendanceWage(attendanceData, employee, position, configs);

    const record = await Attendance.upsert(attendanceData);
    results.push(record);
  }

  res.status(200).json({
    success: true,
    message: `บันทึกข้อมูลสำเร็จ ${results.length} รายการ`,
    data: results
  });
});

export default {
  getAttendanceRecords,
  getAttendanceByMonth,
  getAttendance,
  createAttendance,
  updateAttendance,
  batchUpsertAttendance,
  deleteAttendance,
  getAttendanceSummary
};
