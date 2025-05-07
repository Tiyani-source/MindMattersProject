import mongoose from "mongoose";

const clientGoalSchema = new mongoose.Schema({
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
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'archived'],
        default: 'active'
    },
    targetDate: {
        type: Date
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    milestones: [{
        title: {
            type: String,
            required: true,
            trim: true
        },
        completed: {
            type: Boolean,
            default: false
        },
        completedAt: Date
    }],
    notes: [{
        content: {
            type: String,
            required: true,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for faster queries
clientGoalSchema.index({ clientId: 1, status: 1 });
clientGoalSchema.index({ therapistId: 1, status: 1 });

const ClientGoal = mongoose.models.ClientGoal || mongoose.model("ClientGoal", clientGoalSchema);
export default ClientGoal;
