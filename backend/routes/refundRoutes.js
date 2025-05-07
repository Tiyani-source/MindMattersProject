// routes/refundRoutes.js
import express from "express";
import Refund from "../models/refundModel.js";
import Order from "../models/orderModel.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all refunds
router.get("/", authMiddleware, async (req, res) => {
  try {
    const refunds = await Refund.find();
    res.status(200).json({ success: true, refunds });
  } catch (error) {
    console.error("Error fetching refunds:", error);
    res.status(500).json({ success: false, message: "Failed to fetch refunds" });
  }
});

// Get revenue data (daily revenue for completed payments)
router.get("/revenue", authMiddleware, async (req, res) => {
  try {
    const revenue = await Order.aggregate([
      { $match: { paymentStatus: "Completed" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$paymentDate" } },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          revenue: 1,
          _id: 0,
        },
      },
    ]);
    res.status(200).json({ success: true, revenue });
  } catch (error) {
    console.error("Error fetching revenue:", error);
    res.status(500).json({ success: false, message: "Failed to fetch revenue" });
  }
});

export default router;