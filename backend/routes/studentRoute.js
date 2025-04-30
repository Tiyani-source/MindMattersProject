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

const studentRouter = express.Router();

// Student profile operations
studentRouter.get("/view", getAllStudents);
studentRouter.delete("/delete/:id", deleteStudent);
studentRouter.post('/login', authStudent);
studentRouter.post('/update-profile', verifyToken, upload.none(), updateStudentProfile);
studentRouter.post('/delete-profile', verifyToken, deleteStudentProfile);

// Student appointment operations
studentRouter.get("/appointments/therapists", authStudent, getUserAppointments);    // ✅ new function
studentRouter.get('/appointments/therapist/:therapistId', authStudent, getTherapistAppointments);
studentRouter.post("/book-therapist", authStudent, bookAppointment);                 // ✅ new function
studentRouter.post("/reschedule-appointment", authStudent, rescheduleAppointment);
studentRouter.post("/cancel-appointment", authStudent, cancelAppointment);           // ✅ new function
studentRouter.post("/meeting-link", authStudent, getMeetingLink);

// Get own student profile
studentRouter.get('/profile', verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.userId);
    if (!student) return res.json({ success: false, message: 'Student not found' });

    res.json({ success: true, student });
  } catch (err) {
    console.error("Error fetching student profile:", err);
    res.json({ success: false, message: err.message });
  }
});

export default studentRouter;