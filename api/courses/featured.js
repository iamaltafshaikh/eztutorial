import connectDB from '../../lib/config/db.js';
import { getFeaturedCourse } from '../../lib/controllers/courseController.js';
// We need to import the models to avoid Mongoose errors in serverless environments
import '../../lib/models/Course.js';
import '../../lib/models/User.js';
import '../../lib/models/Transaction.js';

export default async function handler(req, res) {
  // Connect to the database
  await connectDB();

  // We only want to handle GET requests for this endpoint
  if (req.method === 'GET') {
    // Call the original controller function
    return getFeaturedCourse(req, res);
  } else {
    // If any other method is used, return a 405 Method Not Allowed error
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}


// import connectDB from '../../config/db.js';
// import { getFeaturedCourse } from '../../controllers/courseController.js';
// // We need to import the models to avoid Mongoose errors in serverless environments
// import '../../models/Course.js';
// import '../../models/User.js';
// import '../../models/Transaction.js';


// export default async function handler(req, res) {
//   // Connect to the database
//   await connectDB();

//   // We only want to handle GET requests for this endpoint
//   if (req.method === 'GET') {
//     // Call the original controller function
//     return getFeaturedCourse(req, res);
//   } else {
//     // If any other method is used, return a 405 Method Not Allowed error
//     res.setHeader('Allow', ['GET']);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }
