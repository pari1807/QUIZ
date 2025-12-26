# 🎓 Educational Platform - MERN Stack

A comprehensive educational platform with advanced admin features and engaging user experience, built with the MERN stack.
<img width="1908" height="951" alt="image" src="https://github.com/user-attachments/assets/3e4da168-6eb1-49ce-944a-9edc4cf2fe91" />

## GITHUB COMMAND

<img width="1402" height="859" alt="image" src="https://github.com/user-attachments/assets/5ffcf651-914b-4af2-ab96-4326f6c9b547" />
<img width="1217" height="681" alt="image" src="https://github.com/user-attachments/assets/ffaaf3cd-ebc7-41a6-87b8-032b0607ed2d" />
<img width="1197" height="225" alt="image" src="https://github.com/user-attachments/assets/935cb4a8-61ba-4c79-99b4-bcc58e959ae1" />
<img width="1860" height="1018" alt="image" src="https://github.com/user-attachments/assets/d32ec34d-ec73-4ffb-8822-a04031efad81" />
<img width="1860" height="1018" alt="image" src="https://github.com/user-attachments/assets/0bfa0f28-3120-4acf-809e-6360ef0543c1" />
<img width="1860" height="1018" alt="image" src="https://github.com/user-attachments/assets/69092b16-9314-45a9-9445-3e70ded6be8d" />
<img width="1860" height="1018" alt="image" src="https://github.com/user-attachments/assets/aa09b13b-de48-49cc-a8f6-d0cb3171f191" />
<img width="1860" height="1018" alt="image" src="https://github.com/user-attachments/assets/380eeb61-7b26-488c-95d4-76ecd80b3116" />








## ✨ Features

### 🔥 Admin Features
- **Advanced Notes Management**: Upload, update, delete, categorize notes with AI summary generation
- **Powerful Quiz Builder**: MCQ, True/False, Short Answer support with auto-grading and CSV import/export
- **Classroom & Batch Controls**: Create classrooms, generate invite links, manage roles
- **Analytics Dashboard**: Quiz performance graphs, download stats, engagement metrics
- **Discussion Moderation**: Spam detection, content flagging, user mute/ban
- **Custom Announcements**: Broadcast messages with scheduling
- **Ticket Support System**: Student issue tracking and resolution

### 🚀 User Features
- **Smart Notes Sharing**: Upload, search, filter, rate, and download notes
- **Quiz System**: Live and practice quizzes with instant results and leaderboards
- **Real-Time Discussions**: Subject-wise chat rooms with threading, mentions, and reactions
- **Personal Dashboard**: Saved notes, quiz history, performance suggestions
- **Assignment Management**: Submit assignments with deadline tracking
- **Collaborative Whiteboard**: Real-time multi-user drawing and collaboration
- **Gamification**: XP points, levels, badges, and weekly rewards

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.io (real-time features)
- JWT Authentication
- Cloudinary (file storage)
- Multer (file uploads)

**Frontend:**
- React 18
- Vite
- TailwindCSS
- Zustand (state management)
- Socket.io-client
- React Router
- Recharts (analytics)
- React Hot Toast

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn
- Cloudinary account (for file uploads)

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd QUIZ
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

**Edit `.env` file:**
```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/quiz-platform

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Cloudinary (Get from cloudinary.com)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional: OpenAI for AI summaries
OPENAI_API_KEY=your-openai-key

# Frontend URL
CLIENT_URL=http://localhost:5173
```

**Start the backend server:**
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📁 Project Structure

```
QUIZ/
├── server/
│   ├── config/          # Database, Socket.io, Cloud storage config
│   ├── controllers/     # Request handlers
│   │   ├── admin/       # Admin controllers
│   │   └── user/        # User controllers
│   ├── middleware/      # Auth, upload middleware
│   ├── models/          # MongoDB models (14 models)
│   ├── routes/          # API routes
│   │   ├── admin/       # Admin routes
│   │   └── user/        # User routes
│   ├── services/        # Business logic (gamification, file upload, spam detection)
│   ├── sockets/         # Socket.io event handlers
│   └── server.js        # Main server file
│
└── client/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   │   ├── Admin/   # Admin pages
    │   │   ├── Auth/    # Login/Register
    │   │   └── User/    # User pages
    │   ├── services/    # API and Socket services
    │   ├── store/       # Zustand state management
    │   ├── App.jsx      # Main app component
    │   └── main.jsx     # Entry point
    └── public/
```

## 🎯 API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/refresh` - Refresh token
- GET `/api/auth/me` - Get current user

### Admin Routes
- Notes: `/api/admin/notes/*`
- Quizzes: `/api/admin/quizzes/*`
- Classrooms: `/api/admin/classrooms/*`
- Analytics: `/api/admin/analytics/*`
- Moderation: `/api/admin/moderation/*`
- Announcements: `/api/admin/announcements/*`
- Tickets: `/api/admin/tickets/*`

