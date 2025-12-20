import express from 'express';
import {
  listGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  listStudents,
} from '../../controllers/admin/groupController.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'teacher'));

router.get('/', listGroups);
router.post('/', createGroup);
router.get('/students', listStudents);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

export default router;
