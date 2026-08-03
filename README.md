# 🚀 DevTrack AI — Personal Discipline OS

> **A full-stack productivity web application** built for developers and students who want to track their daily habits, manage tasks, solve DSA problems, study smarter, and get AI-powered insights — all in one place.

---

## 📌 What Is This Project?

**DevTrack AI** is a personal productivity and discipline tracking system. Think of it as your personal operating system for becoming a better developer and student. It combines task management, habit tracking, focus timer, DSA revision, goal setting, and AI coaching into a single, beautifully designed web app.

**The core idea:** Most developers struggle to be consistent. DevTrack AI helps you build that consistency by giving you a dashboard that shows exactly what you did, what you missed, and what you should do next — powered by AI insights.

---

## 🎯 Key Features

### 1. 📊 Dashboard
- Personalized welcome with greeting based on time of day
- At-a-glance stats: Total Tasks, Completed, Focus Time, DSA Solved, Habit Streak
- Task overview donut chart
- Upcoming deadlines with overdue alerts
- Recent focus sessions
- Active goals progress
- DSA progress by category
- Quick action buttons
- Daily productivity tip powered by your own data
- Email reminder button for pending/overdue tasks

### 2. ✅ Task Board
- Create tasks with title, description, category, priority, and deadline
- Filter by: Today, Upcoming, Overdue, All
- Search tasks by name
- Filter by category (Coding, Study, College, Gym, Personal, Other)
- Filter by priority (High, Medium, Low)
- Status cycle: Todo → In Progress → Completed
- Task overview pie chart
- Productivity trend line chart
- Tasks by category bar breakdown
- Upcoming deadlines panel
- Recent completed tasks

### 3. 🕐 Routine Planner
- Plan your daily schedule hour by hour
- Set recurring daily routines (Morning, Afternoon, Evening, Night)
- Track which routines are completed each day

### 4. 🔥 Habit Tracker
- Add daily habits with custom frequency
- Auto-calculates streaks (consecutive days completed)
- Mark habits complete each day
- Visual streak display to keep you motivated

### 5. 🎯 Goal Manager
- Set goals with Daily / Weekly / Monthly periods
- Track progress from 0% to 100%
- Set deadlines for each goal
- Visual progress bars

### 6. ⏱️ Focus Timer
- Pomodoro-style focus sessions
- Modes: Coding Session, Study Session, Deep Work, Pomodoro
- Link timer sessions to specific tasks
- All sessions saved and shown in dashboard analytics

### 7. 💻 DSA Revision
- 100+ curated DSA questions across categories:
  Arrays, Strings, Linked List, Trees, Graphs, DP, Sorting, Binary Search, Stack/Queue, and more
- Mark questions as: Unsolved, Solving, Solved, Revision
- Progress tracked per category with color-coded bars
- Overall completion percentage shown on dashboard

### 8. 📚 Study Vault
- Save study notes and resources
- Organize by topic/subject
- Quick reference for revision

### 9. 📓 Learning Log / Notes
- Personal notebook for capturing learnings
- Rich text note-taking
- Image upload support via Cloudinary

### 10. 📈 Activity Timeline
- Auto-logs every action you take: task created, task completed, DSA solved, habit checked, etc.
- Timeline view of all recent activity
- Helps you see your day at a glance

### 11. 📉 Analytics
- Weekly and monthly productivity charts
- Focus time distribution (Coding, Study, Deep Work)
- Task completion trends
- Category-wise breakdown

### 12. 🤖 AI Insights
- Powered by **Google Gemini AI**
- Analyzes your productivity data
- Gives personalized advice and improvement tips
- Identifies your weak areas and suggests actions

### 13. 👤 Profile Page
- Overview with stats: Productivity Score, Total Tasks, Focus Time, Goals Achieved
- Weekly activity chart
- Streak calendar
- Recent achievements
- Activity timeline
- Edit profile: name, email, phone, location, website, bio
- **Profile photo upload** via Cloudinary
- Daily target settings (study hours, coding hours, gym time)
- Level system with XP progress bar

### 14. 🔐 Authentication
- Register with name, mobile number, and password
- Login with mobile number + password
- **Google OAuth** — one-click sign in with Google account
- JWT-based secure sessions (HTTP-only cookies)
- Password hashing with bcrypt
- Logout functionality

### 15. 📬 Email Reminders
- Send yourself an email reminder for pending/overdue tasks
- Beautiful HTML email templates
- Powered by Nodemailer (Gmail / SMTP)
- Daily summary email (cron job at 9 PM)

### 16. 🌙 Dark / Light Theme
- Fully responsive dark and light mode
- Persisted across sessions using `next-themes`

