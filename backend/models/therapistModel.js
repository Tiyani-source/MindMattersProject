import mongoose from "mongoose";

const therapistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  image: {
    type: String,
    default: "/images/default-therapist.png"
  },
  speciality: { type: String, required: true },
  degree: { type: String, required: true },
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  about: { type: String, required: true },
  available: {
    type: Boolean,
    default: true
  },
  fees: {
    type: Number,
    required: true
  },
  address: {
    type: Object,
    default: {}
  },
  dateReg: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const therapistModel = mongoose.models.therapist || mongoose.model("therapist", therapistSchema);
export default therapistModel;