import connectDB from '../../lib/config/db.js';
import { getCourses } from '../../lib/controllers/courseController.js';
// Import models to prevent Mongoose errors in serverless
import '../../lib/models/Course.js';
import '../../lib/models/User.js';
import '../../lib/models/Transaction.js';

export default async function handler(req, res) {
  await connectDB();

  // This endpoint handles GET for all courses and POST to create a new one
  if (req.method === 'GET') {
    return getCourses(req, res);
  } 
  // NOTE: We will handle the POST (createCourse) logic later.
  // Let's get the GET request working first.
  else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}