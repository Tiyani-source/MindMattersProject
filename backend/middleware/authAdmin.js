import jwt from "jsonwebtoken"
import AdminModel from "../models/adminModel.js";


export const authAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
   
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    if (password !== admin.password) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    
    const token = jwt.sign({ id: admin._id,email: admin.email  }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({ success: true, token, type: admin.role || "System Admin" });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


