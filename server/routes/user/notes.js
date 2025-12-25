import express from 'express';
import {
  browseNotes,
  getNoteDetails,
  downloadNote,
  rateNote,
  saveNote,
  unsaveNote,
  uploadNote,
  getTrendingNotes,
} from '../../controllers/user/notesController.js';
import { protect } from '../../middleware/auth.js';
import upload from '../../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.get('/', browseNotes);
router.get('/trending', getTrendingNotes);
router.post('/upload', upload.single('file'), uploadNote);

router.get('/:id', getNoteDetails);
router.get('/:id/download', downloadNote);
router.post('/:id/rate', rateNote);
router.post('/:id/save', saveNote);
router.delete('/:id/save', unsaveNote);

export default router;
