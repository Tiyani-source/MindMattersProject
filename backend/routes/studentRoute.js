import express from 'express';
import { getAllStudents, deleteStudent, updateStudentProfile,deleteStudentProfile,changeStudentPassword,getStudentProfile,getStudentCount } from '../controllers/studentController.js';
import { authStudent } from '../middleware/authStudent.js';
import { verifyToken } from '../middleware/verifyToken.js';
import upload from '../middleware/uploadMiddleware.js';
import Student from '../models/studentModel.js';
import multer from 'multer'



const studentRouter = express.Router();

studentRouter.get("/view", getAllStudents);
studentRouter.delete("/delete/:id", deleteStudent);
studentRouter.post('/login', authStudent);
studentRouter.post('/update-profile', verifyToken, upload.none(), updateStudentProfile)
studentRouter.post('/delete-profile', verifyToken, deleteStudentProfile);
studentRouter.post("/change-password", verifyToken, changeStudentPassword);
studentRouter.get('/count', getStudentCount);
studentRouter.get('/get-profile', verifyToken, getStudentProfile);
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
