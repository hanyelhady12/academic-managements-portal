# 🚀 Cloud Deployment Guide

This guide will help you deploy the Academic Management System to **Vercel** (free tier) with a **PostgreSQL database** (free tier from Neon or Supabase).

---

## 📋 Prerequisites

Before you start, make sure you have:
- [ ] **GitHub account** - free at https://github.com/signup
- [ ] **Vercel account** - free at https://vercel.com/signup
- [ ] **Database provider** - Choose one:
  - [ ] **Neon** (recommended) - https://neon.tech/signup (free tier)
  - [ ] **Supabase** - alternative - https://supabase.com/signup (free tier)

---

## Step 1: Set Up PostgreSQL Database

### Option A: Neon (Recommended) 🌟

1. Go to https://neon.tech and sign up
2. Click **"New Project"**
3. Choose:
   - **Project name:** `academic-management`
   - **Postgres version:** `15`
   - **Region:** Choose closest to you
4. Click **"Create Project"**
5. Wait for project to be created (10-30 seconds)
6. Copy your **Connection String** (looks like):
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
7. Save this somewhere - you'll need it!

### Option B: Supabase (Alternative)

1. Go to https://supabase.com and sign up
2. Click **"New Project"**
3. Fill in project details
4. Wait for project setup
5. Go to **Settings → Database**
6. Copy your **Connection String**
7. Replace `[YOUR-PASSWORD]` with your actual database password

---

## Step 2: Push Code to GitHub

### 2.1. Initialize Git Repository

```bash
cd /home/z/my-project
git init
```

### 2.2. Create a .gitignore File

Create `.gitignore` file with:

```gitignore
# Dependencies
node_modules
.next

# Environment variables
.env
.env.local
.env.production.local

# Database
*.db
*.db-journal
db/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
dev.log
server.log

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode
.idea
*.swp
*.swo
```

### 2.3. Commit Your Code

```bash
git add .
git commit -m "Initial commit: Academic Management System"
```

### 2.4. Create GitHub Repository

1. Go to https://github.com/new
2. Create new repository:
   - **Repository name:** `academic-management-system`
   - Make it **Private** or **Public** (your choice)
   - Don't initialize with README or .gitignore
3. Click **"Create repository"**

### 2.5. Push to GitHub

Replace `YOUR_USERNAME` with your GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/academic-management-system.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### 3.1. Connect Vercel to GitHub

1. Go to https://vercel.com and sign in/up
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Find and select your `academic-management-system` repository
5. Click **"Import"**

### 3.2. Configure Environment Variables

On the Vercel configure page:

1. **Project Name:** `academic-management` (or any name you want)
2. **Framework Preset:** Next.js
3. **Root Directory:** `./` (leave as is)

4. Scroll to **"Environment Variables"** section and add:

| Name | Value | Description |
|------|--------|-------------|
| `DATABASE_URL` | Your PostgreSQL connection string from Step 1 | Database connection |
| `NEXTAUTH_URL` | `https://academic-management.vercel.app` (your future URL) | Auth callback URL |
| `NEXTAUTH_SECRET` | Generate a random string (see below) | Secret for encryption |

### 3.3. Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use this online tool: https://generate-secret.vercel.app/

Copy the output and paste it as `NEXTAUTH_SECRET` value.

### 3.4. Deploy!

Click the **"Deploy"** button

Vercel will:
1. Install dependencies
2. Build the project
3. Deploy to global CDN

This takes 2-5 minutes.

---

## Step 4: Access Your Deployed App

### 4.1. Get Your URL

After deployment completes, Vercel will show:
```
Congratulations! Your site is live at:
https://academic-management.vercel.app
```

### 4.2. Initialize Admin User

Visit: `https://your-app-url.vercel.app/api/init`

Or use curl:
```bash
curl -X POST https://your-app-url.vercel.app/api/init \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123","name":"Admin User"}'
```

### 4.3. Sign In

Open your app URL and sign in with:
- Email: `admin@example.com`
- Password: `admin123`

---

## Step 5: Run Database Migration (One Time)

The first time you deploy, you need to create database tables:

### Option A: Use Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Run Prisma migration in production
vercel env pull .env.production
bun run db:push
```

### Option B: Use Database Provider's Console

1. Go to Neon or Supabase dashboard
2. Open **SQL Editor**
3. Run this command to see if tables exist:
   ```sql
   SELECT * FROM "User";
   ```
4. If tables don't exist, you can:
   - Deploy to Vercel (it should auto-create tables on first run)
   - Or manually run Prisma commands locally using your cloud database URL

---

## 📝 Post-Deployment Tasks

### 1. Change Admin Password

After first login, change the admin password for security.

### 2. Set Up Domain (Optional)

You can use a custom domain:
1. Go to Vercel → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS instructions

### 3. Monitor Usage

Check your usage:
- **Vercel:** Dashboard → Usage (free: 100GB bandwidth/month)
- **Neon/Supabase:** Their dashboard for storage and limits

---

## 🔄 Update Deployments

When you make code changes:

```bash
cd /home/z/my-project
git add .
git commit -m "Your commit message"
git push
```

Vercel will **automatically redeploy**! 🚀

---

## 🐛 Troubleshooting

### "Database connection failed"
- Check `DATABASE_URL` in Vercel environment variables
- Make sure database is running
- Verify SSL is enabled in connection string

### "NextAuth error"
- Make sure `NEXTAUTH_URL` matches your Vercel domain
- Generate a new `NEXTAUTH_SECRET` if needed

### "Build failed"
- Check deployment logs in Vercel dashboard
- Make sure all dependencies are in package.json

### "Site is not loading"
- Wait 1-2 minutes for DNS propagation
- Check Vercel deployment logs
- Clear browser cache

---

## 💰 Free Tier Limits

**Vercel (Hobby Plan - Free):**
- Bandwidth: 100GB/month
- Build time: 6,000 minutes/month
- Unlimited projects

**Neon (Free Tier):**
- Storage: 0.5GB
- Compute: 480 hours/month
- 1 database

**Supabase (Free Tier):**
- Storage: 500MB
- Database: 500MB
- Bandwidth: 2GB/month

---

## ✅ Success Checklist

- [ ] Database created (Neon or Supabase)
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] App deployed successfully
- [ ] Admin user created
- [ ] Can sign in and use the app

---

## 🎉 Congratulations!

Your Academic Management System is now live and accessible from anywhere! 🌍

For questions or issues:
- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Prisma Docs: https://www.prisma.io/docs