### User Routes
- Notes: `/api/notes/*`
- Quizzes: `/api/quizzes/*`
- Discussions: `/api/discussions/*`
- Dashboard: `/api/dashboard/*`
- Assignments: `/api/assignments/*`
- Profile: `/api/profile/*`
- Whiteboard: `/api/whiteboard/*`

## 🎮 Usage

### Creating an Admin Account
1. Register a new account
2. Manually update the role in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Testing the Platform
1. Create a classroom as admin
2. Generate invite link
3. Create quiz with questions
4. Publish quiz
5. Login as student and take quiz
6. View analytics and leaderboard

## 🔧 Features Implementation Status

### ✅ Completed (Backend)
- [x] All 14 database models
- [x] Authentication & JWT
- [x] File upload service
- [x] Admin APIs (Notes, Quiz, Classroom, Analytics, Moderation, Announcements, Tickets)
- [x] User APIs (Notes, Quiz, Discussions, Dashboard, Assignments, Profile, Whiteboard)
- [x] Socket.io setup
- [x] Gamification service
- [x] Spam detection
- [x] Auto-grading system

### ✅ Completed (Frontend)
- [x] Project setup with Vite + React
- [x] TailwindCSS configuration
- [x] API service layer
- [x] Socket.io service
- [x] Auth store (Zustand)
- [x] Routing setup
- [x] Login/Register pages

### 🚧 To Be Implemented (Frontend UI)
- [ ] User dashboard with stats
- [ ] Notes browsing and upload UI
- [ ] Quiz taking interface
- [ ] Real-time discussion UI
- [ ] Collaborative whiteboard canvas
- [ ] Admin dashboard with charts
- [ ] Quiz builder interface
- [ ] Analytics visualizations
- [ ] Profile & gamification UI

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`

**File Upload Error:**
- Verify Cloudinary credentials
- Check file size limits

**Socket.io Connection Issues:**
- Ensure backend server is running
- Check CORS configuration

## 📝 License

##### features 

🔥 ADMIN FEATURES (Tum yahan weak soch rahe ho — strengthen this)
1. Advance Note Management System

Notes upload, update, delete

Note categories (subject, topic, difficulty)

Notes ka plagiarism check ya AI summary generation (value add)

2. Quiz Builder (Normal quiz se zyada powerful)

MCQ, True/False, Short answer support

Timer per quiz

Random question shuffle

Auto grading + manual override

Question bank store + import/export (CSV)

3. Classroom & Batch Controls

Classroom create/delete

Students ko invite link se add karna

Role management (student, moderator, teacher assistant)

4. Analytics Dashboard

Ye tum log ignore karte ho, but iska impact project me 10x hota hai:

Quiz performance graph

Most downloaded notes

Student engagement stats

Active users report

Flagged messages or reports

5. Discussion Moderation Tools

Spam detection

Suspicious content auto-flagging

Students mute/ban feature

Delete specific messages

6. File & Storage Control

Max upload limits

File type restrictions

Cloud storage integration (S3 / Cloudinary)

7. Custom Announcements Panel

Broadcast messages to all classrooms

Scheduled announcements

8. User Support Tools

Ticket system: students raise issues

Ticket status change (open/processing/resolved)

🔥 USER FEATURES (Exactly student pain-points target karo)
1. Smart Notes Sharing System

Upload handwritten or typed notes

Preview before download

Tags + search filters (subject, semester)

Notes rating system (students rate notes quality)

2. Quiz Taking System

Live quizzes + practice quizzes

Timer countdown

Instant result + detailed solution

Leaderboard (motivation ke liye)

3. Real-Time Discussion Rooms

Subject-wise chat rooms

Threaded replies

Mention feature (@username)

Reactions (👍❤️🔥)

4. Personal Dashboard

Saved notes

Quiz history + performance improvement suggestions

Upcoming events/announcements

5. Assignment Upload Feature (optional but strong)

Students submit assignments

Submission deadlines

Auto-check for missed deadlines

6. Collaborative Whiteboard (big differentiator)

Most projects me nahi hota — tumhara standout ban jayega.

Real-time multi-user drawing/writing

Teachers share concepts like virtual board

7. Profile & Settings

Change profile pic

Bio: course, semester

Notification preferences

8. Gamification

Tumhara product boring nahi hona chahiye.

XP points on quizzes

Badges: “Top Scorer”, “Active Learner”

Weekly reward system

💥 EXTRA FEATURES (Premium-level additions, agar level upar chahiye)
AI-Based Features (simple to integrate with OpenAI API)

Auto summary of long notes

Auto quiz generator from PDFs

Student performance improvement suggestions

Offline Sync Mode (PWA)

Notes offline download

Quiz attempt offline → sync when online

Voice Notes

Many students prefer audio explanations.

Screen Recording Prevention

(Thoda complex, par front-end obfuscation possible)
