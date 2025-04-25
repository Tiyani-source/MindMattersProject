import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";

import studReqModel from "../models/studReqModel.js";
import studentModel from "../models/studentModel.js";
import sendEmail from "../utils/sendEmail.js";

// Utility: Generate random password
const generateRandomPassword = () => {
  return crypto.randomBytes(4).toString("hex"); // 8-digit hex password
};

// Add new student request
export const addStudentRequest = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      universityId,
      universityName,
      year,
      semester,
      address,
      gender,
      email,
      phone,
      degree,
    } = req.body;

    const documentFile = req.file;

    if (
      !firstName || !lastName || !universityId || !universityName ||
      !year || !semester || !address || !gender ||
      !email || !phone || !degree || !documentFile
    ) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email format" });
    }

    const documentUpload = await cloudinary.uploader.upload(documentFile.path, {
      resource_type: "raw",
    });

    const newRequest = new studReqModel({
      firstName,
      lastName,
      universityId,
      universityName,
      year,
      semester,
      address,
      gender,
      email,
      phone,
      documents: documentUpload.secure_url,
      degree,
    });

    await newRequest.save();
    res.json({ success: true, message: "Student request submitted successfully!" });
  } catch (error) {
    console.error("Error adding student request:", error);
    res.json({ success: false, message: error.message });
  }
};

//  View all student requests
export const viewStudentRequests = async (req, res) => {
  try {
    const requests = await studReqModel.find();
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching student requests:", error);
    res.json({ success: false, message: error.message });
  }
};

//  Delete a student request
export const deleteStudentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await studReqModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Student request deleted successfully." });
  } catch (error) {
    console.error("Error deleting student request:", error);
    res.json({ success: false, message: error.message });
  }
};

//  Approve student request → add to DB + send email
export const approveStudentRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await studReqModel.findById(id);
    if (!request) return res.json({ success: false, message: "Student request not found." });

    const existingStudent = await studentModel.findOne({ email: request.email });
    if (existingStudent) {
      return res.json({ success: false, message: "Student already exists." });
    }

    const rawPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newStudent = new studentModel({
      firstName: request.firstName,
      lastName: request.lastName,
      universityId: request.universityId,
      universityName: request.universityName,
      year: request.year,
      semester: request.semester,
      address: request.address,
      gender: request.gender,
      email: request.email,
      phone: request.phone,
      documents: request.documents,
      degree: request.degree,
      password: hashedPassword,
    });

    await newStudent.save();
    await studReqModel.findByIdAndDelete(id);

    await sendEmail({
      to: request.email,
      subject: "Your Student Account is Approved 🎓",
      text: `Hi ${request.firstName},

Your student account has been approved! You can now log in using the following credentials:

📧 Email: ${request.email}
🔑 Temporary Password: ${rawPassword}

Please log in and update your password as soon as possible.

Best regards,  
MindMatters Team`,
    });

    res.json({ success: true, message: "Student approved and email sent", password: rawPassword });
  } catch (error) {
    console.error("Error approving student request:", error);
    res.json({ success: false, message: error.message });
  }
};
