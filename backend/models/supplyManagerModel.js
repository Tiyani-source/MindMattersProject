import mongoose from "mongoose";

const supplyManagerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    department: { type: String, required: true },
    certification: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    active: { type: Boolean, default: true },
    inventory_level: { type: Number, required: true },
    items_managed: { type: Object, default: {} },
    location: { type: Object, required: true },
    join_date: { type: Number, required: true },
}, { minimize: false })

const supplyManagerModel = mongoose.models.supplyManager || mongoose.model("supplyManager", supplyManagerSchema);
export default supplyManagerModel;