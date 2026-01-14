/**
 * Position Types
 */

export interface Position {
  id: number;
  position_name: string;
  meal_allowance_per_day: number;
  monthly_allowance: number;
  created_at: string;
  updated_at: string;

  // Additional fields
  employee_count?: string;
}

export interface CreatePositionInput {
  position_name: string;
  meal_allowance_per_day?: number;
  monthly_allowance?: number;
}

export interface UpdatePositionInput extends Partial<CreatePositionInput> {}
