import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        trim: true
    },
    label: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['textarea', 'radio', 'number', 'short_text'],
        required: true
    },
    options: [{
        type: String,
        trim: true
    }],
    required: {
        type: Boolean,
        default: false
    },
    placeholder: {
        type: String,
        trim: true
    }
});

const noteTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['client_note', 'psychometric'],
        required: true
    },
    fields: [fieldSchema],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "doctor",
        required: true,
        index: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'archived'],
        default: 'active'
    },
    version: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for faster queries
noteTemplateSchema.index({ type: 1, status: 1 });
noteTemplateSchema.index({ createdBy: 1, status: 1 });

const NoteTemplate = mongoose.models.NoteTemplate || mongoose.model("NoteTemplate", noteTemplateSchema);
export default NoteTemplate; 