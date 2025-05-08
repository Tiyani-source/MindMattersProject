import express from "express";
import { createOrder, getOrdersByUser, cancelOrder, getAllOrders, changeStatus, getOrderById } from "../controllers/orderController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { authAdmin } from "../middleware/authAdmin.js";

const router = express.Router();

router.post("/create", verifyToken, createOrder);
router.get("/user/:userId", verifyToken, getOrdersByUser);
router.patch("/:orderId/cancel", cancelOrder);
router.get("/all", getAllOrders);
router.post("/change-status", changeStatus);
router.get("/:id", getOrderById);

export default router;