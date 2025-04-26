import mongoose from "mongoose";

const universitySchema = new mongoose.Schema({
  universityName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  establishedYear: { type: Number, required: true },
  fees: { type: String, required: true },
  specialty: { type: String, required: true },
  topDegree: { type: String, required: true },
  about: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  imageUrl: { type: String },
});

const University = mongoose.model("University", universitySchema);
export default University;
