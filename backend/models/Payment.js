import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "LKR" },
    paymentIntentId: { type: String, required: true },
    status: { type: String, default: "pending" },
    therapyCompleted: { type: Boolean, default: false }, // New field
    removed: { type: Boolean, default: false } // New field
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
