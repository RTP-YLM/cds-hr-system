-- CDS HR System Database Schema
-- Database: cds-hr
-- Schema: hr_system

-- Create schema
CREATE SCHEMA IF NOT EXISTS hr_system;

SET search_path TO hr_system;

-- Drop tables if exists (for development)
DROP TABLE IF EXISTS hr_system.attendance CASCADE;
DROP TABLE IF EXISTS hr_system.employees CASCADE;
DROP TABLE IF EXISTS hr_system.positions CASCADE;
DROP TABLE IF EXISTS hr_system.system_configs CASCADE;

-- Table: Positions
CREATE TABLE hr_system.positions (
    id SERIAL PRIMARY KEY,
    position_name VARCHAR(100) NOT NULL UNIQUE,
    meal_allowance_per_day DECIMAL(10, 2) DEFAULT 0.00,
    monthly_allowance DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Employees
CREATE TABLE hr_system.employees (
    id SERIAL PRIMARY KEY,
    prefix VARCHAR(20),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    id_card_number VARCHAR(13) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(15),
    nationality VARCHAR(50) DEFAULT 'ไทย',
    birth_date DATE,
    hired_date DATE NOT NULL,
    position_id INTEGER REFERENCES hr_system.positions(id) ON DELETE SET NULL,
    status VARCHAR(20) CHECK (status IN ('probation', 'internship', 'part-time', 'permanent', 'resigned')) DEFAULT 'probation',
    employment_type VARCHAR(20) CHECK (employment_type IN ('daily', 'monthly')) NOT NULL,
    base_salary_or_wage DECIMAL(10, 2) NOT NULL,
    bank_name VARCHAR(100),
    bank_account_no VARCHAR(20),
    profile_image_url VARCHAR(255),
    contract_file_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Attendance
CREATE TABLE hr_system.attendance (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES hr_system.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    ot_hours DECIMAL(5, 2) DEFAULT 0.00,
    ot_amount DECIMAL(10, 2) DEFAULT 0.00,
    late_minutes INTEGER DEFAULT 0,
    is_leave BOOLEAN DEFAULT FALSE,
    leave_type VARCHAR(50),
    calculated_wage_daily DECIMAL(10, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, date)
);

-- Table: System_Configs
CREATE TABLE hr_system.system_configs (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    data_type VARCHAR(20) DEFAULT 'string',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add comments to columns
COMMENT ON COLUMN hr_system.positions.meal_allowance_per_day IS 'ค่าอาหารต่อวัน';
COMMENT ON COLUMN hr_system.positions.monthly_allowance IS 'เบี้ยเลี้ยงรายเดือน';

COMMENT ON COLUMN hr_system.employees.prefix IS 'คำนำหน้า (นาย/นาง/นางสาว)';
COMMENT ON COLUMN hr_system.employees.id_card_number IS 'เลขบัตรประชาชน 13 หลัก';
COMMENT ON COLUMN hr_system.employees.hired_date IS 'วันที่บรรจุ';
COMMENT ON COLUMN hr_system.employees.base_salary_or_wage IS 'เงินเดือนหรือค่าแรงรายวัน';

COMMENT ON COLUMN hr_system.attendance.ot_hours IS 'ชั่วโมง OT';
COMMENT ON COLUMN hr_system.attendance.ot_amount IS 'เงิน OT';
COMMENT ON COLUMN hr_system.attendance.late_minutes IS 'นาทีที่สาย';
COMMENT ON COLUMN hr_system.attendance.leave_type IS 'ประเภทการลา (ลากิจ, ลาป่วย, ลาพักร้อน)';
COMMENT ON COLUMN hr_system.attendance.calculated_wage_daily IS 'ยอดเงินที่คำนวณได้ของวันนั้น';

COMMENT ON COLUMN hr_system.system_configs.data_type IS 'string, number, json, formula';

-- Insert default system configurations
INSERT INTO hr_system.system_configs (key, value, description, data_type) VALUES
('late_fine_per_minute', '2.00', 'ค่าปรับสายต่อนาที (บาท)', 'number'),
('standard_check_in_time', '08:00:00', 'เวลาเข้างานมาตรฐาน', 'string'),
('standard_check_out_time', '17:00:00', 'เวลาออกงานมาตรฐาน', 'string'),
('ot_rate_multiplier', '1.5', 'อัตราคูณ OT (1.5 เท่า)', 'number'),
('leave_sick_deduction', '0', 'ลาป่วยหักเงิน (%) - 0 = ไม่หัก', 'number'),
('leave_personal_deduction', '100', 'ลากิจหักเงิน (%) - 100 = หักเต็ม', 'number'),
('leave_vacation_deduction', '0', 'ลาพักร้อนหักเงิน (%) - 0 = ไม่หัก', 'number'),
('work_days_per_month', '26', 'จำนวนวันทำงานต่อเดือน (สำหรับพนักงานรายเดือน)', 'number'),
('daily_work_hours', '8', 'จำนวนชั่วโมงทำงานต่อวัน', 'number');

-- Insert sample positions
INSERT INTO hr_system.positions (position_name, meal_allowance_per_day, monthly_allowance) VALUES
('พนักงานทั่วไป', 50.00, 0.00),
('หัวหน้างาน', 70.00, 1000.00),
('ผู้จัดการ', 100.00, 3000.00),
('ผู้อำนวยการ', 150.00, 5000.00);

-- Create indexes for better performance
CREATE INDEX idx_employees_position ON hr_system.employees(position_id);
CREATE INDEX idx_employees_status ON hr_system.employees(status);
CREATE INDEX idx_employees_employment_type ON hr_system.employees(employment_type);
CREATE INDEX idx_attendance_employee_date ON hr_system.attendance(employee_id, date);
CREATE INDEX idx_attendance_date ON hr_system.attendance(date);
CREATE INDEX idx_system_configs_key ON hr_system.system_configs(key);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION hr_system.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON hr_system.positions
    FOR EACH ROW EXECUTE FUNCTION hr_system.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON hr_system.employees
    FOR EACH ROW EXECUTE FUNCTION hr_system.update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON hr_system.attendance
    FOR EACH ROW EXECUTE FUNCTION hr_system.update_updated_at_column();

CREATE TRIGGER update_system_configs_updated_at BEFORE UPDATE ON hr_system.system_configs
    FOR EACH ROW EXECUTE FUNCTION hr_system.update_updated_at_column();

-- Insert sample employees (for testing)
INSERT INTO hr_system.employees (
    prefix, first_name, last_name, id_card_number, phone,
    birth_date, hired_date, position_id, status, employment_type, base_salary_or_wage
) VALUES
('นาย', 'สมชาย', 'ใจดี', '1234567890123', '0812345678', '1990-01-15', '2024-01-01', 1, 'permanent', 'daily', 350.00),
('นางสาว', 'สมหญิง', 'รักงาน', '1234567890124', '0823456789', '1992-05-20', '2023-06-01', 2, 'permanent', 'monthly', 25000.00),
('นาง', 'วิไล', 'มานะ', '1234567890125', '0834567890', '1988-10-10', '2022-03-15', 3, 'permanent', 'monthly', 45000.00);

-- Add table comments
COMMENT ON TABLE hr_system.positions IS 'ตำแหน่งงาน';
COMMENT ON TABLE hr_system.employees IS 'ข้อมูลพนักงาน';
COMMENT ON TABLE hr_system.attendance IS 'บันทึกเวลาเข้า-ออกงาน';
COMMENT ON TABLE hr_system.system_configs IS 'การตั้งค่าระบบ';
