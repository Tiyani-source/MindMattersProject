import React from 'react';

export default function NoteDisplayList({ notes }) {
    if (!notes || notes.length === 0) {
        return <div className="text-gray-500">No notes yet.</div>;
    }

    return (
        <div className="space-y-6">
            {notes.map((note, idx) => (
                <div key={idx} className="bg-white rounded shadow p-4">
                    {note.templateName ? (
                        <>
                            <div className="font-bold text-lg mb-2">{note.templateName}</div>
                            <div className="space-y-2">
                                {Object.entries(note.fields).map(([label, value]) => (
                                    <div key={label}>
                                        <span className="font-medium">{label}:</span>{' '}
                                        {Array.isArray(value) ? value.join(', ') : value}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div>
                            <div className="font-bold text-lg mb-2">General Note</div>
                            <div>{note.content}</div>
                        </div>
                    )}
                    {note.appointmentID && (
                        <div className="text-xs text-gray-400 mt-2">
                            Associated with appointment: {note.appointmentID}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
} 