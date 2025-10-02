import express from 'express';
import { getMyEnrolledCourses, updateCourseProgress, getUserStats } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-courses', protect, getMyEnrolledCourses);
router.post('/my-courses/progress', protect, updateCourseProgress);
router.get('/stats', protect, getUserStats);

export default router;
