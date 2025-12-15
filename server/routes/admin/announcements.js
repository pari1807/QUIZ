import express from 'express';
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
} from '../../controllers/admin/announcementController.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'teacher'));

router.route('/').get(getAllAnnouncements).post(createAnnouncement);

router.route('/:id').put(updateAnnouncement).delete(deleteAnnouncement);

export default router;
