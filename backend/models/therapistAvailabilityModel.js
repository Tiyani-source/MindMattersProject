import mongoose from "mongoose";

const therapistAvailabilitySchema = new mongoose.Schema({
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "doctor",
    required: true,
  },
  date: {
    type: String, // Format: "YYYY-MM-DD"
    required: true,
  },
  time: {
    type: String, // Format: "HH:mm" or "HH:mm AM/PM"
    required: true,
  },
  type: {
    type: String,
    enum: ["Online", "In-Person"],
    required: true,
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const therapistAvailabilityModel = mongoose.models.therapistAvailability
  || mongoose.model("therapistAvailability", therapistAvailabilitySchema);

export default therapistAvailabilityModel;