import User from '../models/User.js';
import Course from '../models/Course.js';

// ------------------- ENROLLED COURSES -------------------

// Get courses a user is enrolled in
export const getMyEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const courseIds = user.enrolledCourses.map(e => e.course);
    const courses = await Course.find({ '_id': { $in: courseIds } });

    const enrolledCoursesWithDetails = user.enrolledCourses
      .map(e => {
        const courseDetails = courses.find(c => c._id.toString() === e.course.toString());
        if (!courseDetails) return null;
        return {
          _id: e._id,
          completedSections: e.completedSections,
          course: courseDetails
        };
      })
      .filter(Boolean);

    res.json(enrolledCoursesWithDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update course progress for a user
export const updateCourseProgress = async (req, res) => {
  const { courseId, sectionId } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    const courseEnrollment = user.enrolledCourses.find(e => e.course.toString() === courseId);
    if (!courseEnrollment) return res.status(404).json({ message: 'Not enrolled in this course' });

    if (!courseEnrollment.completedSections.includes(sectionId)) {
      courseEnrollment.completedSections.push(sectionId);
      await user.save();
    }

    res.status(200).json(courseEnrollment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'enrolledCourses.course',
      model: 'Course'
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const coursesInProgress = user.enrolledCourses.length;
    let coursesCompleted = 0;

    user.enrolledCourses.forEach(e => {
      const totalSections = e.course?.sections?.length || 0;
      if (totalSections > 0 && e.completedSections.length === totalSections) coursesCompleted++;
    });

    res.json({
      coursesInProgress,
      coursesCompleted,
      certificatesEarned: coursesCompleted // 1 certificate per completed course
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
