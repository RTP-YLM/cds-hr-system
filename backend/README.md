# CDS HR System - Backend API

Backend API สำหรับระบบ HRMS (Human Resource Management System)

## 🛠️ เทคโนโลยีที่ใช้

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **pg** - PostgreSQL driver
- **Multer** - File upload
- **Zod** - Schema validation
- **ES Modules** - Module system

## 📁 โครงสร้างโปรเจกต์

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── models/
│   │   ├── Employee.js          # Employee model
│   │   ├── Attendance.js        # Attendance model
│   │   ├── Position.js          # Position model
│   │   └── SystemConfig.js      # Config model
│   ├── controllers/
│   │   ├── employeeController.js
│   │   ├── attendanceController.js
│   │   ├── positionController.js
│   │   └── configController.js
│   ├── routes/
│   │   ├── employeeRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── positionRoutes.js
│   │   └── configRoutes.js
│   ├── middleware/
│   │   ├── upload.js            # Multer file upload
│   │   └── errorHandler.js      # Error handling
│   ├── utils/
│   │   ├── payrollCalculator.js # Payroll logic
│   │   └── validators.js        # Zod validators
│   └── server.js                 # Main server
├── uploads/
│   ├── profiles/                # รูปโปรไฟล์
│   └── contracts/               # สัญญา PDF
├── package.json
└── .env
```

## 🚀 การติดตั้งและรัน

### 1. ติดตั้ง Dependencies

```bash
cd backend
npm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=cds-hr
DB_SCHEMA=hr_system

# Server
PORT=5000
NODE_ENV=development
```

### 3. สร้างฐานข้อมูล

```bash
# สร้าง database
psql -U postgres -h localhost -p 5432
CREATE DATABASE "cds-hr";
\q

# รัน schema
npm run db:setup
```

### 4. รันเซิร์ฟเวอร์

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

เซิร์ฟเวอร์จะรันที่ `http://localhost:5000`

## 📡 API Endpoints

### Employees (พนักงาน)

- `GET /api/employees` - ดึงพนักงานทั้งหมด
- `GET /api/employees/:id` - ดึงพนักงานตาม ID
- `GET /api/employees/stats/overview` - สถิติพนักงาน
- `POST /api/employees` - เพิ่มพนักงานใหม่
- `PATCH /api/employees/:id` - อัพเดทพนักงาน
- `DELETE /api/employees/:id` - ลบพนักงาน

### Attendance (การเข้างาน)

- `GET /api/attendance` - ดึงข้อมูลการเข้างานทั้งหมด
- `GET /api/attendance/:id` - ดึงข้อมูลการเข้างานตาม ID
- `GET /api/attendance/employee/:employee_id/:month` - ดึงข้อมูลตามพนักงานและเดือน
- `GET /api/attendance/summary/:employee_id/:month` - สรุปการเข้างานรายเดือน
- `POST /api/attendance` - สร้างบันทึกการเข้างาน
- `PATCH /api/attendance/:id` - อัพเดทการเข้างาน
- `DELETE /api/attendance/:id` - ลบการเข้างาน

### Positions (ตำแหน่ง)

- `GET /api/positions` - ดึงตำแหน่งทั้งหมด
- `GET /api/positions/:id` - ดึงตำแหน่งตาม ID
- `GET /api/positions/:id/employees` - ดึงพนักงานในตำแหน่ง
- `POST /api/positions` - เพิ่มตำแหน่งใหม่
- `PATCH /api/positions/:id` - อัพเดทตำแหน่ง
- `DELETE /api/positions/:id` - ลบตำแหน่ง

### System Config (การตั้งค่า)

- `GET /api/config` - ดึงการตั้งค่าทั้งหมด
- `GET /api/config/object` - ดึงการตั้งค่าในรูปแบบ Object
- `GET /api/config/:key` - ดึงการตั้งค่าตาม key
- `GET /api/config/search/:keyword` - ค้นหาการตั้งค่า
- `POST /api/config` - เพิ่มการตั้งค่าใหม่
- `PATCH /api/config/:key` - อัพเดทการตั้งค่า
- `PATCH /api/config/batch` - อัพเดทหลายรายการพร้อมกัน
- `DELETE /api/config/:key` - ลบการตั้งค่า

## 📊 Business Logic

### การคำนวณเงินเดือน

#### พนักงานรายวัน
```
รายได้รวม = ค่าแรงรายวัน + ค่าอาหาร + เงิน OT
การหัก = ค่าปรับสาย + การหักลา
รายได้สุทธิ = รายได้รวม - การหัก
```

#### พนักงานรายเดือน
```
รายได้รวม = เงินเดือน + เบี้ยเลี้ยง + (ค่าอาหาร × วันที่เข้างาน) + เงิน OT
การหัก = ค่าปรับสาย + การหักลา
รายได้สุทธิ = รายได้รวม - การหัก
```

### การคำนวณ OT
```
เงิน OT = ชั่วโมง OT × อัตราต่อชั่วโมง × ตัวคูณ OT (1.5)
```

### การหักเงินสาย
```
ค่าปรับสาย = จำนวนนาที × ค่าปรับต่อนาที (default: 2 บาท)
```

### การหักเงินลา
- **ลาป่วย**: หัก 0% (ไม่หัก)
- **ลากิจ**: หัก 100% (เต็มจำนวน)
- **ลาพักร้อน**: หัก 0% (ไม่หัก)

## 🔧 Validation

ใช้ **Zod** สำหรับ validation:

- เลขบัตรประชาชน: 13 หลัก + checksum
- เบอร์โทรศัพท์: 10 หลัก เริ่มต้นด้วย 0
- วันที่: รูปแบบ YYYY-MM-DD
- เวลา: รูปแบบ HH:MM:SS

## 📤 File Upload

ใช้ **Multer** สำหรับจัดการ:

- **รูปโปรไฟล์**: JPEG, PNG, GIF, WebP (สูงสุด 5MB)
- **ไฟล์สัญญา**: PDF (สูงสุด 10MB)

ไฟล์จะถูกเก็บใน:
- `uploads/profiles/` - รูปโปรไฟล์
- `uploads/contracts/` - สัญญา PDF

## 🧪 Testing

```bash
# Test database connection
curl http://localhost:5000/health

# Test API endpoints
curl http://localhost:5000/api/employees
curl http://localhost:5000/api/positions
curl http://localhost:5000/api/config
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | postgres |
| `DB_NAME` | Database name | cds-hr |
| `DB_SCHEMA` | Schema name | hr_system |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |

## 🐛 Error Handling

API ส่งข้อผิดพลาดในรูปแบบ:

```json
{
  "success": false,
  "message": "ข้อความแสดงข้อผิดพลาด",
  "errors": [...]
}
```

## 📄 License

MIT
