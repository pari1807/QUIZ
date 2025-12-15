import express from 'express';
import {
  getAllTickets,
  updateTicketStatus,
  replyToTicket,
  assignTicket,
} from '../../controllers/admin/ticketController.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'teacher', 'moderator'));

router.get('/', getAllTickets);

router.put('/:id/status', updateTicketStatus);
router.post('/:id/reply', replyToTicket);
router.put('/:id/assign', assignTicket);

export default router;
