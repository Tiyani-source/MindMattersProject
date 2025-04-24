import jwt from 'jsonwebtoken';
import therapistModel from "../models/therapistModel.js";

const authTherapist = async (req, res, next) => {
    try {
        const { ttoken } = req.headers; 
        if (!ttoken) {
            return res.status(401).json({ success: false, message: 'Not Authorized' });
        }

        const decoded = jwt.verify(ttoken, process.env.JWT_SECRET);
        const therapist = await therapistModel.findById(decoded.id);
        if (!therapist) {
            return res.status(401).json({ success: false, message: 'Therapist not found' });
        }

        req.body.therapistId = therapist._id; // Attach therapist ID to request body
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Token is invalid' });
    }
};

export default authTherapist;