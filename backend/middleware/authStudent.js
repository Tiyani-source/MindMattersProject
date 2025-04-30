// controllers/authStudent.js
import Student from '../models/studentModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const authStudent = async (req, res, next) => {
  try {
    const { token } = req.headers;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login."
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find student by ID
    const student = await Student.findById(decoded.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Add student info to request
    req.student = student;
    req.studentId = student._id;

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};
