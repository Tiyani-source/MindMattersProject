
import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    rating: { type: Number, required: true }, // 1 to 10
    review: { type: String },
    month: { type: String, required: true }, // "January", "February", etc.
  },
  { timestamps: true }
);

export default mongoose.model("PatientFeedback", feedbackSchema);