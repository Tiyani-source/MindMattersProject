import mongoose from "mongoose";

const supplyManagerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    department: { type: String, required: true },
    role: { type: String, required: true },
    experience: { type: String, required: true },
    contactNumber: { type: String, required: true },
    available: { type: Boolean, default: true },
    managedInventories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'inventory' }],
    accessLevel: { type: String, enum: ['basic', 'advanced', 'admin'], default: 'basic' },
    address: { type: Object, required: true },
    joinDate: { type: Number, required: true },
    lastActive: { type: Number, default: Date.now }
}, { minimize: false })

const supplyManagerModel = mongoose.models.supplyManager || mongoose.model("supplyManager", supplyManagerSchema);
export default supplyManagerModel;