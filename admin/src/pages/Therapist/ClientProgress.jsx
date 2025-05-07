import React, { useState, useEffect, useContext } from 'react';
import { TherapistContext } from '../../context/TherapistContext';
import { toast } from 'react-toastify';

const ClientProgress = ({ clientID, therapistID, appointments = [] }) => {
    const {
        dToken,
        // You may want to add these to context if not present:
        // fetchClientProgress, addClientProgress, pinClientProgress, searchClientProgress
    } = useContext(TherapistContext);

    const [progressNotes, setProgressNotes] = useState([]);
    const [search, setSearch] = useState('');
    const [newNote, setNewNote] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch progress notes
    const fetchProgressNotes = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/therapist/client-progress?clientID=${clientID}&therapistID=${therapistID}`, {
                headers: { ttoken: dToken }
            });
            const data = await res.json();
            if (data.success) setProgressNotes(data.notes);
        } catch (err) {
            toast.error('Failed to fetch progress notes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (clientID && therapistID) fetchProgressNotes();
    }, [clientID, therapistID]);

    // Add new progress note
    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/therapist/client-progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ttoken: dToken
                },
                body: JSON.stringify({
                    therapistID,
                    clientID,
                    appointmentID: selectedAppointment || undefined,
                    progressNote: newNote
                })
            });
            const data = await res.json();
            if (data.success) {
                setNewNote('');
                setSelectedAppointment('');
                fetchProgressNotes();
                toast.success('Progress note added');
            }
        } catch (err) {
            toast.error('Failed to add progress note');
        }
    };

    // Pin/unpin note
    const handlePin = async (noteId, pin) => {
        try {
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/therapist/client-progress/${noteId}/pin`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ttoken: dToken },
                body: JSON.stringify({ pinned: pin })
            });
            fetchProgressNotes();
        } catch (err) {
            toast.error('Failed to update pin');
        }
    };

    // Search notes
    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) return fetchProgressNotes();
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/therapist/client-progress/search?query=${encodeURIComponent(query)}&clientID=${clientID}`, {
                headers: { ttoken: dToken }
            });
            const data = await res.json();
            if (data.success) setProgressNotes(data.notes);
        } catch (err) {
            toast.error('Search failed');
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Client Progress</h2>
            <div className="mb-4 flex gap-2">
                <input
                    type="text"
                    placeholder="Search progress notes..."
                    value={search}
                    onChange={e => handleSearch(e.target.value)}
                    className="p-2 border rounded w-1/2"
                />
            </div>
            <div className="mb-6 flex gap-2 items-end">
                <textarea
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Add a new progress note..."
                    className="w-2/3 p-2 border rounded"
                    rows={3}
                />
                <select
                    value={selectedAppointment}
                    onChange={e => setSelectedAppointment(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="">No appointment</option>
                    {appointments.map(app => (
                        <option key={app._id} value={app._id}>
                            {app.type} - {new Date(app.date).toLocaleDateString()}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleAddNote}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                >
                    Add Note
                </button>
            </div>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="space-y-4">
                    {progressNotes.length === 0 ? (
                        <div className="text-gray-500">No progress notes found.</div>
                    ) : (
                        progressNotes.map(note => (
                            <div key={note._id} className={`p-4 border rounded-lg ${note.pinned ? 'bg-yellow-50 border-yellow-200' : 'bg-white'}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-500">{new Date(note.createdAt).toLocaleString()}</span>
                                    <button
                                        onClick={() => handlePin(note._id, !note.pinned)}
                                        className={`p-2 rounded-full ${note.pinned ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-500`}
                                    >
                                        {note.pinned ? '★' : '☆'}
                                    </button>
                                </div>
                                <div className="text-gray-700 whitespace-pre-wrap">{note.progressNote}</div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ClientProgress; 