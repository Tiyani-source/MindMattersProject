// models/refundModel.js
import mongoose from "mongoose";

const refundSchema = new mongoose.Schema({
  refundId: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  reason: { type: String, required: true },
});

const refundModel = mongoose.models.refund || mongoose.model("refund", refundSchema);
export default refundModel;