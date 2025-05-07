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
    const [localSearch, setLocalSearch] = React.useState(searchQuery);
    const filteredNotes = notes.filter(note => {
        if (!localSearch) return true;
        const searchLower = localSearch.toLowerCase();
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
        <div className="space-y-6">
            {/* Modern Search Bar */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-indigo-700">Client Notes</h3>
                <div className="relative w-full max-w-xs ml-auto">
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={localSearch}
                        onChange={e => setLocalSearch(e.target.value)}
                        className="w-full px-4 py-2 pl-10 rounded-xl border border-indigo-100 bg-white shadow focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-gray-700 placeholder-gray-400"
                    />
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" size={18} />
                </div>
            </div>

            {/* Empty State */}
            {filteredNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-indigo-300 animate-fade-in">
                    <FileText size={48} />
                    <p className="mt-4 text-lg font-medium text-indigo-400">
                        {localSearch ? 'No notes match your search.' : 'No notes yet. Add your first note!'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    {filteredNotes.map((note) => {
                        const appointment = getAppointmentDetails(note.appointmentId);
                        return (
                            <div
                                key={note._id}
                                className={`relative bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-lg border border-indigo-100 p-6 transition-all hover:shadow-2xl group ${note.pinned ? 'ring-2 ring-indigo-300' : ''}`}
                            >
                                {/* Pin icon for pinned notes */}
                                {note.pinned && (
                                    <div className="absolute top-4 right-4 text-indigo-500">
                                        <Pin size={20} />
                                    </div>
                                )}
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <FileText className="text-indigo-400" size={20} />
                                        <span className="font-semibold text-indigo-700 text-lg">
                                            {note.templateUsed}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onPinNote(note._id, !note.pinned)}
                                            className={`p-2 rounded-full hover:bg-indigo-100 transition ${note.pinned ? 'text-indigo-600' : 'text-gray-400'}`}
                                            title={note.pinned ? 'Unpin' : 'Pin'}
                                        >
                                            <Pin size={16} />
                                        </button>
                                        <button
                                            onClick={() => onEditNote(note)}
                                            className="p-2 rounded-full hover:bg-indigo-100 text-gray-400 transition"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDeleteNote(note._id)}
                                            className="p-2 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition"
                                            title="Delete"
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

                                <p className="text-gray-700 text-base whitespace-pre-wrap leading-relaxed mt-2">
                                    {note.content}
                                </p>

                                {note.fields && Object.keys(note.fields).length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-indigo-100">
                                        <h4 className="text-xs font-semibold text-indigo-400 mb-2">Template Fields</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(note.fields).map(([key, value]) => (
                                                <div key={key} className="text-sm">
                                                    <span className="text-indigo-400 font-medium">{key}:</span>
                                                    <span className="ml-1 text-indigo-700">{value}</span>
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