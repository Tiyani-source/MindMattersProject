import jwt from 'jsonwebtoken';
import doctorModel from "../models/doctorModel.js";

export const authTherapist = async (req, res, next) => {
    try {
        console.log('authTherapist middleware called');
        console.log('Request headers:', req.headers);

        let token;

        // Check for token in Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            console.log('Found token in Authorization header');
            token = authHeader.split(' ')[1];
        }

        // Check for token in ttoken header
        const ttoken = req.headers.ttoken;
        if (!token && ttoken) {
            console.log('Found token in ttoken header');
            token = ttoken;
        }

        if (!token) {
            console.log('No token found in any header');
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        console.log('Attempting to verify token');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        // First try to find by doctorId since that's what we're now using in the token
        console.log('Looking up doctor with doctorId:', decoded.id);
        let doctor = await doctorModel.findOne({ doctorId: decoded.id });

        if (!doctor) {
            console.log('Doctor not found by doctorId, trying _id');
            doctor = await doctorModel.findById(decoded.id);
        }

        if (!doctor) {
            console.log('No doctor found with either doctorId or _id:', decoded.id);
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        console.log('Doctor found:', doctor.doctorId);
        req.body.userId = doctor._id;
        req.body.doctorId = doctor.doctorId; // Also pass the doctorId
        next();
    } catch (error) {
        console.error("Auth error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(401).json({ success: false, message: "Unauthorized" });
    }
};