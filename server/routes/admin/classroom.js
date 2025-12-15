import express from 'express';
import {
  createClassroom,
  updateClassroom,
  deleteClassroom,
  generateInvite,
  addMembers,
  updateMemberRole,
  getAllClassrooms,
  removeMember,
} from '../../controllers/admin/classroomController.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'teacher'));

router.route('/').get(getAllClassrooms).post(createClassroom);

router.route('/:id').put(updateClassroom).delete(deleteClassroom);

router.post('/:id/invite', generateInvite);
router.post('/:id/members', addMembers);
router.put('/:id/members/:userId/role', updateMemberRole);
router.delete('/:id/members/:userId', removeMember);

export default router;
