import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; 
import doctorModel from "../models/doctorModel.js";

export const authDoctor = async (req, res) => {
  const { email, password } = req.body;

  try {
    
    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

   
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

  
    const token = jwt.sign(
      { id: doctor._id, email: doctor.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      token,
      type: "Doctor",
    });
  } catch (error) {
    console.error("Doctor login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
