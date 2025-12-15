import express from 'express';
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestions,
  publishQuiz,
  importQuestions,
  exportQuiz,
  getAllQuizzes,
  manualGrade,
} from '../../controllers/admin/quizController.js';
import { protect, authorize } from '../../middleware/auth.js';
import upload from '../../middleware/upload.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'teacher'));

router.route('/').get(getAllQuizzes).post(createQuiz);

router.post('/import', upload.single('file'), importQuestions);
router.get('/export/:id', exportQuiz);

router.route('/:id').put(updateQuiz).delete(deleteQuiz);

router.post('/:id/questions', addQuestions);
router.post('/:id/publish', publishQuiz);

router.put('/attempts/:id/grade', manualGrade);

export default router;
