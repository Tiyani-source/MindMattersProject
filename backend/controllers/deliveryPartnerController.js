import DeliveryPartner from '../models/deliveryPartnerModel.js';
import Order from '../models/orderModel.js';
import mongoose from 'mongoose';

// Get all delivery partners
export const getAllDeliveryPartners = async (req, res) => {
    try {
        const deliveryPartners = await DeliveryPartner.find();
        res.status(200).json({
            success: true,
            data: deliveryPartners
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching delivery partners',
            error: error.message
        });
    }
};

// Get available delivery partners
export const getAvailableDeliveryPartners = async (req, res) => {
    try {
        console.log("Fetching available delivery partners...");
        const deliveryPartners = await DeliveryPartner.find({ isAvailable: true });
        console.log("Found delivery partners:", deliveryPartners);

        if (!deliveryPartners || deliveryPartners.length === 0) {
            console.log("No available delivery partners found");
            return res.status(200).json({
                success: true,
                data: [],
                message: "No available delivery partners found"
            });
        }

        res.status(200).json({
            success: true,
            data: deliveryPartners
        });
    } catch (error) {
        console.error("Error in getAvailableDeliveryPartners:", error);
        res.status(500).json({
            success: false,
            message: 'Error fetching available delivery partners',
            error: error.message
        });
    }
};

// Create new delivery partner
export const createDeliveryPartner = async (req, res) => {
    try {
        const deliveryPartner = await DeliveryPartner.create(req.body);
        res.status(201).json({
            success: true,
            data: deliveryPartner
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating delivery partner',
            error: error.message
        });
    }
};

// Update delivery partner
export const updateDeliveryPartner = async (req, res) => {
    try {
        const deliveryPartner = await DeliveryPartner.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!deliveryPartner) {
            return res.status(404).json({
                success: false,
                message: 'Delivery partner not found'
            });
        }
        res.status(200).json({
            success: true,
            data: deliveryPartner
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating delivery partner',
            error: error.message
        });
    }
};

// Delete delivery partner
export const deleteDeliveryPartner = async (req, res) => {
    try {
        const deliveryPartner = await DeliveryPartner.findByIdAndDelete(req.params.id);
        if (!deliveryPartner) {
            return res.status(404).json({
                success: false,
                message: 'Delivery partner not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Delivery partner deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error deleting delivery partner',
            error: error.message
        });
    }
};

// Assign delivery partner to order
export const assignDeliveryPartner = async (req, res) => {
    try {
        const { orderId, deliveryPartnerId, estimatedDelivery } = req.body;

        console.log("Assigning delivery partner:", {
            orderId,
            deliveryPartnerId,
            estimatedDelivery
        });

        // Validate order ID
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID format'
            });
        }

        // Validate delivery partner ID
        if (!mongoose.Types.ObjectId.isValid(deliveryPartnerId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid delivery partner ID format'
            });
        }

        // Check if delivery partner exists and is available
        const deliveryPartner = await DeliveryPartner.findById(deliveryPartnerId);
        if (!deliveryPartner) {
            return res.status(404).json({
                success: false,
                message: 'Delivery partner not found'
            });
        }
        if (!deliveryPartner.isAvailable) {
            return res.status(400).json({
                success: false,
                message: 'Delivery partner is not available'
            });
        }

        // Check if order exists
        const existingOrder = await Order.findById(orderId);
        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order is already assigned
        if (existingOrder.deliveryPartner) {
            return res.status(400).json({
                success: false,
                message: 'Order is already assigned to a delivery partner'
            });
        }

        // Update order with delivery partner and estimated delivery
        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                deliveryPartner: deliveryPartnerId,
                estimatedDelivery: new Date(estimatedDelivery),
                deliveryStatus: 'Assigned'
            },
            { 
                new: true,
                runValidators: true
            }
        ).populate('deliveryPartner');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Failed to update order'
            });
        }

        // Update delivery partner's availability
        deliveryPartner.isAvailable = false;
        await deliveryPartner.save();

        console.log("Successfully assigned delivery partner:", {
            orderId: order._id,
            deliveryPartner: order.deliveryPartner,
            estimatedDelivery: order.estimatedDelivery
        });

        res.status(200).json({
            success: true,
            message: 'Delivery partner assigned successfully',
            data: order
        });
    } catch (error) {
        console.error("Error assigning delivery partner:", error);
        res.status(400).json({
            success: false,
            message: 'Error assigning delivery partner',
            error: error.message
        });
    }
};

// Update delivery partner's location
export const updateLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const deliveryPartner = await DeliveryPartner.findByIdAndUpdate(
            req.params.id,
            {
                currentLocation: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                }
            },
            { new: true }
        );

        if (!deliveryPartner) {
            return res.status(404).json({
                success: false,
                message: 'Delivery partner not found'
            });
        }

        res.status(200).json({
            success: true,
            data: deliveryPartner
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating location',
            error: error.message
        });
    }
};