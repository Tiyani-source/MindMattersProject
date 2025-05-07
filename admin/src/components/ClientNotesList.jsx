import React, { useState } from 'react';
import { format } from 'date-fns';
import { FaSearch, FaThumbtack, FaEdit, FaTrash } from 'react-icons/fa';

const ClientNotesList = ({
    notes = [],
    onEdit,
    onDelete,
    onPin,
    onSearch
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        onSearch(query);
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search notes..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>

            <div className="space-y-4">
                {notes.map(note => (
                    <div
                        key={note._id}
                        className={`p-4 border rounded-lg ${note.pinned ? 'bg-yellow-50 border-yellow-200' : 'bg-white'}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-sm text-gray-500">
                                    {format(new Date(note.createdAt), 'PPP p')}
                                </p>
                                {note.templateUsed && (
                                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-full text-gray-600">
                                        Template: {note.templateUsed}
                                    </span>
                                )}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => onPin(note._id, !note.pinned)}
                                    className={`p-2 rounded-full hover:bg-gray-100 ${note.pinned ? 'text-yellow-500' : 'text-gray-400'
                                        }`}
                                >
                                    <FaThumbtack />
                                </button>
                                <button
                                    onClick={() => onEdit(note)}
                                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={() => onDelete(note._id)}
                                    className="p-2 rounded-full hover:bg-gray-100 text-red-500"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                        <div className="prose max-w-none">
                            {note.content.split('\n').map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    </div>
                ))}
                {notes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No notes found. Add your first note to get started.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientNotesList; 