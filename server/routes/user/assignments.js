import express from 'express';
import {
  getAssignments,
  submitAssignment,
  getSubmissionStatus,
} from '../../controllers/user/assignmentController.js';
import { protect } from '../../middleware/auth.js';
import upload from '../../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.get('/', getAssignments);

router.post('/:id/submit', upload.array('files', 10), submitAssignment);
router.get('/:id/submission', getSubmissionStatus);

export default router;
