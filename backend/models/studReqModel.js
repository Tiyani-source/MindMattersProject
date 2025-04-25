import mongoose from "mongoose";

const studentRequestSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    universityId: { type: String, required: true,unique: true },
    universityName: { type: String, required: true,  },
    semester :{ type: String, required: true },
    year: { type: String, required: true },
    address: { type: String, required: true },
    gender: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    documents: { type: String, required: true },
    degree: { type: String, required: true },
    
});

const studentRequestModel = mongoose.model("StudentRequests", studentRequestSchema);

export default studentRequestModel;
