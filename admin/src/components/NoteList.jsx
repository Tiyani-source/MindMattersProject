import React from 'react';
import { FaThumbtack, FaTrash, FaEdit } from 'react-icons/fa';

const NoteList = ({
    notes,
    onPinNote,
    onDeleteNote,
    onEditNote,
    searchQuery = ''
}) => {
    const filteredNotes = notes.filter(note =>
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.templateUsed && note.templateUsed.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Client Notes</h3>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search notes..."
                        onChange={(e) => onSearch(e.target.value)}
                        className="w-64 px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                    />
                </div>
            </div>

            {filteredNotes.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                    {searchQuery ? 'No notes match your search' : 'No notes yet'}
                </p>
            ) : (
                <div className="space-y-4">
                    {filteredNotes.map((note) => (
                        <div
                            key={note._id}
                            className={`bg-white rounded-lg shadow-sm p-4 ${note.pinned ? 'border-l-4 border-indigo-500' : ''}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    {note.templateUsed && (
                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                                            {note.templateUsed}
                                        </span>
                                    )}
                                    <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                                    {note.appointmentID && (
                                        <p className="text-sm text-gray-500 mt-2">
                                            Associated with appointment on {new Date(note.appointmentID.date).toLocaleDateString()} at {note.appointmentID.time}
                                        </p>
                                    )}
                                </div>
                                <div className="flex space-x-2 ml-4">
                                    <button
                                        onClick={() => onPinNote(note._id, !note.pinned)}
                                        className={`p-2 rounded-full hover:bg-gray-100 ${note.pinned ? 'text-indigo-600' : 'text-gray-400'
                                            }`}
                                    >
                                        <FaThumbtack size={16} />
                                    </button>
                                    <button
                                        onClick={() => onEditNote(note)}
                                        className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                                    >
                                        <FaEdit size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDeleteNote(note._id)}
                                        className="p-2 rounded-full hover:bg-gray-100 text-red-500"
                                    >
                                        <FaTrash size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                Created: {new Date(note.createdAt).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NoteList; 