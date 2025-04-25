import mongoose from "mongoose";
import orderModel from "../models/orderModel.js";

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const {
      orderId,
      userId,
      date,
      status,
      items,
      discount = { code: null, amount: 0 },
      shippingInfo,
      shippingCost,
      totalAmount,
      products,
    } = req.body;

    console.log(req.body);
    

    const newOrder = new orderModel({
      orderId,
      userId,
      date,
      status,
      items,
      discount,
      products,
      shippingInfo,
      shippingCost,
      totalAmount
    });

    await newOrder.save();
    res.status(201).json({ success: true, message: "Order created", data: newOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create order", error });
  }
};

//  Get all orders by user ID
export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);
    
    const orders = await orderModel.find({ userId });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders", error });
  }
};

//  Get all orders by user ID
export const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders", error });
  }
};

// cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { userId, orderId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    // Find order
    const order = await orderModel.findOne({
      _id: new mongoose.Types.ObjectId(orderId),
      userId: new mongoose.Types.ObjectId(userId),
    });
    

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status === "Delivered") {
      return res.status(400).json({ success: false, message: "Delivered orders cannot be cancelled" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Order is already cancelled" });
    }

    order.status = "Cancelled";
    
    await order.save();

    return res.status(200).json({ success: true, message: "Order cancelled", data: order });
  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(500).json({ success: false, message: "Failed to cancel order", error });
  }
};

// Change order status 
export const changeStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body

    // if (!mongoose.Types.ObjectId.isValid(orderId) || !status) {
    //   return res.status(400).json({ success: false, message: "Invalid ID format" });
    // }

    const order = await orderModel.findOne({
      orderId: orderId,
    });
    
    order.status = status;
    
    await order.save();

    return res.status(200).json({ success: true, message: "Order status changed", data: order });
  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(500).json({ success: false, message: "Failed to change order status", error });
  }
  
};