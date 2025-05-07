import express from 'express';
import { getAllStudents, deleteStudent, updateStudentProfile, deleteStudentProfile, getStudentProfile, changeStudentPassword, getStudentCount } from '../controllers/studentController.js';
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

studentRouter.post('/login', authStudent);
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

studentRouter.post('/update-profile', verifyToken, upload.none(), updateStudentProfile)
studentRouter.post('/delete-profile', verifyToken, deleteStudentProfile);
studentRouter.get('/get-profile', verifyToken, getStudentProfile);
studentRouter.post("/change-password", verifyToken, changeStudentPassword);
studentRouter.get('/count', getStudentCount);

// Student appointment operations
studentRouter.get("/appointments/therapists", verifyToken, getUserAppointments);    
studentRouter.get('/appointments/therapist/:therapistId', verifyToken, getTherapistAppointments);
studentRouter.post("/book-therapist", verifyToken, bookAppointment);                
studentRouter.post("/reschedule-appointment", verifyToken, rescheduleAppointment);
studentRouter.post("/cancel-appointment", verifyToken, cancelAppointment);           
studentRouter.post("/meeting-link", verifyToken, getMeetingLink);

// Get own student profile
studentRouter.get('/profile', verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.userId);
    if (!student) return res.json({ success: false, message: 'Student not found' });

    res.json({ success: true, student });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});
export default studentRouter;