import mongoose from "mongoose";

const noteTemplateSchema = new mongoose.Schema({
    therapistID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "doctor",
        required: true,
    },
    name: { type: String, required: true },
    description: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        enum: ["assessment", "formulation", "session", "progress", "custom"],
        required: true
    },
    fields: [{
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ["text", "textarea", "select", "checkbox", "date", "rating"],
            required: true
        },
        label: { type: String, required: true },
        placeholder: String,
        options: [String],
        required: { type: Boolean, default: false }
    }],
    isDefault: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: { type: Date, default: Date.now }
});

const NoteTemplate = mongoose.models.NoteTemplate || mongoose.model("NoteTemplate", noteTemplateSchema);
export default NoteTemplate; 