### 17. 📱 PWA Support
- Installable as a mobile/desktop app
- Works offline for basic features
- Service worker registered automatically

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4, Custom CSS-in-JS |
| **Charts** | Recharts (Line, Area, Pie, Bar) |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Backend** | Next.js API Routes (Server-side) |
| **Database** | MongoDB Atlas + Mongoose ODM |
| **Authentication** | JWT (jose library) + NextAuth v5 |
| **OAuth** | Google OAuth 2.0 via NextAuth |
| **AI** | Google Gemini API (`gemini-2.0-flash`) |
| **Image Upload** | Cloudinary |
| **Email** | Nodemailer (Gmail SMTP) |
| **Password** | bcryptjs (12 salt rounds) |
| **Validation** | Zod schema validation |
| **Forms** | React Hook Form |
| **PWA** | Web App Manifest + Service Worker |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (app)/              # Protected pages (require login)
│   │   ├── dashboard/      # Main dashboard
│   │   ├── tasks/          # Task board
│   │   ├── routine/        # Daily routine planner
│   │   ├── habits/         # Habit tracker
│   │   ├── goals/          # Goal manager
│   │   ├── timer/          # Focus timer
│   │   ├── dsa/            # DSA revision tracker
│   │   ├── study-vault/    # Study notes vault
│   │   ├── activity/       # Activity timeline
│   │   ├── analytics/      # Analytics & charts
│   │   ├── ai-insights/    # AI-powered insights
│   │   ├── notes/          # Personal notes
│   │   └── profile/        # User profile
│   ├── (auth)/             # Public auth pages
│   │   ├── login/          # Premium login page
│   │   └── register/       # Register page
│   └── api/                # REST API routes
│       ├── auth/           # login, register, logout
│       ├── profile/        # GET/PATCH profile + avatar upload
│       ├── tasks/          # Task CRUD
│       ├── habits/         # Habit CRUD
│       ├── goals/          # Goal CRUD
│       ├── sessions/       # Focus session logging
│       ├── routines/       # Routine CRUD
│       ├── ai/insights/    # Gemini AI insights
│       ├── reminder/       # Email reminder
│       └── notebooks/      # Notes with Cloudinary images
├── components/
│   ├── app/                # Layout components (Sidebar, Header)
│   ├── features/           # Feature components (Dashboard, TaskBoard, etc.)
│   ├── providers/          # React context providers
│   └── ui/                 # Reusable UI components
├── lib/                    # Utilities and helpers
│   ├── auth.ts             # Auth helpers (hash, verify, cookie)
│   ├── db.ts               # MongoDB connection
│   ├── next-auth.ts        # NextAuth config (Google + Credentials)
│   ├── ai.ts               # Gemini AI integration
│   ├── cloudinary.ts       # Image upload/delete
│   ├── email.ts            # Nodemailer email sender
│   └── env.ts              # Environment variables
├── models/                 # Mongoose data models
│   ├── User.ts
│   ├── Task.ts
│   ├── Habit.ts
│   ├── Goal.ts
│   ├── Routine.ts
│   ├── TimeSession.ts
│   ├── Notebook.ts
│   └── ActivityLog.ts
└── data/
    └── dsa-questions.ts    # 100+ curated DSA questions
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/
MONGODB_DB=devtrack_ai

# JWT Authentication
JWT_SECRET=your-super-secret-key

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash

# SMTP Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-gmail-app-password
REMINDER_EMAIL_TO=your@gmail.com

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Google Cloud Console account (for OAuth)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/devtrack-ai.git
cd devtrack-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your credentials in .env.local

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## 🗄️ Database Models

| Model | Fields |
|-------|--------|
| **User** | name, email, mobileNumber, passwordHash, googleId, avatarUrl, profession, daily targets |
| **Task** | title, description, category, priority, deadline, status |
| **Habit** | title, frequency, streak, completedToday, lastCompleted |
| **Goal** | title, period, progress, deadline |
| **Routine** | title, time, category, isCompleted |
| **TimeSession** | mode, durationMinutes, taskTitle, startedAt |
| **Notebook** | title, content, images (Cloudinary), tags |
| **ActivityLog** | type, description, createdAt |

---

## 🔒 Security Features

- Passwords hashed with **bcrypt** (12 rounds) — never stored as plain text
- JWT tokens stored in **HTTP-only cookies** — not accessible by JavaScript
- All API routes protected with authentication middleware
- Input validation with **Zod** on every API endpoint
- Environment variables never exposed to the client
- Cloudinary secrets kept server-side only

---

## 🎨 Design Highlights

- **Dark-first design** with smooth light mode toggle
- Custom animated login page with mountain landscape SVG
- Glassmorphism cards with backdrop blur
- Animated particle effects on auth pages
- Responsive layout — works on mobile, tablet, and desktop
- Smooth CSS animations and transitions throughout
- Color-coded priority and category system

---

## 💡 Interview Talking Points

**"What problem does this solve?"**
> Most productivity apps are either too simple or too complex. DevTrack AI is built specifically for developers and CS students — it combines everything they need: DSA tracking, coding focus sessions, study notes, and AI coaching in one app.

**"What was the hardest part to build?"**
> The AI Insights feature — feeding user data (tasks, habits, focus sessions, DSA progress) into Gemini and getting meaningful, personalized advice required careful prompt engineering and data aggregation.

**"How did you handle authentication?"**
> I implemented dual authentication: custom JWT-based credentials login (mobile + password) and Google OAuth via NextAuth v5. Both flows set HTTP-only cookies for security.

**"How is data stored?"**
> Most feature data (tasks, habits, goals) is stored in **localStorage** on the client for instant performance. User account data and profile info is in **MongoDB Atlas**. Images are in **Cloudinary**.

**"What would you add next?"**
> Push notifications for task reminders, a mobile app with React Native, collaborative study sessions, and a leaderboard for DSA progress among friends.

---

## 👨‍💻 Author

**Rahul Kumar**
- Student Developer | Bihar, India
- Building habits & mastering code one day at a time

---

## 📄 License

This project is for personal and educational use.
