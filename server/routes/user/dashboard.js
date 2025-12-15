import express from 'express';
import {
  getSavedNotes,
  getQuizHistory,
  getPerformance,
  getUpcomingEvents,
  getNotifications,
  markNotificationRead,
  getDashboardOverview,
  getUserClassrooms,
} from '../../controllers/user/dashboardController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/overview', getDashboardOverview);
router.get('/saved-notes', getSavedNotes);
router.get('/quiz-history', getQuizHistory);
router.get('/performance', getPerformance);
router.get('/events', getUpcomingEvents);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.get('/classrooms', getUserClassrooms);

export default router;
