import React, { useState } from 'react';
import NoteEditor from './NoteEditor';

const getTemplates = () =>
    JSON.parse(localStorage.getItem('therapist_note_templates')) || [];

export default function AddNoteModal({ onSave, onCancel }) {
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const templates = getTemplates();
    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Add Note</h2>
                <div className="mb-4">
                    <label className="block mb-1 font-medium">Select Template</label>
                    <select
                        className="w-full border rounded px-3 py-2"
                        value={selectedTemplateId}
                        onChange={e => setSelectedTemplateId(e.target.value)}
                    >
                        <option value="">Freeform Note</option>
                        {templates.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
                <NoteEditor
                    template={selectedTemplate}
                    onSave={onSave}
                    onCancel={onCancel}
                />
            </div>
        </div>
    );
} 