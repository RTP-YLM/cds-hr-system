-- Migration: เพิ่มฟิลด์ work_schedule สำหรับเวลาเข้างานของแต่ละคน
-- Run: psql -U postgres -h localhost -p 5432 -d cds-hr -f database/migration_add_work_schedule.sql

SET search_path TO hr_system;

-- เพิ่มฟิลด์ work_start_time และ work_end_time ในตาราง employees
ALTER TABLE hr_system.employees
ADD COLUMN IF NOT EXISTS work_start_time TIME DEFAULT '08:00:00',
ADD COLUMN IF NOT EXISTS work_end_time TIME DEFAULT '17:00:00';

-- เพิ่ม comment
COMMENT ON COLUMN hr_system.employees.work_start_time IS 'เวลาเข้างานของพนักงานคนนี้';
COMMENT ON COLUMN hr_system.employees.work_end_time IS 'เวลาออกงานของพนักงานคนนี้';

-- อัพเดทพนักงานที่มีอยู่ให้มีเวลาเข้างานมาตรฐาน
UPDATE hr_system.employees
SET work_start_time = '08:00:00', work_end_time = '17:00:00'
WHERE work_start_time IS NULL;

-- ตัวอย่างการตั้งเวลาเข้างานแตกต่างกัน (optional)
-- UPDATE hr_system.employees SET work_start_time = '07:00:00', work_end_time = '16:00:00' WHERE id = 1;
-- UPDATE hr_system.employees SET work_start_time = '09:00:00', work_end_time = '18:00:00' WHERE id = 2;

SELECT 'Migration completed successfully!' as status;
