import express from 'express';
import {
  muteUser,
  unmuteUser,
  banUser,
  unbanUser,
  deleteMessage,
  getFlaggedContent,
  resolveFlagged,
} from '../../controllers/admin/moderationController.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'moderator'));

router.post('/users/:id/mute', muteUser);
router.post('/users/:id/unmute', unmuteUser);
router.post('/users/:id/ban', authorize('admin'), banUser);
router.post('/users/:id/unban', authorize('admin'), unbanUser);

router.delete('/messages/:id', deleteMessage);

router.get('/flagged', getFlaggedContent);
router.post('/flagged/:id/resolve', resolveFlagged);

export default router;
