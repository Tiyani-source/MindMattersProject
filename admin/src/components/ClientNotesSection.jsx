import React, { useState } from 'react';
import AddNoteModal from './AddNoteModal';
import NoteDisplayList from './NoteDisplayList';

export default function ClientNotesSection() {
    const [notes, setNotes] = useState([]); // Or load from backend
    const [showModal, setShowModal] = useState(false);

    const handleSaveNote = (note) => {
        setNotes(prev => [...prev, note]);
        setShowModal(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Client Notes</h2>
                <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded"
                    onClick={() => setShowModal(true)}
                >
                    Add Note
                </button>
            </div>
            <NoteDisplayList notes={notes} />
            {showModal && (
                <AddNoteModal
                    onSave={handleSaveNote}
                    onCancel={() => setShowModal(false)}
                />
            )}
        </div>
    );
} 