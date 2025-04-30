import StudentModel from "../models/studentModel.js";

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
