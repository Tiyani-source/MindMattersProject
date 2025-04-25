import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import supplyManagerModel from "../models/supplyManagerModel.js";

const loginSupplyManager = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await supplyManagerModel.findOne({ email });
        
        if (!user) {
            return res.json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            res.json({ 
                success: true, 
                token,
                user: {
                    id: user._id,
                    email: user.email
                }
            });
        } else {
            res.json({ success: false, message: "Invalid email or password" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const signupSupplyManager = async (req, res) => {
    try {
        const { 
            name, 
            email, 
            password, 
            image, 
            department, 
            role, 
            experience, 
            contactNumber, 
            address 
        } = req.body;

        // Check if supply manager already exists
        const existingManager = await supplyManagerModel.findOne({ email });
        if (existingManager) {
            return res.json({ success: false, message: "Supply manager already exists with this email" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new supply manager
        const newSupplyManager = new supplyManagerModel({
            name,
            email,
            password: hashedPassword,
            image,
            department,
            role,
            experience,
            contactNumber,
            address,
            joinDate: Date.now()
        });

        // Save supply manager to database
        await newSupplyManager.save();

        res.json({ 
            success: true, 
            message: "Supply manager registered successfully",
            supplyManager: {
                id: newSupplyManager._id,
                name: newSupplyManager.name,
                email: newSupplyManager.email
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    signupSupplyManager,
    loginSupplyManager
};