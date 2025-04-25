import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  age: Number,
  employeeId: String,
  role: String,
  accessLevel: String,
  hiredDate: String,
  phone: String,
  email: { type: String, required: true, unique: true },
  linkedIn: String,
  emergencyContact: String,
  whatsapp: String,
  address: String,
  city: String,
  district: String,
  country: String,
  postalCode: String,
  lastLogin: String,
  status: String,
  profilePicture: String,
  password: String,
}, { timestamps: true });

const adminModel = mongoose.model("admins", adminSchema);
export default adminModel;
