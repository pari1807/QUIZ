import express from 'express';
import {
  getQuizPerformance,
  getNotesDownloads,
  getEngagement,
  getActiveUsers,
  getFlaggedContent,
  getDashboardStats,
} from '../../controllers/admin/analyticsController.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'teacher'));

router.get('/quiz-performance', getQuizPerformance);
router.get('/notes-downloads', getNotesDownloads);
router.get('/engagement', getEngagement);
router.get('/active-users', getActiveUsers);
router.get('/flagged-content', getFlaggedContent);
router.get('/dashboard', getDashboardStats);

export default router;
