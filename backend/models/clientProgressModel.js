// backend/models/clientProgressModel.js
import mongoose from "mongoose";

const clientProgressSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    index: true
  },
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "doctor",
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true
  },
  metrics: {
    type: Map,
    of: {
      value: Number,
      label: String,
      unit: String
    },
    default: new Map()
  },
  notes: {
    type: String,
    trim: true
  },
  assessmentType: {
    type: String,
    enum: ['phq9', 'gad7', 'das', 'custom'],
    required: true
  },
  scores: {
    type: Map,
    of: Number,
    default: new Map()
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
clientProgressSchema.index({ clientId: 1, date: -1 });
clientProgressSchema.index({ therapistId: 1, date: -1 });

const ClientProgress = mongoose.models.ClientProgress || mongoose.model("ClientProgress", clientProgressSchema);
export default ClientProgress;