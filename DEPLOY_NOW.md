# 🚀 Deploy CDS HR System to Railway - Quick Guide

## ✅ Repository is Ready!
- GitHub: https://github.com/RTP-YLM/cds-hr-system.git
- All code pushed and ready to deploy

---

## 📋 Step-by-Step Deployment (5-10 minutes)

### Step 1: Add PostgreSQL Database (2 mins)

1. Go to: https://railway.com/project/ed05973a-9ae5-43a5-87f1-b1366afdff04
2. Click **"+ New"** button
3. Select **"Database"** → **"Add PostgreSQL"**
4. Wait for provisioning (~30 seconds)

### Step 2: Add Backend Service from GitHub (2 mins)

1. Click **"+ New"** again
2. Select **"GitHub Repo"**
3. Choose: **`RTP-YLM/cds-hr-system`**
4. Railway will detect Node.js and start deploying

### Step 3: Configure Environment Variables (2 mins)

Click on the backend service → **Settings** → **Variables**

Add these variables:

```bash
# Database Connection (use reference from Postgres service)
DATABASE_URL=${{Postgres.DATABASE_URL}}
DB_SCHEMA=hr_system

# Server Config
PORT=${{PORT}}
NODE_ENV=production

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

**How to reference Postgres:**
- Click on the variable input
- Type `${{` and Railway will show autocomplete
- Select `Postgres.DATABASE_URL`

### Step 4: Set Root Directory & Start Command (1 min)

Still in **Settings**:

**Root Directory:**
- Leave as `/` (root)

**Start Command:**
```bash
cd backend && npm install && npm start
```

**Build Command (optional):**
```bash
cd backend && npm install
```

### Step 5: Deploy (Auto-triggered)

Railway will automatically deploy when you:
- Add environment variables
- Push to GitHub

Watch the deployment in the **Deployments** tab

---

## 🗄️ Initialize Database (IMPORTANT!)

After the first deployment succeeds, you MUST run the database migrations:

### Option A: Using Railway CLI (Recommended)

```bash
# Get DATABASE_URL from Railway dashboard
railway variables

# Export it temporarily (replace with your actual URL)
export DATABASE_URL="postgresql://user:pass@host:port/db"

# Run migrations
psql $DATABASE_URL -f database/schema.sql
psql $DATABASE_URL -f database/migration_add_work_schedule.sql
```

### Option B: Using pgAdmin or any SQL client

1. Get connection details from Railway:
   - Click on **Postgres** service
   - Go to **Variables** tab
   - Copy connection info

2. Connect using pgAdmin, DBeaver, or any PostgreSQL client

3. Run these SQL files in order:
   - `database/schema.sql`
   - `database/migration_add_work_schedule.sql`

---

## 🎯 Verify Deployment

### 1. Check Health Endpoint
```
https://your-app-name.up.railway.app/health
```

Should return:
```json
{
  "status": "OK",
  "timestamp": "2026-01-14T...",
  "database": "connected"
}
```

### 2. Test API Endpoints
```
https://your-app-name.up.railway.app/api/employees
https://your-app-name.up.railway.app/api/positions
https://your-app-name.up.railway.app/api/config
```

---

## 🔧 Frontend Configuration (Optional)

If you want to deploy frontend separately:

1. Click **"+ New"** → **"GitHub Repo"**
2. Select same repository
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

## 📊 Expected Result

After successful deployment, you'll have:

✅ **Backend API** running at: `https://cds-hr-system.up.railway.app`
✅ **PostgreSQL Database** with schema `hr_system`
✅ **4 Tables**: employees, positions, attendance, system_configs
✅ **All APIs** working:
   - Employee Management
   - Attendance Tracking
   - Payroll Calculation
   - System Configuration

---

## 🐛 Troubleshooting

### Issue: Build fails
**Solution:**
- Check **Logs** in Railway dashboard
- Ensure `package.json` exists in backend folder
- Verify Node.js version (should use 18 or higher)

### Issue: Database connection fails
**Solution:**
```bash
# In Railway Settings → Variables, verify:
DATABASE_URL=${{Postgres.DATABASE_URL}}
DB_SCHEMA=hr_system
```

### Issue: Port binding error
**Solution:**
- Railway automatically sets `PORT` variable
- Our code already uses: `process.env.PORT || 5001`
- Make sure you're using `${{PORT}}` in variables

### Issue: Tables don't exist
**Solution:**
- You forgot to run migrations!
- Run `database/schema.sql` using method above

---

## 🎉 Quick Test Script

After deployment, test with:

```bash
# Set your Railway backend URL
API_URL="https://your-app-name.up.railway.app/api"

# Test health
curl $API_URL/../health

# Test employees endpoint
curl $API_URL/employees

# Test positions
curl $API_URL/positions

# Test system config
curl $API_URL/config
```

---

## 📝 Notes

- **File Uploads**: Railway uses ephemeral storage. Files will be deleted on restart.
  - For production: Use AWS S3, Cloudinary, or Railway Volumes

- **Auto Deploy**: Any push to `main` branch will auto-deploy

- **Environment**: Currently set to `production`

- **Logs**: View real-time logs in Railway dashboard → Service → **Logs**

---

## 🆘 Need Help?

1. Check Railway logs first
2. Review environment variables
3. Verify database migrations ran successfully
4. Test API endpoints one by one

---

**Ready to deploy? Start with Step 1!** 🚀
