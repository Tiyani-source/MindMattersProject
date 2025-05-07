import mongoose from "mongoose";

const clientSessionSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
        index: true
    },
    therapistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "doctor",
        required: true,
        index: true
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "appointments",
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    type: {
        type: String,
        enum: ['initial', 'follow-up', 'emergency', 'regular'],
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
        required: true
    },
    notes: [{
        content: {
            type: String,
            required: true,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "doctor",
            required: true
        }
    }],
    goals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ClientGoal"
    }],
    progress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ClientProgress"
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for faster queries
clientSessionSchema.index({ clientId: 1, date: -1 });
clientSessionSchema.index({ therapistId: 1, date: -1 });
clientSessionSchema.index({ appointmentId: 1 });

const ClientSession = mongoose.models.ClientSession || mongoose.model("ClientSession", clientSessionSchema);
export default ClientSession;
