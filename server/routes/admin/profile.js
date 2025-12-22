import express from 'express';
import { getProfile, updateProfile } from '../../controllers/user/profileController.js';
import { protect, authorize } from '../../middleware/auth.js';
import upload from '../../middleware/upload.js';

const router = express.Router();

// Only authenticated admins can access these routes
router.use(protect);
router.use(authorize('admin'));

// GET /api/admin/profile  -> get admin's own profile
// PUT /api/admin/profile  -> update admin profile (including avatar upload)
router
  .route('/')
  .get(getProfile)
  .put(upload.single('avatar'), updateProfile);

export default router;
