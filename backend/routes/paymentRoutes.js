import express from "express";
import Payment from "../models/Payment.js";
import { processPayment, getPaymentDashboard } from "../controllers/paymentController.js";
const router = express.Router();

router.post("/", processPayment);

router.get("/dashboard", getPaymentDashboard);

// Complete Payment (Marks therapy session as completed)
router.put("/:id/complete", async (req, res) => {
    try {
        await Payment.findByIdAndUpdate(req.params.id, { therapyCompleted: true });
        res.json({ success: true, message: "Therapy session marked as completed!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error completing therapy session" });
    }
});

// Refund Payment
router.put("/:id/refund", async (req, res) => {
    try {
        await Payment.findByIdAndUpdate(req.params.id, { status: "refunded" });
        res.json({ success: true, message: "Payment refunded successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error processing refund" });
    }
});

// Soft Delete (Remove Record)
router.put("/:id/remove", async (req, res) => {
    try {
        await Payment.findByIdAndUpdate(req.params.id, { removed: true });
        res.json({ success: true, message: "Record removed successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error removing record" });
    }
});

export default router;
