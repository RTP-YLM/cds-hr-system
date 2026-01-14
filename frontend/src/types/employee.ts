/**
 * Employee Types
 */

export type EmployeeStatus = 'probation' | 'internship' | 'part-time' | 'permanent' | 'resigned';
export type EmploymentType = 'daily' | 'monthly';

export interface Employee {
  id: number;
  prefix?: string;
  first_name: string;
  last_name: string;
  id_card_number: string;
  address?: string;
  phone?: string;
  nationality?: string;
  birth_date?: string;
  hired_date: string;
  position_id: number;
  status: EmployeeStatus;
  employment_type: EmploymentType;
  base_salary_or_wage: number;
  bank_name?: string;
  bank_account_no?: string;
  profile_image_url?: string;
  contract_file_url?: string;
  work_start_time?: string;
  work_end_time?: string;
  created_at: string;
  updated_at: string;

  // Relations
  position_name?: string;
  meal_allowance_per_day?: number;
  monthly_allowance?: number;
}

export interface CreateEmployeeInput {
  prefix?: string;
  first_name: string;
  last_name: string;
  id_card_number: string;
  address?: string;
  phone?: string;
  nationality?: string;
  birth_date?: string;
  hired_date: string;
  position_id: number;
  status?: EmployeeStatus;
  employment_type: EmploymentType;
  base_salary_or_wage: number;
  bank_name?: string;
  bank_account_no?: string;
  work_start_time?: string;
  work_end_time?: string;
}

export interface UpdateEmployeeInput extends Partial<CreateEmployeeInput> {}

export interface EmployeeStats {
  byStatus: Array<{ status: string; count: string }>;
  byType: Array<{ employment_type: string; count: string }>;
}

export interface EmployeeFilters {
  status?: EmployeeStatus;
  employment_type?: EmploymentType;
  position_id?: number;
  search?: string;
}
