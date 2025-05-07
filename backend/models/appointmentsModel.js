import mongoose from "mongoose";

// Time slot sub-schema
const timeSlotSchema = new mongoose.Schema({
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
});

// Main appointment schema
const appointmentSchema = new mongoose.Schema({
    clientID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    therapistID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "doctor",
        required: true
    },
    typeOfAppointment: {
        type: String,
        enum: ["online", "inperson"],
        required: true
    },
    meetingLink: {
        type: String,
        required: function () { return this.typeOfAppointment === "online"; }
    },
    date: {
        type: Date,
        required: true
    },
    timeSlot: {
        type: timeSlotSchema,
        required: true
    },
    statusOfAppointment: {
        type: String,
        enum: ["upcoming", "completed", "cancelled"],
        default: "upcoming"
    },
    cancelledBy: {
        type: String,
        enum: ["therapist", "client", null],
        default: null
    },
    amount: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },
    review: {
        type: String,
        default: ""
    },
    modifyRequest: {
        type: Boolean,
        default: false
    },
    modifyRequestMsg: {
        type: String,
        default: ""
    }
}, { timestamps: true });

// Exporting model
const appointmentsModel = mongoose.models.appointments || mongoose.model("appointments", appointmentSchema);
export default appointmentsModel;