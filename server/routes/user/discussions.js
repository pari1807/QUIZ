import express from 'express';
import {
  getMessages,
  postMessage,
  replyToMessage,
  addReaction,
  reportMessage,
} from '../../controllers/user/discussionController.js';
import { protect, checkMuted } from '../../middleware/auth.js';
import upload from '../../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.get('/:classroomId', getMessages);
router.post('/:classroomId', checkMuted, upload.array('attachments', 5), postMessage);

router.post('/:messageId/reply', checkMuted, replyToMessage);
router.post('/:messageId/react', addReaction);
router.post('/:messageId/report', reportMessage);

export default router;
