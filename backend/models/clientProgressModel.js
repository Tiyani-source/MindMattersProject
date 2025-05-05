// backend/models/clientProgressModel.js
import mongoose from "mongoose";

const clientProgressSchema = new mongoose.Schema({
  therapistID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "doctor",
    required: true,
  },
  clientID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  appointmentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "appointments",
    required: false,
  },
  progressNote: {
    type: String,
    required: true,
  },
  tags: [String],
  pinned: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

const ClientProgress = mongoose.models.ClientProgress || mongoose.model("ClientProgress", clientProgressSchema);
export default ClientProgress;