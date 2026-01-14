/**
 * System Config Types
 */

export type ConfigDataType = 'string' | 'number' | 'json' | 'formula';

export interface SystemConfig {
  id: number;
  key: string;
  value: string;
  description?: string;
  data_type: ConfigDataType;
  created_at: string;
  updated_at: string;
}

export interface CreateConfigInput {
  key: string;
  value: string;
  description?: string;
  data_type?: ConfigDataType;
}

export interface UpdateConfigInput extends Partial<CreateConfigInput> {}

export interface ConfigObject {
  [key: string]: string | number | any;
  late_fine_per_minute: number;
  standard_check_in_time: string;
  standard_check_out_time: string;
  ot_rate_multiplier: number;
  leave_sick_deduction: number;
  leave_personal_deduction: number;
  leave_vacation_deduction: number;
  work_days_per_month: number;
  daily_work_hours: number;
}
