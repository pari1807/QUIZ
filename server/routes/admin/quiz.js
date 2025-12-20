import express from 'express';
import {
  createQuiz,
  getQuizDetails,
  updateQuiz,
  deleteQuiz,
  addQuestions,
  addAttachment,
  publishQuiz,
  updateQuestion,
  importQuestions,
  exportQuiz,
  getAllQuizzes,
  manualGrade,
  getAttemptDetail,
} from '../../controllers/admin/quizController.js';
import { protect, authorize } from '../../middleware/auth.js';
import upload from '../../middleware/upload.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'teacher'));

router.route('/').get(getAllQuizzes).post(createQuiz);

router.post('/import', upload.single('file'), importQuestions);
router.get('/export/:id', exportQuiz);

router.put('/questions/:id', updateQuestion);

router.route('/:id').get(getQuizDetails).put(updateQuiz).delete(deleteQuiz);

router.post('/:id/questions', addQuestions);
router.post('/:id/attachments', upload.single('file'), addAttachment);
router.post('/:id/publish', publishQuiz);

router.put('/attempts/:id/grade', manualGrade);
router.get('/attempts/:id', getAttemptDetail);

export default router;
