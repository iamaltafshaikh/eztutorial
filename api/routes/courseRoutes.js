import express from 'express';
import {
  getCourses, createCourse, getCourseById, updateCourse, deleteCourse,
  enrollInCourse, getMyCourses, getComments, addComment,
  getEnrolledStudents, removeStudentFromCourse, deleteComment,
  getFeaturedCourse, featureCourse
} from '../controllers/courseController.js';
import { protect, isTeacher } from '../middleware/authMiddleware.js';

const router = express.Router();

// General routes
router.route('/').get(getCourses).post(protect, isTeacher, createCourse);

// Specific routes
router.route('/mycourses').get(protect, isTeacher, getMyCourses);
router.get('/featured', getFeaturedCourse);

// Routes with specific IDs
router.route('/:id/comments').get(getComments).post(protect, addComment);
router.route('/:id/students').get(protect, isTeacher, getEnrolledStudents);
router.route('/:id/students/:studentId').delete(protect, isTeacher, removeStudentFromCourse);
router.route('/:id/comments/:commentId').delete(protect, isTeacher, deleteComment);
router.route('/:id/feature').put(protect, isTeacher, featureCourse);
router.route('/:id/enroll').post(protect, enrollInCourse);

// Generic CRUD routes
router.route('/:id').get(getCourseById).put(protect, isTeacher, updateCourse).delete(protect, isTeacher, deleteCourse);

export default router;
