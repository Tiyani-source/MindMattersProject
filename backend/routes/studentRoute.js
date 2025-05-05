import express from 'express';
import { getAllStudents, deleteStudent, updateStudentProfile, deleteStudentProfile } from '../controllers/studentController.js';
import { authStudent } from '../middleware/authStudent.js';
import { verifyToken } from '../middleware/verifyToken.js';
import upload from '../middleware/uploadMiddleware.js';
import Student from '../models/studentModel.js';
import {
  getUserAppointments,  // ✅ updated
  bookAppointment,      // ✅ updated
  rescheduleAppointment,
  cancelAppointment,    // ✅ updated
  getMeetingLink,
  getTherapistAppointments
} from '../controllers/userAppointmentController.js'; // ✅ correctly imported from updated controller
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const studentRouter = express.Router();

// Student profile operations
studentRouter.get("/view", getAllStudents);
studentRouter.delete("/delete/:id", deleteStudent);

// Login route with proper controller
studentRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find student by email
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: student._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      student: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

studentRouter.post('/update-profile', authStudent, upload.none(), updateStudentProfile);
studentRouter.post('/delete-profile', authStudent, deleteStudentProfile);

// Student appointment operations
studentRouter.get("/appointments/therapists", authStudent, getUserAppointments);    // ✅ new function
studentRouter.get('/appointments/therapist/:therapistId', authStudent, getTherapistAppointments);
studentRouter.post("/book-therapist", authStudent, bookAppointment);                 // ✅ new function
studentRouter.post("/reschedule-appointment", authStudent, rescheduleAppointment);
studentRouter.post("/cancel-appointment", authStudent, cancelAppointment);           // ✅ new function
studentRouter.post("/meeting-link", authStudent, getMeetingLink);

// Get own student profile
studentRouter.get('/profile', authStudent, async (req, res) => {
  try {
    const student = await Student.findById(req.studentId);
    if (!student) return res.json({ success: false, message: 'Student not found' });

    res.json({ success: true, student });
  } catch (err) {
    console.error("Error fetching student profile:", err);
    res.json({ success: false, message: err.message });
  }
});

export default studentRouter;