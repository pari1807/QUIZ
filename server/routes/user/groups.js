import express from 'express';
import { protect, checkMuted } from '../../middleware/auth.js';
import upload from '../../middleware/upload.js';
import {
  getMyGroups,
  getGroupMessages,
  postGroupMessage,
} from '../../controllers/user/groupController.js';

const router = express.Router();

router.use(protect);

router.get('/mine', getMyGroups);
router.get('/:groupId/messages', getGroupMessages);
router.post(
  '/:groupId/messages',
  checkMuted,
  upload.array('attachments', 5),
  postGroupMessage
);

export default router;
