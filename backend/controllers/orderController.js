import mongoose from "mongoose";
import orderModel from "../models/orderModel.js";
import refundModel from "../models/refundModel.js";

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const {
      orderId,
      items,
      discount = { code: null, amount: 0 },
      shippingInfo,
      totalAmount,
      products,
    } = req.body;

    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized - User not authenticated" });
    }

    const newOrder = new orderModel({
      orderId,
      userId,
      date: new Date(),
      status: "Pending",
      deliveryStatus: "UnAssigned",
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        color: item.color,
        size: item.size,
        image: item.image
      })),
      discount,
      products,
      shippingCost: 500,
      shippingInfo,
      totalAmount
    });

    await newOrder.save();
    res.status(201).json({ success: true, message: "Order created", order: newOrder });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ success: false, message: "Failed to create order", error: error.message });
  }
};

// Get all orders by student ID
export const getOrdersByUser = async (req, res) => {
  try {
    const studentId = req.params.userId;
    if (!studentId) {
      return res.status(400).json({ success: false, message: "Student ID is required" });
    }

    if (req.userId !== studentId && req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const orders = await orderModel.find({ userId: studentId }).populate('deliveryPartner', 'name phone vehicleNumber');
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders", error: error.message });
  }
};

// Get all orders (admin only)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel.find().populate('deliveryPartner', 'name phone vehicleNumber');
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Error fetching orders", error: error.message });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { cancelReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID format" });
    }

    const order = await orderModel.findOne({ _id: new mongoose.Types.ObjectId(orderId) });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.userId !== req.userId && req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (order.status === "Delivered") {
      return res.status(400).json({ success: false, message: "Delivered orders cannot be cancelled" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Order is already cancelled" });
    }

    order.status = "Cancelled";
    order.deliveryStatus = undefined;
    order.cancelReason = cancelReason;
    await order.save();

    if (order.paymentStatus === "Completed") {
      const refund = new refundModel({
        refundId: `REF${Date.now()}`,
        orderId: order.orderId,
        amount: order.totalAmount,
        reason: cancelReason,
      });
      await refund.save();
    }

    return res.status(200).json({ success: true, message: "Order cancelled", data: order });
  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(500).json({ success: false, message: "Failed to cancel order", error: error.message });
  }
};

// Change order status (admin only)
export const changeStatus = async (req, res) => {
  try {
    const { orderId, status, deliveryStatus } = req.body;
    if (!orderId || (!status && !deliveryStatus)) {
      return res.status(400).json({ success: false, message: "Order ID and at least one status are required" });
    }

    const order = await orderModel.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (status) {
      order.status = status;
    }
    if (deliveryStatus) {
      order.deliveryStatus = deliveryStatus;
    }
    await order.save();

    return res.status(200).json({ success: true, message: "Order status changed", data: order });
  } catch (error) {
    console.error("Change status error:", error);
    return res.status(500).json({ success: false, message: "Failed to change order status", error: error.message });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID format" });
    }

    const order = await orderModel.findById(id).populate('deliveryPartner');
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.userId !== req.userId && req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("Get order by ID error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch order", error: error.message });
  }
};