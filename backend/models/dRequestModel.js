import mongoose from "mongoose";

const doctorRequestSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    universityId: { type: String, required: true },
    doctorId: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    gender: { type: String, required: true },
    experience: { type: String, required: true },
    qualifications: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    documents: { type: String, required: true },
    degree: { type: String, required: true },
    specialty: { type: String, required: true },
    about: { type: String, required: true },
    fees: { type: Number, required: true }
});

const doctorRequestModel = mongoose.model("DoctorRequests", doctorRequestSchema);

export default doctorRequestModel;
