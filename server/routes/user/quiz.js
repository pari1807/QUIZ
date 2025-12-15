import express from 'express';
import {
  getAvailableQuizzes,
  startQuiz,
  submitQuiz,
  getQuizResults,
  getLeaderboard,
} from '../../controllers/user/quizController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getAvailableQuizzes);

router.post('/:id/start', startQuiz);
router.post('/:id/submit', submitQuiz);
router.get('/:id/results', getQuizResults);
router.get('/:id/leaderboard', getLeaderboard);

export default router;
