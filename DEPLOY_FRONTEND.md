# 🚀 Deploy Frontend to Railway

## ✅ สิ่งที่เตรียมไว้แล้ว:

- ✅ Frontend build configuration (.env.production)
- ✅ Start script สำหรับ Railway (npm start)
- ✅ Nixpacks configuration (frontend/nixpacks.toml)
- ✅ API URL ชี้ไปที่: https://cds-hr-system-production.up.railway.app/api

---

## 📋 วิธี Deploy Frontend (3-4 นาที)

### 1. ไปที่ Railway Dashboard

👉 https://railway.com/project/ed05973a-9ae5-43a5-87f1-b1366afdff04

### 2. สร้าง Service ใหม่สำหรับ Frontend

1. คลิก **"+ New"** button (มุมขวาบน)
2. เลือก **"GitHub Repo"**
3. เลือก repository: **`RTP-YLM/cds-hr-system`** (repo เดียวกัน)
4. Railway จะ detect Node.js project

### 3. ตั้งค่า Service

#### A. ตั้งชื่อ Service (Optional แต่แนะนำ)
- คลิกที่ชื่อ service (ด้านบนซ้าย)
- เปลี่ยนเป็น **"cds-hr-frontend"** หรือชื่ออื่นที่ชอบ

#### B. Settings → Root Directory
1. ไปที่ **Settings** tab
2. หัวข้อ **Service**
3. ค้นหา **"Root Directory"**
4. ใส่: `frontend`
5. คลิก **"Update"**

⚠️ **สำคัญมาก!** ถ้าไม่ตั้ง Root Directory มันจะพยายาม deploy backend แทน

#### C. Settings → Environment Variables

ไปที่ **Variables** tab แล้วเพิ่ม:

```bash
VITE_API_URL=https://cds-hr-system-production.up.railway.app/api
NODE_ENV=production
```

**วิธีเพิ่ม:**
1. คลิก **"+ New Variable"**
2. Variable: `VITE_API_URL`
3. Value: `https://cds-hr-system-production.up.railway.app/api`
4. คลิก **"Add"**
5. ทำซ้ำสำหรับ `NODE_ENV=production`

### 4. Deploy!

Railway จะ auto-deploy หลังจาก:
- ตั้งค่า Root Directory เสร็จ
- เพิ่ม Environment Variables เสร็จ

**ดู deployment progress ที่:**
- **Deployments** tab
- รอประมาณ 2-3 นาที

---

## 🌐 หลัง Deploy สำเร็จ

### 1. Generate Domain

1. ไปที่ **Settings** → **Networking**
2. คลิก **"Generate Domain"**
3. จะได้ URL แบบนี้: `https://cds-hr-frontend-production.up.railway.app`

### 2. ทดสอบ Frontend

เปิด browser ไปที่ URL ที่ได้:
```
https://cds-hr-frontend-production.up.railway.app
```

ควรเห็น:
- ✅ CDS HR System UI
- ✅ หน้า Login/Dashboard
- ✅ เชื่อมต่อกับ Backend API ได้

---

## 🔍 ตรวจสอบว่า Deploy ถูกต้อง

### เช็ค Deployment Logs

1. ไปที่ **Deployments** tab
2. คลิกที่ deployment ล่าสุด
3. ดู logs:

**Build Logs ควรมี:**
```
✓ 1611 modules transformed.
rendering chunks...
dist/index.html                   0.55 kB
dist/assets/index-xxxxxx.css     20.67 kB
dist/assets/index-xxxxxx.js     311.21 kB
✓ built in XXXms
```

**Deploy Logs ควรมี:**
```
> cds-hr-frontend@1.0.0 start
> vite preview --host 0.0.0.0 --port $PORT

  ➜  Local:   http://0.0.0.0:XXXX/
  ➜  Network: http://0.0.0.0:XXXX/
```

---

## ⚙️ Configuration Summary

**Frontend Service:**
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build` (auto from nixpacks)
- **Start Command:** `npm start` (from package.json)
- **Environment:**
  - `VITE_API_URL`: Backend API URL
  - `NODE_ENV`: production

**Backend Service (เดิม):**
- **Root Directory:** (default/root)
- **Start Command:** `npm start` → redirects to `cd backend && npm start`
- **URL:** https://cds-hr-system-production.up.railway.app

---

## 🎯 สถาปัตยกรรมหลัง Deploy

```
┌─────────────────────────────────────────┐
│  Railway Project: cds-quotation-system  │
├─────────────────────────────────────────┤
│                                         │
│  Service 1: Postgres                    │
│  └─ Database: railway                   │
│     └─ Schema: hr_system                │
│                                         │
│  Service 2: cds-hr-system (Backend)     │
│  └─ https://cds-hr-system-...railway.app│
│     └─ API endpoints: /api/*            │
│                                         │
│  Service 3: cds-hr-frontend (NEW!)      │
│  └─ https://cds-hr-frontend-...railway.app│
│     └─ React UI                         │
│     └─ Calls → Backend API              │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### ❌ Deployment Failed - "No build output"

**สาเหตุ:** Root Directory ไม่ถูกต้อง

**แก้ไข:**
1. Settings → Root Directory
2. ตรวจสอบว่าใส่ `frontend` (ไม่มี `/` ข้างหน้า)
3. Save และรอ redeploy

### ❌ Frontend แสดง "API Error" หรือ Network Error

**สาเหตุ:** VITE_API_URL ไม่ถูกต้องหรือไม่มี

**แก้ไข:**
1. Variables tab
2. เช็คว่ามี `VITE_API_URL`
3. Value ต้องเป็น: `https://cds-hr-system-production.up.railway.app/api`
4. Save และรอ redeploy

### ❌ Blank Page หรือ 404

**สาเหตุ:** Vite preview ไม่รัน หรือ dist ไม่มี

**แก้ไข:**
1. ดู Build Logs ว่า build สำเร็จหรือไม่
2. ดู Deploy Logs ว่า `vite preview` รันหรือไม่
3. ถ้าไม่รัน ลอง restart deployment

### ⚠️ CORS Error

**สาเหตุ:** Backend ไม่อนุญาตให้ Frontend domain เข้าถึง

**แก้ไข:** Backend มี CORS `allow all origins` อยู่แล้ว (`app.use(cors())`) ควรใช้งานได้

ถ้ายังมีปัญหา ให้แก้ใน `backend/src/server.js`:
```javascript
app.use(cors({
  origin: [
    'https://cds-hr-frontend-production.up.railway.app',
    // เพิ่ม domain อื่นๆ ถ้ามี
  ]
}));
```

---

## ✅ Checklist

- [ ] สร้าง Frontend service ใน Railway
- [ ] ตั้ง Root Directory = `frontend`
- [ ] เพิ่ม Environment Variable: `VITE_API_URL`
- [ ] เพิ่ม Environment Variable: `NODE_ENV=production`
- [ ] Deployment status = SUCCESS
- [ ] Generate Domain
- [ ] ทดสอบเปิด Frontend URL
- [ ] ทดสอบ Login/Features

---

## 🎉 เมื่อทุกอย่างเสร็จ

คุณจะมี:
- ✅ **Backend API:** https://cds-hr-system-production.up.railway.app
- ✅ **Frontend UI:** https://cds-hr-frontend-production.up.railway.app
- ✅ **Database:** PostgreSQL บน Railway
- ✅ **ระบบสมบูรณ์:** Frontend + Backend + Database

พร้อมใช้งานแล้ว! 🚀
