import express from 'express';
import {
  createNote,
  updateNote,
  deleteNote,
  approveNote,
  rejectNote,
  getAllNotes,
  generateSummary,
  checkPlagiarism,
  getNoteAnalytics,
} from '../../controllers/admin/notesController.js';
import { protect, authorize } from '../../middleware/auth.js';
import upload from '../../middleware/upload.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'teacher'));

router.route('/').get(getAllNotes).post(upload.single('file'), createNote);

router.get('/analytics', getNoteAnalytics);

router.route('/:id').put(updateNote).delete(deleteNote);

router.post('/:id/approve', approveNote);
router.post('/:id/reject', rejectNote);
router.post('/:id/summary', generateSummary);
router.post('/:id/plagiarism-check', checkPlagiarism);

export default router;
