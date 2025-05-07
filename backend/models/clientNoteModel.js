import mongoose from "mongoose";

const clientNoteSchema = new mongoose.Schema({
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
    content: {
        type: String,
        required: true,
        trim: true
    },
    templateUsed: {
        type: String,
        required: true,
        trim: true
    },
    fields: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: new Map()
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "appointments",
        default: null
    },
    pinned: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'published'
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for faster queries
clientNoteSchema.index({ createdAt: -1 });
clientNoteSchema.index({ pinned: 1 });

const ClientNote = mongoose.models.ClientNote || mongoose.model("ClientNote", clientNoteSchema);
export default ClientNote; 