import express from "express";
import { createOrder, getOrdersByUser, cancelOrder, getAllOrders } from "../controllers/orderController.js";

const router = express.Router();

router.post("/create", createOrder);
router.get("/user/:userId", getOrdersByUser);
router.get("/all", getAllOrders)
router.patch("/user/:userId/order/:orderId/cancel", cancelOrder);


export default router;