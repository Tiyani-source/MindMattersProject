import express from "express";
import {
    getAllDeliveryPartners,
    getAvailableDeliveryPartners,
    createDeliveryPartner,
    updateDeliveryPartner,
    deleteDeliveryPartner,
    assignDeliveryPartner,
    updateLocation
} from "../controllers/deliveryPartnerController.js";
import DeliveryPartner from "../models/deliveryPartnerModel.js";

const router = express.Router();

// Test endpoint to check database
router.get('/test', async (req, res) => {
    try {
        const count = await DeliveryPartner.countDocuments();
        const partners = await DeliveryPartner.find();
        console.log("Total delivery partners in DB:", count);
        console.log("Delivery partners:", partners);
        
        res.status(200).json({
            success: true,
            count,
            partners
        });
    } catch (error) {
        console.error("Test endpoint error:", error);
        res.status(500).json({
            success: false,
            message: "Error checking database",
            error: error.message
        });
    }
});

// Get all delivery partners
router.get('/', getAllDeliveryPartners);

// Get available delivery partners
router.get('/available', getAvailableDeliveryPartners);

// Create new delivery partner
router.post('/', createDeliveryPartner);

// Update delivery partner
router.put('/:id', updateDeliveryPartner);

// Delete delivery partner
router.delete('/:id', deleteDeliveryPartner);

// Assign delivery partner to order
router.post('/assign', assignDeliveryPartner);

// Update delivery partner's location
router.put('/:id/location', updateLocation);

export default router;