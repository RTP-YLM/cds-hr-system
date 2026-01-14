# โครงสร้างโปรเจกต์ CDS HR System

## 📁 โครงสร้างโฟลเดอร์

```
cds-hr-system/
├── backend/                          # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/                   # การตั้งค่า
│   │   │   └── database.js          # Database connection
│   │   ├── models/                   # Database models
│   │   │   ├── Employee.js
│   │   │   ├── Attendance.js
│   │   │   ├── Position.js
│   │   │   └── SystemConfig.js
│   │   ├── controllers/              # Controllers
│   │   │   ├── employeeController.js
│   │   │   ├── attendanceController.js
│   │   │   ├── positionController.js
│   │   │   └── configController.js
│   │   ├── routes/                   # API Routes
│   │   │   ├── employeeRoutes.js
│   │   │   ├── attendanceRoutes.js
│   │   │   ├── positionRoutes.js
│   │   │   └── configRoutes.js
│   │   ├── middleware/               # Middleware
│   │   │   ├── upload.js            # Multer file upload
│   │   │   ├── errorHandler.js
│   │   │   └── validation.js
│   │   ├── utils/                    # Utilities
│   │   │   ├── payrollCalculator.js # Payroll logic
│   │   │   └── validators.js        # Zod validators
│   │   └── server.js                 # Main server file
│   ├── uploads/                      # ไฟล์ที่อัพโหลด
│   │   ├── profiles/                # รูปโปรไฟล์
│   │   └── contracts/               # สัญญา PDF
│   ├── package.json
│   └── .env
│
├── frontend/                         # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/               # React Components
│   │   │   ├── ui/                  # Shadcn/UI components
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── MainLayout.tsx
│   │   │   ├── employees/
│   │   │   │   ├── EmployeeForm.tsx
│   │   │   │   ├── EmployeeList.tsx
│   │   │   │   └── EmployeeCard.tsx
│   │   │   ├── attendance/
│   │   │   │   ├── AttendanceTable.tsx
│   │   │   │   ├── AttendanceForm.tsx
│   │   │   │   └── AttendanceCalendar.tsx
│   │   │   └── config/
│   │   │       └── ConfigForm.tsx
│   │   ├── pages/                    # Pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Employees.tsx
│   │   │   ├── Attendance.tsx
│   │   │   ├── Payroll.tsx
│   │   │   └── Settings.tsx
│   │   ├── hooks/                    # Custom Hooks
│   │   │   ├── useApi.ts
│   │   │   ├── useEmployees.ts
│   │   │   ├── useAttendance.ts
│   │   │   └── useConfig.ts
│   │   ├── store/                    # Zustand Store
│   │   │   ├── employeeStore.ts
│   │   │   ├── attendanceStore.ts
│   │   │   └── configStore.ts
│   │   ├── types/                    # TypeScript Types
│   │   │   ├── employee.ts
│   │   │   ├── attendance.ts
│   │   │   └── config.ts
│   │   ├── utils/                    # Utilities
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   └── payrollCalc.ts
│   │   ├── lib/                      # Libraries
│   │   │   └── utils.ts             # cn() function
│   │   ├── pdf/                      # PDF Templates
│   │   │   └── PayslipTemplate.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env
│
├── database/                         # Database
│   ├── schema.sql                   # Schema SQL
│   └── README.md                    # Database docs
│
└── README.md                         # Project documentation
```

## 🛠️ เทคโนโลジีที่ใช้

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **PostgreSQL** - Database (pg driver)
- **Multer** - File upload
- **Zod** - Validation
- **ES Modules** - Module system

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Shadcn/UI** - Component library
- **Zustand** - State management
- **React Router v7** - Routing
- **Lucide React** - Icons
- **@react-pdf/renderer** - PDF generation

## 🚀 Features

1. **การจัดการพนักงาน (Employee Management)**
   - เพิ่ม/แก้ไข/ลบข้อมูลพนักงาน
   - อัพโหลดรูปโปรไฟล์
   - อัพโหลดสัญญา PDF
   - ระบบค้นหาและกรอง

2. **บันทึกเวลา (Time Attendance)**
   - บันทึกเวลาเข้า-ออกงาน
   - คำนวณเวลาสาย
   - บันทึก OT
   - บันทึกการลา

3. **คำนวณเงินเดือน (Payroll)**
   - คำนวณเงินรายวัน
   - คำนวณเงินรายเดือน
   - หักเงินสาย
   - หักเงินลา
   - คำนวณ OT

4. **ตั้งค่าระบบ (System Configuration)**
   - ตั้งค่าหักสาย
   - ตั้งค่าค่าอาหาร
   - ตั้งค่าเบี้ยเลี้ยง
   - ตั้งค่าอัตรา OT

5. **รายงาน (Reports)**
   - พิมพ์สลิปเงินเดือน (PDF)
   - รายงานสรุปเงินเดือน
   - รายงานการเข้างาน

## 📝 Database Schema

- **positions**: ตำแหน่งงาน
- **employees**: ข้อมูลพนักงาน
- **attendance**: บันทึกเวลาเข้า-ออก
- **system_configs**: การตั้งค่าระบบ
