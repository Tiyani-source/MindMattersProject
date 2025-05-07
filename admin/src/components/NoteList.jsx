import React from 'react';
import { FileText, Pin, Trash2, Edit2, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

const NoteList = ({
    notes,
    onPinNote,
    onDeleteNote,
    onEditNote,
    searchQuery = '',
    sessions
}) => {
    const filteredNotes = notes.filter(note => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        return (
            note.content?.toLowerCase().includes(searchLower) ||
            note.templateUsed?.toLowerCase().includes(searchLower)
        );
    });

    const getAppointmentDetails = (appointmentId) => {
        if (!appointmentId || !sessions) return null;
        return sessions.find(session => session._id === appointmentId);
    };

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
                    {filteredNotes.map((note) => {
                        const appointment = getAppointmentDetails(note.appointmentId);
                        return (
                            <div
                                key={note._id}
                                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <FileText className="text-indigo-500" size={18} />
                                        <span className="font-medium text-gray-800">
                                            {note.templateUsed}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onPinNote(note._id, !note.pinned)}
                                            className={`p-1 rounded-full hover:bg-gray-100 ${note.pinned ? 'text-indigo-600' : 'text-gray-400'}`}
                                        >
                                            <Pin size={16} />
                                        </button>
                                        <button
                                            onClick={() => onEditNote(note)}
                                            className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDeleteNote(note._id)}
                                            className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Appointment Details */}
                                {appointment && (
                                    <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            <span>{format(new Date(appointment.date), 'MMM d, yyyy')}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} />
                                            <span>{appointment.time}</span>
                                        </div>
                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs">
                                            {appointment.type} session
                                        </span>
                                    </div>
                                )}

                                <p className="text-gray-600 text-sm whitespace-pre-wrap">
                                    {note.content}
                                </p>

                                {note.fields && Object.keys(note.fields).length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <h4 className="text-xs font-medium text-gray-500 mb-2">Template Fields</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(note.fields).map(([key, value]) => (
                                                <div key={key} className="text-sm">
                                                    <span className="text-gray-500">{key}:</span>
                                                    <span className="ml-1 text-gray-700">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default NoteList; 