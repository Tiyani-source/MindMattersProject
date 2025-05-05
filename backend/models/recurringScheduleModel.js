import mongoose from "mongoose";

const recurringScheduleSchema = new mongoose.Schema({
    therapistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "doctor",
        required: true,
    },
    name: {
        type: String,
        required: false,
    },
    days: {
        type: [Number],
        required: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    interval: {
        type: Number,
        default: 90, // 60 min session + 30 min break
    },
    types: {
        type: [String],
        enum: ["Online", "In-Person"],
        required: true,
    },
    breaks: [{
        start: String,
        end: String,
        label: String
    }],
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

const RecurringScheduleModel = mongoose.models.recurringSchedule
    || mongoose.model("recurringSchedule", recurringScheduleSchema);

export default RecurringScheduleModel; 