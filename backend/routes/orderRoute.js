// routes/orderRoute.js
import express from "express";
import {
  createOrder,
  getOrdersByUser,
  cancelOrder,
  getAllOrders,
  changeStatus,
  getOrderById,
} from "../controllers/orderController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", verifyToken, createOrder);
router.get("/user/:userId", verifyToken, getOrdersByUser);
router.patch("/:orderId/cancel", verifyToken, cancelOrder); // Add verifyToken
router.get("/all", authMiddleware, getAllOrders); // Add authMiddleware
router.post("/change-status", authMiddleware, changeStatus); // Add authAdmin
router.get("/:id", verifyToken, getOrderById);

export default router;