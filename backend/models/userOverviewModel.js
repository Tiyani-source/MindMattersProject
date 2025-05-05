import mongoose from 'mongoose';

const userOverviewStatsSchema = new mongoose.Schema({
  month: { type: String, required: true },
  patientCount: { type: Number, default: 0 },
  activeUsers: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('UserOverviewStat', userOverviewStatsSchema);