# Database Setup

## การติดตั้งฐานข้อมูล

### ข้อมูลการเชื่อมต่อ
- Host: localhost
- Port: 5432
- Username: postgres
- Password: postgres
- Database: cds-hr
- Schema: hr_system

### วิธีการสร้างฐานข้อมูล

1. สร้าง Database (ถ้ายังไม่มี):
```bash
psql -U postgres -h localhost -p 5432
CREATE DATABASE "cds-hr";
\q
```

2. รัน Schema:
```bash
psql -U postgres -h localhost -p 5432 -d cds-hr -f database/schema.sql
```

### โครงสร้างตาราง

#### 1. positions (ตำแหน่งงาน)
- id: รหัสตำแหน่ง
- position_name: ชื่อตำแหน่ง
- meal_allowance_per_day: ค่าอาหารต่อวัน
- monthly_allowance: เบี้ยเลี้ยงรายเดือน

#### 2. employees (พนักงาน)
- id: รหัสพนักงาน
- prefix, first_name, last_name: ชื่อ-นามสกุล
- id_card_number: เลขบัตรประชาชน
- status: สถานะ (probation, internship, part-time, permanent, resigned)
- employment_type: ประเภทการจ้าง (daily, monthly)
- base_salary_or_wage: เงินเดือน/ค่าแรง
- work_start_time, work_end_time: เวลาเข้า-ออกงานมาตรฐานรายบุคคล

#### 3. attendance (บันทึกเวลา)
- id: รหัสบันทึก
- employee_id: รหัสพนักงาน
- date: วันที่
- check_in_time, check_out_time: เวลาเข้า-ออก
- ot_hours, ot_amount: OT
- late_minutes: นาทีที่สาย
- is_leave, leave_type: การลา
- calculated_wage_daily: เงินที่คำนวณได้
- **Unique Constraint**: `(employee_id, date)` เพื่อรองรับระบบ **Batch Upsert**

#### 4. system_configs (ตั้งค่าระบบ)
- key: ชื่อตัวแปร
- value: ค่า
- description: คำอธิบาย

### ค่าตั้งต้นที่สำคัญ
- `late_fine_per_minute`: 2 บาท/นาที
- `ot_rate_multiplier`: 1.5 เท่า
- `leave_personal_deduction`: หัก 100%
- `leave_sick_deduction`: ไม่หัก (0%)
