import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";
import doctorRequestModel from "../models/dRequestModel.js";

const addDoctorRequest = async (req, res) => {
    try {
      console.log("Request body:", req.body);
      console.log("Uploaded file:", req.file);
  
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
        fees
      } = req.body;
  
      const documentFile = req.file; // uploaded file
  
      // ✅ Validation
      if (
        !firstName || !lastName || !universityId || !doctorId || !address ||
        !gender || !experience || !qualifications || !email || !phone ||
        !documentFile || !degree || !specialty || !about || !fees
      ) {
        return res.json({ success: false, message: "Missing Details" });
      }
  
      // ✅ Email format validation
      if (!validator.isEmail(email)) {
        return res.json({ success: false, message: "Please enter a valid email" });
      }
  
      // ✅ Upload document to Cloudinary
      const documentUpload = await cloudinary.uploader.upload(documentFile.path, {
        resource_type: "raw"
      });
      const documentUrl = documentUpload.secure_url;
  
      // ✅ Construct doctor request object
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
        fees
      };
  
      // ✅ Save to database
      const newDoctorRequest = new doctorRequestModel(doctorRequestData);
      await newDoctorRequest.save();
  
      console.log("Doctor request submitted successfully!");
      res.json({ success: true, message: "Doctor request submitted successfully!" });
  
    } catch (error) {
      console.error("Error adding doctor request:", error);
      res.json({ success: false, message: error.message });
    }
  };

export default addDoctorRequest;