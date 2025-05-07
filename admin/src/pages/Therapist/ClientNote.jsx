import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ClientNoteForm from '../../components/ClientNoteForm';
import ClientNotesList from '../../components/ClientNotesList';

const API = import.meta.env.VITE_BACKEND_URL + '/api/therapist';

const ClientNote = () => {
    const { clientId } = useParams();
    const location = useLocation();
    const { client, appointments = [] } = location.state || { client: '', appointments: [] };
    const navigate = useNavigate();

    const [notes, setNotes] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotes();
        fetchTemplates();
    }, [clientId]);

    const fetchNotes = async () => {
        try {
            const response = await axios.get(`${API}/client-notes?clientID=${clientId}`);
            setNotes(response.data.notes);
        } catch (error) {
            toast.error('Failed to fetch notes');
            console.error('Error fetching notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplates = async () => {
        try {
            const response = await axios.get(`${API}/note-templates`);
            setTemplates(response.data.templates);
        } catch (error) {
            toast.error('Failed to fetch templates');
            console.error('Error fetching templates:', error);
        }
    };

    const handleSaveNote = async (noteData) => {
        try {
            if (selectedNote) {
                await axios.patch(`${API}/client-notes/${selectedNote._id}`, noteData);
                toast.success('Note updated successfully');
            } else {
                await axios.post(`${API}/client-notes`, {
                    ...noteData,
                    clientID: clientId,
                    appointmentID: selectedAppointment?._id
                });
                toast.success('Note created successfully');
            }
            setShowForm(false);
            setSelectedNote(null);
            setSelectedAppointment(null);
            fetchNotes();
        } catch (error) {
            toast.error('Failed to save note');
            console.error('Error saving note:', error);
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            try {
                await axios.delete(`${API}/client-notes/${noteId}`);
                toast.success('Note deleted successfully');
                fetchNotes();
            } catch (error) {
                toast.error('Failed to delete note');
                console.error('Error deleting note:', error);
            }
        }
    };

    const handlePinToggle = async (noteId, pinned) => {
        try {
            await axios.patch(`${API}/client-notes/${noteId}/pin`, { pinned });
            fetchNotes();
        } catch (error) {
            toast.error('Failed to update note pin status');
            console.error('Error updating pin status:', error);
        }
    };

    const handleEditNote = (note) => {
        setSelectedNote(note);
        setSelectedAppointment(appointments.find(a => a._id === note.appointmentID) || null);
        setShowForm(true);
    };

    const handleAddNote = (appointment = null) => {
        setSelectedNote(null);
        setSelectedAppointment(appointment);
        setShowForm(true);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Client Notes</h1>
                    <p className="text-gray-600">{client?.name || 'Client'}</p>
                </div>
                <button
                    onClick={() => handleAddNote()}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                    Add New Note
                </button>
            </div>

            {appointments.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-4">Recent Appointments</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {appointments.map(appointment => (
                            <div
                                key={appointment._id}
                                className="border rounded-lg p-4 hover:border-primary cursor-pointer"
                                onClick={() => handleAddNote(appointment)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium">{appointment.type}</h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(appointment.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddNote(appointment);
                                        }}
                                        className="text-primary hover:text-primary/80"
                                    >
                                        Add Note
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <ClientNotesList
                notes={notes}
                templates={templates}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                onPinToggle={handlePinToggle}
            />

            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <ClientNoteForm
                            appointment={selectedAppointment}
                            templates={templates}
                            initialData={selectedNote}
                            onSave={handleSaveNote}
                            onCancel={() => {
                                setShowForm(false);
                                setSelectedNote(null);
                                setSelectedAppointment(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientNote;