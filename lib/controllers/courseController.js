import Course from '../models/Course.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

// ------------------- COURSES -------------------

// Get all courses
export const getCourses = async (req, res) => {
  try {
    const keyword = req.query.search ? { $text: { $search: req.query.search } } : {};
    const courses = await Course.find({ ...keyword });
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get a single course by ID
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create a new course
export const createCourse = async (req, res) => {
  const { title, price, category, image, sections } = req.body;
  try {
    const course = new Course({
      title,
      price,
      category,
      image,
      sections,
      author: req.user.name,
      authorId: req.user._id,
    });
    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update a course
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.authorId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'User not authorized' });

    const { title, category, price, image, sections } = req.body;
    course.title = title || course.title;
    course.category = category || course.category;
    course.price = price || course.price;
    course.image = image || course.image;
    course.sections = sections || course.sections;

    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a course
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.authorId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'User not authorized' });

    await course.deleteOne();
    res.json({ message: 'Course removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ------------------- ENROLLMENT -------------------

// Enroll a student in a course
export const enrollInCourse = async (req, res) => {
  const courseId = req.params.id;
  const studentId = req.user._id;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const student = await User.findById(studentId);
    const teacher = await User.findById(course.authorId);
    if (!student || !teacher) return res.status(404).json({ message: 'User not found' });

    const alreadyEnrolled = student.enrolledCourses.some(e => e.course.toString() === courseId);
    if (alreadyEnrolled) return res.status(400).json({ message: 'Already enrolled' });

    if (student.tokenBalance < course.price) return res.status(400).json({ message: 'Insufficient token balance' });

    student.tokenBalance -= course.price;
    teacher.tokenBalance += course.price;

    await Transaction.create({
      fromUser: studentId,
      toUser: teacher._id,
      course: courseId,
      amount: course.price,
    });

    student.enrolledCourses.push({ course: courseId, completedSections: [] });
    await student.save();
    await teacher.save();

    res.status(200).json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get courses created by a teacher
export const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ authorId: req.user._id });
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ------------------- COMMENTS -------------------

// Get comments
export const getComments = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Add comment
export const addComment = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.params.id);

    const enrolled = user.enrolledCourses.some(e => e.course.toString() === course._id.toString());
    if (!enrolled) return res.status(403).json({ message: 'Must be enrolled to comment' });

    const newComment = {
      text: req.body.text,
      userName: req.user.name,
      user: req.user._id,
    };

    course.comments.unshift(newComment);
    await course.save();
    res.status(201).json(course.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.authorId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized to delete comments' });

    course.comments = course.comments.filter(c => c._id.toString() !== req.params.commentId);
    await course.save();
    res.json(course.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ------------------- STUDENTS -------------------

// Get students in a course
export const getEnrolledStudents = async (req, res) => {
  try {
    const users = await User.find({ 'enrolledCourses.course': req.params.id });
    res.json(users.map(u => ({ _id: u._id, name: u.name, email: u.email })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Remove a student
export const removeStudentFromCourse = async (req, res) => {
  const { studentId, id: courseId } = req.params;
  try {
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    student.enrolledCourses = student.enrolledCourses.filter(e => e.course.toString() !== courseId);
    await student.save();
    res.json({ message: 'Student removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ------------------- FEATURED COURSES -------------------

export const getFeaturedCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ isFeatured: true });
    if (!course) return res.status(404).json({ message: 'No featured course found' });
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const featureCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.authorId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    // Remove featured from all teacher's courses
    await Course.updateMany({ authorId: req.user._id }, { isFeatured: false });

    course.isFeatured = true;
    await course.save();
    res.json({ message: `Course "${course.title}" is now featured.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
