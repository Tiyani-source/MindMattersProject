import DeliveryPartner from '../models/deliveryPartnerModel.js';
import Order from '../models/orderModel.js';
import mongoose from 'mongoose';

// Get all delivery partners
export const getAllDeliveryPartners = async (req, res) => {
    try {
        const deliveryPartners = await DeliveryPartner.find();
        
        // Get order counts for each delivery partner and update their status
        const deliveryPartnersWithCounts = await Promise.all(
            deliveryPartners.map(async (partner) => {
                const assignedCount = await Order.countDocuments({
                    deliveryPartner: partner._id,
                    deliveryStatus: 'Assigned'
                });
                
                const completedCount = await Order.countDocuments({
                    deliveryPartner: partner._id,
                    deliveryStatus: 'Delivered'
                });
                
                // Update delivery partner's availability based on assigned orders count
                const isAvailable = assignedCount < 3;
                
                // Update the delivery partner's status in the database if it has changed
                if (partner.isAvailable !== isAvailable) {
                    await DeliveryPartner.findByIdAndUpdate(
                        partner._id,
                        { isAvailable },
                        { new: true }
                    );
                }
                
                return {
                    ...partner.toObject(),
                    assignedOrdersCount: assignedCount,
                    completedOrdersCount: completedCount,
                    isAvailable
                };
            })
        );

        res.status(200).json({
            success: true,
            data: deliveryPartnersWithCounts
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
        console.log("Fetching all delivery partners...");
        const deliveryPartners = await DeliveryPartner.find();
        console.log("Found delivery partners:", deliveryPartners);

        if (!deliveryPartners || deliveryPartners.length === 0) {
            console.log("No delivery partners found");
            return res.status(200).json({
                success: true,
                data: [],
                message: "No delivery partners found"
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
            message: 'Error fetching delivery partners',
            error: error.message
        });
    }
};

// Create new delivery partner
export const createDeliveryPartner = async (req, res) => {
    try {
        // Set default province if not provided
        if (!req.body.province) {
            req.body.province = 'Western Province';
        }

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

        // Check if delivery partner exists
        const deliveryPartner = await DeliveryPartner.findById(deliveryPartnerId);
        if (!deliveryPartner) {
            return res.status(404).json({
                success: false,
                message: 'Delivery partner not found'
            });
        }

        // Get count of assigned orders for this delivery partner
        const assignedOrdersCount = await Order.countDocuments({
            deliveryPartner: deliveryPartnerId,
            deliveryStatus: 'Assigned'
        });

        // Check if delivery partner has reached the maximum number of assigned orders (3)
        if (assignedOrdersCount >= 3) {
            return res.status(400).json({
                success: false,
                message: 'Delivery partner has reached the maximum number of assigned orders (3)'
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

        // Update order with delivery partner, estimated delivery, and status
        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                deliveryPartner: deliveryPartnerId,
                estimatedDelivery: new Date(estimatedDelivery),
                deliveryStatus: 'Assigned',
                status: 'Shipped' // Automatically update order status to Shipped
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

        // Update delivery partner's availability based on assigned orders count
        // Set to busy if they have 3 or more assigned orders
        deliveryPartner.isAvailable = assignedOrdersCount + 1 < 3;
        await deliveryPartner.save();

        console.log("Successfully assigned delivery partner:", {
            orderId: order._id,
            deliveryPartner: order.deliveryPartner,
            estimatedDelivery: order.estimatedDelivery,
            status: order.status
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
        
        // Validate coordinate ranges for Sri Lanka
        if (longitude < 79.5 || longitude > 82.0 || latitude < 5.5 || latitude > 10.0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coordinates. Must be within Sri Lanka boundaries.'
            });
        }

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