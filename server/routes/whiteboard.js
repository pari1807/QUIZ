import express from 'express';
import {
  createWhiteboardSession,
  getWhiteboardSession,
  updateWhiteboardSession,
  leaveWhiteboardSession,
} from '../controllers/whiteboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/:classroomId/create', createWhiteboardSession);
router.get('/:sessionId', getWhiteboardSession);
router.put('/:sessionId', updateWhiteboardSession);
router.post('/:sessionId/leave', leaveWhiteboardSession);

export default router;
