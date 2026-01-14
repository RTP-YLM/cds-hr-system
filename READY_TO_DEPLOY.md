# ✅ CDS HR System - Ready to Deploy!

## 🎉 What's Done:

✅ **GitHub Repository**: Code pushed to https://github.com/RTP-YLM/cds-hr-system.git
✅ **PostgreSQL Database**: Created and initialized on Railway
✅ **Database Schema**: All 4 tables created (employees, positions, attendance, system_configs)
✅ **Initial Data**: Loaded successfully
  - 3 employees
  - 4 positions
  - 9 system configurations
✅ **Migrations**: Work schedule fields added to employees table

---

## 🚀 Final Step: Deploy Backend Service (3 minutes)

### Go to Railway Dashboard:
👉 https://railway.com/project/ed05973a-9ae5-43a5-87f1-b1366afdff04

### 1. Add New Service from GitHub

1. Click **"+ New"** button
2. Select **"GitHub Repo"**
3. Choose repository: **`RTP-YLM/cds-hr-system`**
4. Railway will automatically detect Node.js project

### 2. Configure Service Settings

#### a) **Set Environment Variables**

Click on the service → **Settings** → **Variables**

Add these variables one by one:

```bash
# Database (use reference to your Postgres service)
DATABASE_URL=${{Postgres.DATABASE_URL}}
DB_SCHEMA=hr_system

# Server
NODE_ENV=production

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

**Important:** For `DATABASE_URL`, type `${{` and Railway will show autocomplete. Select your Postgres service.

#### b) **Configure Build Settings**

Still in **Settings**:

**Start Command:**
```bash
cd backend && npm start
```

**Watch Paths (optional):**
```
backend/**
```

### 3. Deploy!

Railway will automatically start building and deploying when you:
- Save the environment variables
- The deployment will appear in the **Deployments** tab

Watch the logs to ensure successful deployment.

---

## 🔍 Verify Deployment

### 1. Get Your Service URL

Once deployed, Railway will give you a URL like:
```
https://cds-hr-system-production.up.railway.app
```

You can find it in:
- Service → **Settings** → **Networking** → **Public Networking**
- Or click **"Generate Domain"** if not already generated

### 2. Test the API

```bash
# Replace with your actual URL
API_URL="https://your-service.up.railway.app"

# Test health endpoint
curl $API_URL/health

# Should return:
# {"status":"OK","timestamp":"...","database":"connected"}

# Test employees API
curl $API_URL/api/employees

# Should return list of 3 employees

# Test positions API
curl $API_URL/api/positions

# Should return 4 positions
```

---

## 📊 Database Connection Details

Your PostgreSQL database is already configured with:

**Connection String:**
```
postgresql://postgres:fpriiwwegFNGKMgNkOrTxFzVGVneLusi@interchange.proxy.rlwy.net:19798/railway
```

**Schema:** `hr_system`

**Tables:**
- ✅ `hr_system.employees` (with work_start_time, work_end_time)
- ✅ `hr_system.positions`
- ✅ `hr_system.attendance`
- ✅ `hr_system.system_configs`

---

## 🎯 What You Get After Deployment

### Working Endpoints:

```
https://your-service.up.railway.app/health
https://your-service.up.railway.app/api/employees
https://your-service.up.railway.app/api/positions
https://your-service.up.railway.app/api/attendance
https://your-service.up.railway.app/api/config
```

### Features:

✅ **Employee Management**
  - CRUD operations
  - File uploads (profile images, contracts)
  - Custom work hours per employee (07:00-16:00, 08:00-17:00, etc.)

✅ **Attendance Tracking**
  - Check-in/Check-out times
  - Automatic late calculation based on individual work schedules
  - OT hours tracking
  - Leave management

✅ **Payroll Calculation**
  - Daily and monthly employee support
  - Automatic wage calculation
  - Late fines
  - OT payments
  - Leave deductions

✅ **System Configuration**
  - Late fine per minute
  - OT multiplier
  - Work hours settings
  - Leave policies

---

## 🔧 Optional: Deploy Frontend

If you want to deploy the frontend too:

1. Click **"+ New"** → **"GitHub Repo"**
2. Select same repository: `RTP-YLM/cds-hr-system`
3. Configure:

**Variables:**
```bash
VITE_API_URL=https://your-backend-url.up.railway.app/api
```

**Root Directory:**
```
frontend
```

**Start Command:**
```bash
npm install && npm run build && npm run preview -- --host 0.0.0.0 --port $PORT
```

---

## 📱 Test with Sample Data

The database already has sample data:

### Employees:
1. **สมชาย ใจดี** - พนักงานทั่วไป (รายวัน, 350 บาท/วัน)
2. **สมหญิง รักงาน** - หัวหน้างาน (รายเดือน, 25,000 บาท/เดือน)
3. **วิไล มานะ** - ผู้จัดการ (รายเดือน, 45,000 บาท/เดือน)

### Positions:
1. พนักงานทั่วไป - ค่าอาหาร 50 บาท/วัน
2. หัวหน้างาน - ค่าอาหาร 70 บาท/วัน + เบี้ยเลี้ยง 1,000 บาท/เดือน
3. ผู้จัดการ - ค่าอาหาร 100 บาท/วัน + เบี้ยเลี้ยง 3,000 บาท/เดือน
4. ผู้อำนวยการ - ค่าอาหาร 150 บาท/วัน + เบี้ยเลี้ยง 5,000 บาท/เดือน

---

## 🐛 Troubleshooting

### Service won't start?
- Check **Logs** in Railway dashboard
- Verify all environment variables are set correctly
- Ensure `DATABASE_URL` points to your Postgres service

### Database connection errors?
- Verify `DB_SCHEMA=hr_system` is set
- Check that migrations ran successfully (they did! ✅)

### 502 Bad Gateway?
- Service might still be starting
- Wait 1-2 minutes and refresh
- Check deployment logs

---

## 🎉 You're Ready!

**Next Step:** Click the link below to add your backend service!

👉 https://railway.com/project/ed05973a-9ae5-43a5-87f1-b1366afdff04

Then follow **Step 1** above to complete deployment.

---

**Questions?** Check the logs in Railway dashboard or refer to `DEPLOY_NOW.md` for detailed instructions.
