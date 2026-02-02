-- Migration: Add leave_hours column to attendance table
-- Date: 2026-02-02
-- Description: เพิ่ม column leave_hours สำหรับบันทึกจำนวนชั่วโมงลา

ALTER TABLE hr_system.attendance 
ADD COLUMN IF NOT EXISTS leave_hours DECIMAL(5, 2) DEFAULT 0.00;

COMMENT ON COLUMN hr_system.attendance.leave_hours IS 'จำนวนชั่วโมงลา (0-24)';
