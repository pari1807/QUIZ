import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import connectDB from './config/database.js';
import { initSocket } from './config/socket.js';

// Import routes
import authRoutes from './routes/auth.js';
import adminNotesRoutes from './routes/admin/notes.js';
import adminQuizRoutes from './routes/admin/quiz.js';
import adminClassroomRoutes from './routes/admin/classroom.js';
import adminAnalyticsRoutes from './routes/admin/analytics.js';
import adminModerationRoutes from './routes/admin/moderation.js';
import adminAnnouncementRoutes from './routes/admin/announcements.js';
import adminTicketRoutes from './routes/admin/tickets.js';
import userNotesRoutes from './routes/user/notes.js';
import userQuizRoutes from './routes/user/quiz.js';
import userDiscussionRoutes from './routes/user/discussions.js';
import userDashboardRoutes from './routes/user/dashboard.js';
import userAssignmentRoutes from './routes/user/assignments.js';
import userProfileRoutes from './routes/user/profile.js';
import whiteboardRoutes from './routes/whiteboard.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// Initialize socket event handlers
import { initDiscussionSocket } from './sockets/discussionSocket.js';
import { initWhiteboardSocket } from './sockets/whiteboardSocket.js';

initDiscussionSocket();
initWhiteboardSocket();

//Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Routes
app.use('/api/auth', authRoutes);

// Admin routes
app.use('/api/admin/notes', adminNotesRoutes);
app.use('/api/admin/quizzes', adminQuizRoutes);
app.use('/api/admin/classrooms', adminClassroomRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api/admin/moderation', adminModerationRoutes);
app.use('/api/admin/announcements', adminAnnouncementRoutes);
app.use('/api/admin/tickets', adminTicketRoutes);

// User routes
app.use('/api/notes', userNotesRoutes);
app.use('/api/quizzes', userQuizRoutes);
app.use('/api/discussions', userDiscussionRoutes);
app.use('/api/dashboard', userDashboardRoutes);
app.use('/api/assignments', userAssignmentRoutes);
app.use('/api/profile', userProfileRoutes);
app.use('/api/whiteboard', whiteboardRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

export default app;
