import express from 'express';
import { protect } from '../../middleware/auth.js';
import { getUserClassroomTopicsWithVideos } from '../../controllers/user/classroomContentController.js';

const router = express.Router();

router.use(protect);

router.get('/:id/topics', getUserClassroomTopicsWithVideos);

export default router;
