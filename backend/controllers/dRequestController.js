import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";

import doctorModel from "../models/doctorModel.js";
import doctorRequestModel from "../models/dRequestModel.js";

import sendEmail from "../utils/sendEmail.js";

const addDoctorRequest = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      universityId,
      doctorId,
      address,
      gender,
      experience,
      qualifications,
      email,
      phone,
      degree,
      specialty,
      about,
      fees,
    } = req.body;

    const documentFile = req.file;

    if (
      !firstName || !lastName || !universityId || !doctorId || !address ||
      !gender || !experience || !qualifications || !email || !phone ||
      !documentFile || !degree || !specialty || !about || !fees
    ) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email format" });
    }

    const documentUpload = await cloudinary.uploader.upload(documentFile.path, {
      resource_type: "raw",
    });
    const documentUrl = documentUpload.secure_url;

    const doctorRequestData = {
      firstName,
      lastName,
      universityId,
      doctorId,
      address,
      gender,
      experience,
      qualifications,
      email,
      phone,
      documents: documentUrl,
      degree,
      specialty,
      about,
      fees,
    };

    const newRequest = new doctorRequestModel(doctorRequestData);
    await newRequest.save();

    res.json({ success: true, message: "Doctor request submitted successfully!" });
  } catch (error) {
    console.error("Error adding doctor request:", error);
    res.json({ success: false, message: error.message });
  }
};


const viewDoctorRequests = async (req, res) => {
  try {
    const doctorRequests = await doctorRequestModel.find();
    res.json({ success: true, data: doctorRequests });
  } catch (error) {
    console.error("Error fetching doctor requests:", error);
    res.json({ success: false, message: error.message });
  }
};

const deleteDoctorRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await doctorRequestModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Doctor request not found" });
    }

    res.json({ success: true, message: "Doctor request deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor request:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const generateRandomPassword = () => {
  return crypto.randomBytes(8).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
};

const addDoctorFromRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await doctorRequestModel.findById(id);
    if (!request) return res.json({ success: false, message: "Doctor request not found" });

    const existing = await doctorModel.findOne({ email: request.email });
    if (existing) return res.json({ success: false, message: "Doctor already exists" });

    const rawPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newDoctor = new doctorModel({
      name: `${request.firstName} ${request.lastName}`,
      email: request.email,
      password: hashedPassword,
      profilePicture: "",
      speciality: request.specialty,
      degree: request.degree,
      experience: request.experience,
      about: request.about,
      fees: request.fees,
      address: request.address,
      gender: request.gender,
      phone: request.phone,
      universityId: request.universityId,
      doctorId: request.doctorId,
      qualifications: request.qualifications,
      documents: request.documents,
      available: true,
      slots_booked: {},
      date: Date.now(),
    });

    await newDoctor.save();
    await doctorRequestModel.findByIdAndDelete(id);

    // 📧 Send email via SendGrid
    await sendEmail({
      to: request.email,
      subject: "Your Doctor Account is Approved 🎉",
      text: `Hi Dr. ${request.firstName},

Your doctor account has been approved. Here are your login credentials:

🔐 Email: ${request.email}
🔑 Temporary Password: ${rawPassword}

Please log in and change your password immediately.



Thanks,
MindMatters Team`,
    });

    res.json({ success: true, message: "Doctor added and email sent", password: rawPassword });
    console.log("Doctor added successfully");
  } catch (error) {
    console.error("Error adding doctor:", error);
    res.json({ success: false, message: error.message });
  }
};

export {
  addDoctorRequest,
  viewDoctorRequests,
  deleteDoctorRequest,
  addDoctorFromRequest,
};
