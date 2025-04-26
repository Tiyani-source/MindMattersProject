// controllers/authStudent.js
import Student from '../models/studentModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const authStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
  
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

   
    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ token, student });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
