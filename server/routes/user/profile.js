import express from 'express';
import {
  getProfile,
  updateProfile,
  getAchievements,
  updateNotificationPreferences,
  getLeaderboard,
} from '../../controllers/user/profileController.js';
import { protect } from '../../middleware/auth.js';
import upload from '../../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getProfile).put(upload.single('avatar'), updateProfile);

router.get('/achievements', getAchievements);
router.put('/notifications', updateNotificationPreferences);
router.get('/leaderboard', getLeaderboard);

export default router;
