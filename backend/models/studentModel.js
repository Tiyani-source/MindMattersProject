import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    universityId: {
      type: String,
      required: true
    },
    universityName: {
      type: String,
      required: true
    },
    degree: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    semester: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true
    },
    documents: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Student", studentSchema);
