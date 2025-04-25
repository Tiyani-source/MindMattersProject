import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";

import University from "../models/university.js";


const addUniversity = async (req, res) => {
  try {
    const {
      universityName,
      email,
      password,
      establishedYear,
      fees,
      specialty,
      topDegree,
      about,
      addressLine1,
      addressLine2,
    } = req.body;

    const imageFile = req.file;

    // Validation
    if (
      !universityName || !email || !password || !establishedYear || !fees ||
      !specialty || !topDegree || !about || !addressLine1 || !imageFile
    ) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email format" });
    }

    const currentYear = new Date().getFullYear();
    if (
      !/^\d{4}$/.test(establishedYear) ||
      establishedYear < 1800 ||
      establishedYear > currentYear
    ) {
      return res.json({ success: false, message: "Invalid established year" });
    }

    // Cloudinary upload
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      folder: "universities",
      resource_type: "image",
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const universityData = {
      universityName,
      email,
      password: hashedPassword,
      establishedYear,
      fees,
      specialty,
      topDegree,
      about,
      addressLine1,
      addressLine2,
      imageUrl: imageUpload.secure_url,
    };

    const newUniversity = new University(universityData);
    await newUniversity.save();

    res.json({ success: true, message: "University added successfully" });
  } catch (error) {
    console.error("Error adding university:", error);
    res.json({ success: false, message: error.message });
  }
};


const viewUniversities = async (req, res) => {
  try {
    const universities = await University.find();
    res.json({ success: true, data: universities });
  } catch (error) {
    console.error("Error fetching universities:", error);
    res.json({ success: false, message: error.message });
  }
};


const deleteUniversity = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await University.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "University not found" });
    }

    res.json({ success: true, message: "University deleted successfully" });
  } catch (error) {
    console.error("Error deleting university:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  addUniversity,
  viewUniversities,
  deleteUniversity,
};
