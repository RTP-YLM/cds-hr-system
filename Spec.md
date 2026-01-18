# Software Specification - CDS HR System

## 1. System Overview
ระบบบริหารจัดการทรัพยากรบุคคล (HRMS) ที่ออกแบบมาเพื่อรองรับบริษัทที่มีการทำงานแบบยืดหยุ่น โดยเฉพาะการรองรับการทำงานวันเสาร์แบบเว้นเสาร์ (Bi-weekly Saturday) และการคำนวณเงินเดือนตามปฏิทินจริง

## 2. Core Features

### 2.1 ระบบจัดการพนักงาน (Employee Management)
- จัดการข้อมูลพื้นฐานพนักงาน (ชื่อ, ตำแหน่ง, ประเภทการจ้าง)
- กำหนดเวลาเข้างานมาตรฐานบุคคล (`work_start_time`)
- จัดการเอกสารสัญญาและรูปโปรไฟล์

### 2.2 ระบบบันทึกเวลา (Time Attendance)
- บันทึกเวลาเข้า-ออกงาน, OT และประเภทการลา
- รองรับการบันทึกแบบกลุ่ม (Batch Upsert)
- คำนวณนาทีที่สายอัตโนมัติ

### 2.3 ระบบปฏิทินและวันหยุด (Calendar & Holidays)
- จัดการวันหยุดนักขัตฤกษ์และวันหยุดบริษัท
- กำหนดวันหยุดประจำสัปดาห์แบบไดนามิก (ส่งผลต่อการคำนวณวันทำงาน)
- **โหมดวันเสาร์ (Saturday Mode):** รองรับ 3 รูปแบบ
  - `all`: ทำงานทุกเสาร์
  - `none`: หยุดทุกเสาร์
  - `biweekly`: ทำงานเสาร์เว้นเสาร์ (คำนวณตามสัปดาห์ในปฏิทินจริง)
- **Preview Calendar:** แสดงรายการวันหยุดทั้งหมดในปีที่เลือกแบบรวมเหตุผล (นักขัตฤกษ์/วันหยุดประจำสัปดาห์)

### 2.4 ระบบคำนวณเงินเดือน (Payroll Logic)
- **Dynamic Work Days:** คำนวณจำนวนวันทำงานจริงในแต่ละเดือน (หักวันหยุดประจำสัปดาห์และนักขัตฤกษ์)
- **Hourly Rate Calculation:**
  - พนักงานรายเดือน: `เงินเดือน / จำนวนวันทำงานจริงในเดือนนั้น` (ไดนามิกตามปฏิทิน)
  - พนักงานรายวัน: ตามอัตราค่าจ้างรายวัน
- **Deductions & Benefits:**
  - หักสายรายนาที (ตามการตั้งค่า)
  - หักลาพนักงาน (ลาป่วย 0%, ลากิจ 100%, พักร้อน 0% - ปรับแต่งได้)
  - ค่าล่วงเวลา (OT): 1.5 เท่าของอัตราต่อชั่วโมง

## 3. Technical Architecture

### 3.1 Tech Stack
- **Backend:** Node.js, Express, PostgreSQL
- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS
- **State Management:** Zustand
- **PDF Engine:** @react-pdf/renderer

### 3.2 Database Schema Elements (Important additions)
- **Table: `hr_system.holidays`**
  - `date`: วันที่หยุด (Unique)
  - `name`: ชื่อวันหยุด
  - `is_paid`: จ่ายเงินปกติหรือไม่
- **Table: `hr_system.system_configs`**
  - `weekly_off_days`: JSON array (เช่น `[0]` สำหรับวันอาทิตย์)
  - `saturday_work_mode`: `all`, `none`, `biweekly`
  - `daily_work_hours`: จำนวนชั่วโมงทำงานมาตรฐาน

## 4. API Endpoints (New & Updated)

- `GET /api/holidays` - รายการวันหยุดนักขัตฤกษ์
- `GET /api/holidays/preview` - พรีวิววันหยุดทั้งหมดของปี (Dynamic Calculate)
- `POST /api/holidays` - เพิ่มวันหยุด
- `POST /api/attendance/batch` - บันทึกเวลาแบบกลุ่ม (คำนวณวันทำงานไดนามิก)

## 5. UI/UX Elements
- **Calendar Page:** หน้าจอจัดการวันหยุด พร้อมระบบ Preview สรุปวันหยุดรายเดือน
- **Settings Page:** ปรับแต่งนโยบายการหักเงิน และโหมดการทำงานวันเสาร์
- **Payroll Page:** คำนวณและสรุปยอดเงินเดือนรายเดือน พร้อมดาวน์โหลด PDF

---
*Last updated: 2026-01-18*
