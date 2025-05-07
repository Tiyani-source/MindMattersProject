// routes/orderPaymentRoutes.js
import express from "express";
import Order from "../models/orderModel.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Process order payment
router.post("/:orderId/payment", verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { name, email, cardNumber, expiryDate, cvv } = req.body;

    // Basic card validation (dummy gateway)
    if (!/^\d{16}$/.test(cardNumber)) {
      return res.status(400).json({ success: false, message: "Card number must be 16 digits" });
    }
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      return res.status(400).json({ success: false, message: "Expiry date must be in MM/YY format" });
    }
    if (!/^\d{3}$/.test(cvv)) {
      return res.status(400).json({ success: false, message: "CVV must be 3 digits" });
    }

    // Find the order
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Simulate payment processing
    const cardLast4 = cardNumber.slice(-4);
    const cardType = cardNumber.startsWith("4") ? "Visa" : cardNumber.startsWith("5") ? "MasterCard" : "Unknown";

    // Update order with payment details
    order.paymentStatus = "Completed";
    order.paymentMethod = "Card";
    order.paymentDate = new Date();
    order.paymentDetails = { cardLast4, cardType };
    await order.save();

    res.status(200).json({ success: true, message: "Payment processed successfully", order });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ success: false, message: "Payment processing failed", error });
  }
});

export default router;