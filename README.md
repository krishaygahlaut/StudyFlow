# ⚡ StudyFlow Pro v2.0

> A production-grade full-stack academic productivity SaaS with Student, Faculty, and Admin dashboards.

![StudyFlow Pro](https://img.shields.io/badge/Version-2.0.0-a855f7?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=for-the-badge&logo=mongodb)

---

## ✨ Features

| Role | Features |
|------|----------|
| 🎓 **Student** | Tasks, Calendar, Notes, Analytics, Study Planner, Achievements, Pomodoro Timer |
| 👨‍🏫 **Faculty** | Student tracking, Performance analytics, At-risk alerts, Messaging |
| 🛡️ **Admin** | User management, Faculty creation, Audit logs, System stats, Broadcasts |

**Production Features:**
- JWT auth with refresh tokens
- Password strength validation (uppercase, number, symbol)
- Email verification + password reset flows
- Rate limiting + Helmet security headers
- MongoDB sanitization against injection
- Role-based access control (student / faculty / admin)
- Audit logging for all admin actions
- Glassmorphism dark UI with Framer Motion animations
- XP gamification with achievements + confetti

---

## 🗂️ Project Structure

```
studyflow-pro/
├── backend/
│   ├── config/          db.js
│   ├── controllers/     auth.js, main.js, faculty.js, admin.js
│   ├── middleware/       auth.js, validate.js, errorHandler.js
│   ├── models/          User.js, Task.js, index.js (Note/Session/Achievement/Notification/AuditLog)
│   ├── routes/          auth.js, tasks.js, notes.js, index.js (all others)
│   ├── services/        emailService.js
│   ├── utils/           seeder.js
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── vercel.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/  Layout.jsx
    │   │   └── ui/      LoadingScreen, NotificationPanel, FloatingTimer, StatCard, EmptyState, Skeleton
    │   ├── contexts/    AuthContext.jsx
    │   ├── pages/
    │   │   ├── auth/    Login, Register, ForgotPassword, ResetPassword, VerifyEmail
    │   │   ├── student/ Dashboard, Tasks, Calendar, Notes, Analytics, Planner, Achievements, Profile
    │   │   ├── faculty/ FacultyDashboard, FacultyStudents, FacultyStudentDetail
    │   │   └── admin/   AdminDashboard, AdminUsers, AdminUserDetail, AdminAuditLogs
    │   ├── services/    api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── vercel.json
```

---

## 🚀 Run Locally (VS Code / Mac / Windows)

### Prerequisites
- Node.js 18+ → [nodejs.org](https://nodejs.org)
- MongoDB Community → [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- Git → [git-scm.com](https://git-scm.com)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/studyflow-pro.git
cd studyflow-pro
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` — the minimum required:
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/studyflow_pro
JWT_SECRET=any_random_string_at_least_32_chars_long
JWT_REFRESH_SECRET=another_random_string_32_chars
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start MongoDB (Mac):
```bash
brew services start mongodb-community
```

Start MongoDB (Windows): Open Services → start MongoDB

Seed demo data:
```bash
node utils/seeder.js
```

Start backend:
```bash
npm run dev
```
✅ You should see: `🚀 StudyFlow Pro v2.0 running on port 4000`

### 3. Frontend setup (new terminal tab)
```bash
cd ../frontend
npm install
npm run dev
```
✅ Open: **http://localhost:5173**

### 4. Login credentials
| Role | Email | Password |
|------|-------|----------|
| 🛡️ Admin | admin@studyflow.app | Admin@123456 |
| 👨‍🏫 Faculty | sarah.chen@studyflow.app | Faculty@123456 |
| 🎓 Student | alex@studyflow.app | Student@123456 |
| 🎓 Student | priya@studyflow.app | Student@123456 |

---

## 🌐 Deploy for FREE

### Option A: Render (Backend) + Vercel (Frontend) — Recommended

#### Step 1: Push to GitHub
```bash
# In project root
git init
git add .
git commit -m "Initial commit: StudyFlow Pro v2.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/studyflow-pro.git
git push -u origin main
```

#### Step 2: MongoDB Atlas (Free Database)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account → Click **Build a Database** → Choose **M0 Free**
3. Pick any cloud region → Create cluster
4. Set username + password (save these!)
5. Under **Network Access** → Add IP Address → **Allow access from anywhere** (0.0.0.0/0)
6. Click **Connect** → **Connect your application** → Copy the connection string
7. Replace `<password>` in the string with your actual password

Your URI will look like:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/studyflow_pro
```

#### Step 3: Deploy Backend on Render (Free)
1. Go to [render.com](https://render.com) → Sign up with GitHub
2. Click **New** → **Web Service**
3. Connect your GitHub repo → select `studyflow-pro`
4. Configure:
   - **Name:** studyflow-pro-backend
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free
5. Add Environment Variables (click **Add Environment Variable** for each):
   ```
   NODE_ENV=production
   PORT=4000
   MONGO_URI=<your Atlas connection string>
   JWT_SECRET=<generate: openssl rand -base64 32>
   JWT_REFRESH_SECRET=<generate another: openssl rand -base64 32>
   CLIENT_URL=https://your-app.vercel.app
   EMAIL_HOST=smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_USER=<mailtrap user>
   EMAIL_PASS=<mailtrap pass>
   EMAIL_FROM=noreply@studyflow.app
   EMAIL_FROM_NAME=StudyFlow
   ADMIN_EMAIL=admin@studyflow.app
   ADMIN_PASSWORD=Admin@123456
   ```
6. Click **Create Web Service**
7. Wait ~3 minutes for deploy
8. Your backend URL: `https://studyflow-pro-backend.onrender.com`
9. **Seed data:** Open Render dashboard → Shell tab → run:
   ```bash
   node utils/seeder.js
   ```

#### Step 4: Deploy Frontend on Vercel (Free)
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **Add New** → **Project**
3. Import your `studyflow-pro` repository
4. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add Environment Variable:
   ```
   VITE_API_URL=https://studyflow-pro-backend.onrender.com
   ```
6. Click **Deploy**
7. Your live URL: `https://studyflow-pro.vercel.app`

#### Step 5: Update CORS
Go back to Render → Environment Variables → update:
```
CLIENT_URL=https://studyflow-pro.vercel.app
```
Click **Save Changes** → Render redeploys automatically.

#### Step 6: Update frontend API URL
In `frontend/src/services/api.js`, replace:
```js
const api = axios.create({ baseURL: '/api', ... })
```
With:
```js
const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api` 
    : '/api',
  ...
})
```
Commit and push — Vercel redeploys automatically.

---

### Option B: Railway (Backend + DB together — even simpler)
1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. New Project → Deploy from GitHub repo
3. Set Root Directory to `backend`
4. Add a MongoDB plugin: Click **+ New** → **Database** → **MongoDB**
5. Railway auto-injects `MONGO_URL` — use it as your `MONGO_URI`
6. Add other env vars same as above
7. Deploy!

---

## 📤 Push to GitHub

```bash
# One-time setup
git init
git add .
git commit -m "feat: StudyFlow Pro v2.0 - Full Stack SaaS"
git branch -M main

# Create repo at github.com then:
git remote add origin https://github.com/YOUR_USERNAME/studyflow-pro.git
git push -u origin main

# Future updates:
git add .
git commit -m "your message"
git push
```

### Recommended GitHub repo settings:
- Add **Description:** `Full-stack student productivity SaaS — React, Node.js, MongoDB, JWT Auth`
- Add **Topics:** `react`, `nodejs`, `mongodb`, `tailwindcss`, `framer-motion`, `saas`, `student-productivity`
- Add a `LICENSE` (MIT recommended)

---

## 🔑 Generate Secure Secrets

Run in terminal:
```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Refresh Secret  
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📧 Email Setup (Optional but recommended)

### For development: Mailtrap (free)
1. Sign up at [mailtrap.io](https://mailtrap.io)
2. Go to **Email Testing** → **Inboxes** → SMTP Settings
3. Copy credentials to `.env`

### For production: Resend (free tier 3000 emails/month)
1. Sign up at [resend.com](https://resend.com)
2. Get API key
3. Use SMTP settings in `.env`

---

## 🛠️ Common Issues & Fixes

| Error | Fix |
|-------|-----|
| `EADDRINUSE port 4000` | `lsof -ti:4000 \| xargs kill -9` then restart |
| `Cannot connect to MongoDB` | Check MongoDB is running: `brew services start mongodb-community` |
| Login fails | Run `node utils/seeder.js` in backend folder |
| Vite not found | Run `npm install` in the frontend folder |
| CORS error | Make sure `CLIENT_URL` in `.env` matches your frontend URL exactly |
| Render free tier sleeps | Free Render services sleep after 15min. Upgrade to $7/mo Starter to keep awake |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT + Refresh Tokens, bcryptjs |
| Security | Helmet, express-mongo-sanitize, Rate limiting |
| Email | Nodemailer |
| Charts | Recharts |
| Icons | Lucide React |
| Animations | Framer Motion, canvas-confetti |
| Hosting | Vercel (frontend) + Render (backend) + MongoDB Atlas (DB) |

---

## 📄 License

MIT License — free to use, modify, and deploy commercially.

---

Built with ❤️ — StudyFlow Pro v2.0
