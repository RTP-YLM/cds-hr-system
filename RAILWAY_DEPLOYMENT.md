# 🚂 Railway Deployment Guide

## Prerequisites
- GitHub repository: https://github.com/RTP-YLM/cds-hr-system.git
- Railway account: https://railway.app
- Railway project: https://railway.com/project/ed05973a-9ae5-43a5-87f1-b1366afdff04

## Step-by-Step Deployment

### 1. Setup PostgreSQL Database

1. Go to your Railway project: https://railway.com/project/ed05973a-9ae5-43a5-87f1-b1366afdff04
2. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Wait for PostgreSQL to provision
4. Copy the connection details:
   - `DATABASE_URL` (this will be auto-injected)
   - Or individual variables: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

### 2. Deploy Backend Service

1. In Railway project, click **"+ New"** → **"GitHub Repo"**
2. Select repository: `RTP-YLM/cds-hr-system`
3. Railway will auto-detect the Node.js project

#### Configure Backend Service:

**Settings → Variables (Environment Variables):**
```bash
# Database (will be auto-injected if PostgreSQL is in same project)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Or use individual variables:
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_SCHEMA=hr_system

# Server
PORT=5001
NODE_ENV=production

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

**Settings → Start Command:**
```bash
cd backend && npm install && npm start
```

**Settings → Root Directory:**
Leave as `/` (root)

### 3. Initialize Database

After deployment, you need to run the database migrations:

**Option A: Using Railway CLI**
```bash
railway login
railway link ed05973a-9ae5-43a5-87f1-b1366afdff04
railway run psql $DATABASE_URL -f database/schema.sql
railway run psql $DATABASE_URL -f database/migration_add_work_schedule.sql
```

**Option B: Using pgAdmin or any PostgreSQL client**
1. Connect using the DATABASE_URL from Railway
2. Run `database/schema.sql`
3. Run `database/migration_add_work_schedule.sql`

### 4. Deploy Frontend (Optional - if deploying separately)

If you want to deploy frontend separately:

1. Click **"+ New"** → **"GitHub Repo"** again
2. Select same repository but configure differently

**Settings → Variables:**
```bash
VITE_API_URL=https://your-backend-url.railway.app/api
```

**Settings → Start Command:**
```bash
cd frontend && npm install && npm run build && npm run preview
```

**Settings → Root Directory:**
Set to `frontend`

### 5. Verify Deployment

1. Check backend health:
   ```
   https://your-backend-url.railway.app/health
   ```

2. Test API:
   ```
   https://your-backend-url.railway.app/api/employees
   ```

3. Check logs in Railway dashboard for any errors

## Environment Variables Summary

### Backend Service
| Variable | Value | Description |
|----------|-------|-------------|
| DATABASE_URL | Auto from Postgres | Full PostgreSQL connection string |
| DB_SCHEMA | hr_system | Database schema name |
| PORT | 5001 | Server port |
| NODE_ENV | production | Environment |
| UPLOAD_DIR | uploads | Upload directory |
| MAX_FILE_SIZE | 5242880 | Max file size (5MB) |

### Frontend Service (if separate)
| Variable | Value | Description |
|----------|-------|-------------|
| VITE_API_URL | https://backend.railway.app/api | Backend API URL |

## Common Issues & Solutions

### Issue: Database connection failed
**Solution:**
- Make sure PostgreSQL service is running
- Check DATABASE_URL or individual DB_* variables are correct
- Ensure DB_SCHEMA is set to `hr_system`

### Issue: Port binding error
**Solution:**
- Railway automatically assigns PORT, make sure your app uses `process.env.PORT`
- Our backend already uses: `const PORT = process.env.PORT || 5001`

### Issue: File uploads not working
**Solution:**
- Railway's ephemeral filesystem - uploads will be lost on restart
- Consider using AWS S3, Cloudinary, or Railway's Volume for persistent storage

### Issue: CORS errors
**Solution:**
- Update CORS settings in `backend/src/server.js`
- Add your frontend domain to allowed origins

## Monitoring

- **Logs:** Click on service → **Logs** tab
- **Metrics:** Click on service → **Metrics** tab
- **Deployments:** Click on service → **Deployments** tab

## Updating

When you push new code to GitHub:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

Railway will automatically deploy the new version.

## Useful Commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link ed05973a-9ae5-43a5-87f1-b1366afdff04

# View logs
railway logs

# Run commands in Railway environment
railway run node -v

# Open project in browser
railway open
```

## Support

- Railway Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Email: team@railway.app
