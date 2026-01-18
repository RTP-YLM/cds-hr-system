-- Migration: เพิ่มตารางวันหยุดและการตั้งค่าวันทำงาน
-- Run: psql -U postgres -h localhost -p 5432 -d cds-hr -f database/migration_add_holidays.sql

SET search_path TO hr_system;

-- 1. สร้างตาราง Holidays
CREATE TABLE IF NOT EXISTS hr_system.holidays (
    id SERIAL PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    holiday_type VARCHAR(50) DEFAULT 'public', -- public, company, other
    is_paid BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- เพิ่ม comment
COMMENT ON TABLE hr_system.holidays IS 'วันหยุดนักขัตฤกษ์และวันหยุดบริษัท';

-- ฟังก์ชัน trigger สำหรับ updated_at (ถ้ายังไม่มี)
CREATE OR REPLACE FUNCTION hr_system.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- เพิ่ม trigger
DROP TRIGGER IF EXISTS update_holidays_updated_at ON hr_system.holidays;
CREATE TRIGGER update_holidays_updated_at BEFORE UPDATE ON hr_system.holidays
    FOR EACH ROW EXECUTE FUNCTION hr_system.update_updated_at_column();

-- 2. เพิ่มการตั้งค่าวันทำงานใน system_configs
INSERT INTO hr_system.system_configs (key, value, description, data_type)
VALUES 
('weekly_off_days', '[0]', 'วันหยุดประจำสัปดาห์ (0=อาทิตย์, 6=เสาร์) รูปแบบ JSON array', 'json'),
('saturday_work_mode', 'biweekly', 'โหมดการทำงานวันเสาร์ (all=ทำทุกเสาร์, none=หยุดทุกเสาร์, biweekly=เสาร์เว้นเสาร์)', 'string')
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    description = EXCLUDED.description;

-- ลบการตั้งค่าที่ไม่ได้ใช้แล้ว
DELETE FROM hr_system.system_configs WHERE key = 'work_days_per_month';

SELECT 'Migration for holidays and work schedule completed successfully!' as status;
