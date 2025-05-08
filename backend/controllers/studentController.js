import StudentModel from "../models/studentModel.js";
import bcrypt from "bcryptjs";

// Get all students
export const getAllStudents = async (req, res) => {
  try {
    const students = await StudentModel.find().sort({ createdAt: -1 });
    res.json({ success: true, students });
  } catch (error) {
    console.error("Error fetching students:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch students" });
  }
};

// Get student profile
export const getStudentProfile = async (req, res) => {
  try {
    const student = await StudentModel.findById(req.userId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Remove sensitive information before sending
    const studentData = {
      _id: student._id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      address: student.address,
      apartment: student.apartment,
      city: student.city,
      postalCode: student.postalCode,
      district: student.district,
      country: student.country,
      universityId: student.universityId,
      universityName: student.universityName,
      degree: student.degree,
      year: student.year,
      semester: student.semester,
      gender: student.gender,
      status: student.status
    };

    res.json({ success: true, studentData });
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({ success: false, message: "Failed to fetch student profile" });
  }
};

// Delete student by ID
export const deleteStudent = async (req, res) => {
  try {
    const student = await StudentModel.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error.message);
    res.status(500).json({ success: false, message: "Error deleting student" });
  }
};

// Update student phone & address
export const updateStudentProfile = async (req, res) => {
  try {
    const userId = req.userId; // injected by verifyToken middleware
    const student = await StudentModel.findById(userId);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const { phone, address } = req.body;

    if (phone) {
      student.phone = phone;
    }

   
    if (address) {
      student.address = address;
    }

    console.log("📦 Phone to save:", phone)
    console.log("📦 Address to save:", address)

    await student.save();

    res.json({ success: true, message: "Profile updated successfully!" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStudentProfile = async (req, res) => {
  try {
    const student = await StudentModel.findById(req.userId);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    const { password } = req.body;
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.json({ success: false, message: "Incorrect password" });

    await StudentModel.findByIdAndDelete(student._id);
    res.json({ success: true, message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting student profile:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const changeStudentPassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { oldPassword, newPassword } = req.body;

    const student = await StudentModel.findById(userId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, student.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    student.password = hashedPassword;
    await student.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error.message);
    res.status(500).json({ success: false, message: "Error changing password" });
  }
};

export const getStudentCount = async (req, res) => {
  try {
    const count = await StudentModel.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error('Error getting student count:', err);
    res.status(500).json({ message: 'Failed to get student count' });
  }
};
