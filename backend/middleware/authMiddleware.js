import jwt from 'jsonwebtoken';
import User from '../models/userModel.js'; // Assuming you have a user model

// user authentication middleware
const authUser = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export default authUser;