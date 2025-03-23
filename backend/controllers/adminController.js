import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";
import adminModel from "../models/adminModel.js";

// API for admin login
const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}


// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {

        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
    try {

        const { appointmentId } = req.body
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for adding Doctor
const addDoctor = async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        speciality,
        degree,
        experience,
        about,
        fees,
        address,
        phone,
        gender,
        universityId,
        doctorId,
        qualifications,
        documents,
      } = req.body;
  
      const imageFile = req.file; // profile picture (optional)
  
     
      if (
        !name || !email || !password || !speciality ||
        !degree || !experience || !about || !fees || !address ||
        !universityId || !doctorId
      ) {
        return res.json({ success: false, message: "Missing required fields" });
      }
  
      if (!validator.isEmail(email)) {
        return res.json({ success: false, message: "Please enter a valid email" });
      }
  
     
      if (password.length < 8) {
        return res.json({ success: false, message: "Please enter a strong password (min 8 characters)" });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      let profilePicture = "";
      if (imageFile) {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        profilePicture = imageUpload.secure_url;
      }
  
      const doctorData = {
        name,
        email,
        password: hashedPassword,
        profilePicture,
        speciality,
        degree,
        experience,
        about,
        fees,
        address: typeof address === "string" ? JSON.parse(address) : address,
        phone,
        gender,
        universityId,
        doctorId,
        qualifications,
        documents,
        date: Date.now(),
      };
  
      const newDoctor = new doctorModel(doctorData);
      await newDoctor.save();
  
      res.json({ success: true, message: "Doctor added successfully" });
  
    } catch (error) {
      console.error("Error adding doctor:", error);
      res.json({ success: false, message: error.message });
    }
  };
  

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}).select('-password')
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {

        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse()
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const getAdminProfile = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.json({ success: true, admin });
  } catch (err) {
    console.error("Error fetching admin profile:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export {
    loginAdmin,
    appointmentsAdmin,
    appointmentCancel,
    addDoctor,
    allDoctors,
    adminDashboard,
    getAdminProfile,
}