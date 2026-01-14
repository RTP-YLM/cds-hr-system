/**
 * Attendance Types
 */

export type LeaveType = 'sick' | 'personal' | 'vacation' | 'ลาป่วย' | 'ลากิจ' | 'ลาพักร้อน';

export interface Attendance {
  id: number;
  employee_id: number;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  ot_hours: number;
  ot_amount: number;
  late_minutes: number;
  is_leave: boolean;
  leave_type?: LeaveType | string;
  calculated_wage_daily: number;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Relations
  first_name?: string;
  last_name?: string;
  employment_type?: string;
  base_salary_or_wage?: number;
  position_name?: string;
  meal_allowance_per_day?: number;
  monthly_allowance?: number;
}

export interface CreateAttendanceInput {
  employee_id: number;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  ot_hours?: number;
  ot_amount?: number;
  late_minutes?: number;
  is_leave?: boolean;
  leave_type?: LeaveType | string;
  calculated_wage_daily?: number;
  notes?: string;
}

export interface UpdateAttendanceInput extends Partial<CreateAttendanceInput> {}

export interface AttendanceSummary {
  total_days: string;
  days_attended: string;
  days_leave: string;
  total_ot_hours: string;
  total_ot_amount: string;
  total_late_minutes: string;
  total_wage: string;
}

export interface AttendanceFilters {
  employee_id?: number;
  date?: string;
  start_date?: string;
  end_date?: string;
}

export interface AttendanceMonthData {
  employee: any;
  month: string;
  records: Attendance[];
  summary: AttendanceSummary;
}
