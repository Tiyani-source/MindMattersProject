import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
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
  clientStatus: {
    type: String,
    enum: ["goal setting", "ongoing", "archived", "terminated"],
    default: "goal setting"
  }
}, {
  timestamps: true
});

// Ensure uniqueness of the therapist-client relationship (1-to-1 mapping)
clientSchema.index({ therapistID: 1, clientID: 1 }, { unique: true });

const clientModel = mongoose.models.client || mongoose.model("User", clientSchema);
export default clientModel;