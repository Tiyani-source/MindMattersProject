import mongoose from "mongoose";

const clientNoteSchema = new mongoose.Schema({
    therapistID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "doctor",
        required: true,
    },
    clientID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    appointmentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "appointments",
        required: false,
    },
    templateID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NoteTemplate",
        required: false,
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    type: {
        type: String,
        enum: ["session", "assessment", "formulation", "progress", "custom"],
        required: true
    },
    pinned: {
        type: Boolean,
        default: false,
    },
    tags: [{
        type: String
    }],
    attachments: [{
        type: String,
        url: String,
        name: String
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

const ClientNote = mongoose.models.ClientNote || mongoose.model("ClientNote", clientNoteSchema);
export default ClientNote; 