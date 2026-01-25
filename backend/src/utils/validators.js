import { z } from 'zod';

/**
 * Zod Validators สำหรับ CDS HR System
 */

// Validator สำหรับเลขบัตรประชาชน (13 หลัก)
export const idCardSchema = z.string()
  .length(13, 'เลขบัตรประชาชนต้องมี 13 หลัก')
  .regex(/^\d{13}$/, 'เลขบัตรประชาชนต้องเป็นตัวเลขเท่านั้น')
  .refine((val) => {
    // ตรวจสอบ checksum ของเลขบัตรประชาชนไทย
    if (val.length !== 13) return false;

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(val.charAt(i)) * (13 - i);
    }
    const checkDigit = (11 - (sum % 11)) % 10;
    return checkDigit === parseInt(val.charAt(12));
  }, 'เลขบัตรประชาชนไม่ถูกต้อง');

// Validator สำหรับเบอร์โทรศัพท์ (10 หลัก เริ่มต้นด้วย 0)
export const phoneSchema = z.string()
  .length(10, 'เบอร์โทรศัพท์ต้องมี 10 หลัก')
  .regex(/^0\d{9}$/, 'เบอร์โทรศัพท์ต้องเริ่มต้นด้วย 0 และมี 10 หลัก');

// Validator สำหรับวันที่ (รองรับทั้ง YYYY-MM-DD และ ISO String)
export const dateSchema = z.string()
  .refine((val) => {
    if (!val || val === '') return false;
    // รองรับ YYYY-MM-DD หรือแบบที่มีเวลาต่อท้าย (ISO String)
    const datePart = val.split('T')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return false;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'รูปแบบวันที่ต้องเป็น YYYY-MM-DD และเป็นวันที่ที่ถูกต้อง');

// Validator สำหรับเวลา
export const timeSchema = z.string()
  .refine((val) => {
    if (!val || val === '') return true;
    return /^\d{2}:\d{2}(:\d{2})?$/.test(val);
  }, 'รูปแบบเวลาต้องเป็น HH:MM หรือ HH:MM:SS');

// Employee Schema
export const employeeSchema = z.object({
  prefix: z.string().optional(),
  first_name: z.string().min(1, 'กรุณากรอกชื่อ'),
  last_name: z.string().min(1, 'กรุณากรอกนามสกุล'),
  id_card_number: idCardSchema,
  address: z.string().optional(),
  phone: z.string().optional().refine((val) => {
    if (!val || val === '') return true;
    return /^0\d{9}$/.test(val);
  }, 'เบอร์โทรศัพท์ต้องเริ่มต้นด้วย 0 และมี 10 หลัก'),
  nationality: z.string().default('ไทย'),
  birth_date: z.string().nullable().optional().refine((val) => {
    if (!val || val === '') return true;
    const datePart = val.split('T')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return false;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'รูปแบบวันที่ต้องเป็น YYYY-MM-DD'),
  hired_date: dateSchema,
  position_id: z.coerce.number().int().positive(),
  status: z.enum(['probation', 'internship', 'part-time', 'permanent', 'resigned']).default('probation'),
  employment_type: z.enum(['daily', 'monthly']),
  base_salary_or_wage: z.coerce.number().positive('เงินเดือน/ค่าแรงต้องมากกว่า 0'),
  bank_name: z.string().optional(),
  bank_account_no: z.string().optional(),
  work_start_time: z.string().optional(),
  work_end_time: z.string().optional(),
});

// Employee Update Schema (ทุกฟิลด์เป็น optional)
export const employeeUpdateSchema = employeeSchema.partial();

// Attendance Schema
export const attendanceSchema = z.object({
  employee_id: z.number().int().positive(),
  date: dateSchema,
  check_in_time: timeSchema.nullable().optional(),
  check_out_time: timeSchema.nullable().optional(),
  ot_hours: z.number().min(0).max(24).default(0),
  ot_amount: z.number().min(0).default(0),
  late_minutes: z.number().int().min(0).default(0),
  is_leave: z.boolean().default(false),
  leave_type: z.string().nullable().optional(),
  leave_hours: z.number().min(0).max(24).default(0),
  calculated_wage_daily: z.number().min(0).default(0),
  notes: z.string().nullable().optional(),
}).refine((data) => {
  // ถ้าลา ต้องระบุประเภทการลา
  if (data.is_leave && !data.leave_type) {
    return false;
  }
  return true;
}, {
  message: 'กรุณาระบุประเภทการลาเมื่อทำการลา',
  path: ['leave_type']
});

// Attendance Update Schema
export const attendanceUpdateSchema = z.object({
  check_in_time: timeSchema.nullable().optional(),
  check_out_time: timeSchema.nullable().optional(),
  ot_hours: z.number().min(0).max(24).optional(),
  ot_amount: z.number().min(0).optional(),
  late_minutes: z.number().int().min(0).optional(),
  is_leave: z.boolean().optional(),
  leave_type: z.string().nullable().optional(),
  leave_hours: z.number().min(0).max(24).optional(),
  calculated_wage_daily: z.number().min(0).optional(),
  notes: z.string().nullable().optional(),
});

// Batch Attendance Schema
export const batchAttendanceSchema = z.object({
  date: dateSchema,
  items: z.array(z.object({
    employee_id: z.number().int().positive(),
    check_in_time: timeSchema.nullable().optional(),
    check_out_time: timeSchema.nullable().optional(),
    ot_hours: z.number().min(0).max(24).default(0),
    is_leave: z.boolean().default(false),
    leave_type: z.string().nullable().optional(),
    leave_hours: z.number().min(0).max(24).default(0),
    notes: z.string().nullable().optional(),
  }))
});

// Position Schema
export const positionSchema = z.object({
  position_name: z.string().min(1, 'กรุณากรอกชื่อตำแหน่ง'),
  meal_allowance_per_day: z.number().min(0).default(0),
  monthly_allowance: z.number().min(0).default(0),
});

// System Config Schema
export const systemConfigSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  description: z.string().optional(),
  data_type: z.enum(['string', 'number', 'json', 'formula']).default('string'),
});

// Query Params Schema
export const attendanceQuerySchema = z.object({
  employee_id: z.string().regex(/^\d+$/).transform(Number),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'รูปแบบเดือนต้องเป็น YYYY-MM'),
});

// Range Query Schema
export const attendanceRangeQuerySchema = z.object({
  start_date: dateSchema,
  end_date: dateSchema,
});

/**
 * Middleware สำหรับ validate request body
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      req.validatedData = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'ข้อมูลไม่ถูกต้อง',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

/**
 * Middleware สำหรับ validate query params
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      req.validatedQuery = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'พารามิเตอร์ไม่ถูกต้อง',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

/**
 * Middleware สำหรับ validate params
 */
export const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      req.validatedParams = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'พารามิเตอร์ไม่ถูกต้อง',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

export default {
  idCardSchema,
  phoneSchema,
  dateSchema,
  timeSchema,
  employeeSchema,
  employeeUpdateSchema,
  attendanceSchema,
  attendanceUpdateSchema,
  batchAttendanceSchema,
  positionSchema,
  systemConfigSchema,
  attendanceQuerySchema,
  attendanceRangeQuerySchema,
  validateBody,
  validateQuery,
  validateParams
};
