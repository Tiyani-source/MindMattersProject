import React, { useState, useEffect, useContext } from 'react';
import { TherapistContext } from '../../context/TherapistContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from '../../assets/assets';
import NoteTemplateForm from '../../components/NoteTemplateForm';

const API = import.meta.env.VITE_BACKEND_URL + '/api/therapist';

const ClientNotes = () => {
    const navigate = useNavigate();
    const {
        therapistID,
        fetchClientNotes,
        addClientNote,
        pinClientNote,
        searchClientNotes,
        fetchNoteTemplates,
        addNoteTemplate,
        deleteNoteTemplate,
        fetchClientsByAppointments
    } = useContext(TherapistContext);

    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientStatus, setClientStatus] = useState('ongoing');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [noteForm, setNoteForm] = useState({
        title: '',
        content: {},
        type: 'session',
        tags: [],
        appointmentID: ''
    });
    const [showTemplateForm, setShowTemplateForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [clientAppointments, setClientAppointments] = useState([]);

    // Fetch templates
    const loadTemplates = async () => {
        const loadedTemplates = await fetchNoteTemplates();
        setTemplates(loadedTemplates);
    };

    // Fetch appointments for selected client
    const fetchClientAppointments = async (clientId) => {
        try {
            const { data } = await axios.get(`${API}/appointments?clientID=${clientId}`, {
                headers: { ttoken: localStorage.getItem('dToken') }
            });
            if (data.success) {
                // Filter out cancelled appointments and sort by date
                const validAppointments = data.appointments
                    .filter(app => app.statusOfAppointment !== 'cancelled')
                    .sort((a, b) => new Date(b.date) - new Date(a.date));
                setClientAppointments(validAppointments);
            }
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setClientAppointments([]);
        }
    };

    useEffect(() => {
        const loadClients = async () => {
            const fetchedClients = await fetchClientsByAppointments();
            setClients(fetchedClients);
        };
        loadClients();
        loadTemplates();
    }, []);

    useEffect(() => {
        if (selectedClient?._id) {
            fetchClientAppointments(selectedClient._id);
        } else {
            setClientAppointments([]);
        }
    }, [selectedClient]);

    // Helper: Convert time string to 24-hour format
    function convertTo24Hour(timeStr) {
        if (!timeStr) return '00:00';
        let [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours, 10);
        minutes = parseInt(minutes, 10);
        if (modifier) {
            if (modifier.toUpperCase() === 'PM' && hours !== 12) hours += 12;
            if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
        }
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // Modernized pastAppointments logic
    const pastAppointments = clientAppointments.filter(app => {
        const dateStr = app.date ? new Date(app.date).toISOString().split('T')[0] : null;
        const timeStr = app.timeSlot?.startTime || '00:00';
        const fullDateTime = new Date(`${dateStr}T${convertTo24Hour(timeStr)}`);
        const now = new Date();
        return (fullDateTime < now || app.statusOfAppointment === 'completed');
    });

    // Handle template selection
    const handleTemplateSelect = (template) => {
        if (!template) {
            setSelectedTemplate(null);
            setNoteForm({
                ...noteForm,
                content: '',
                type: 'custom'
            });
        } else {
            setSelectedTemplate(template);
            setNoteForm({
                ...noteForm,
                type: template.category,
                content: template.fields.reduce((acc, field) => ({
                    ...acc,
                    [field.name]: ''
                }), {})
            });
        }
    };

    // Handle note submission
    const handleNoteSubmit = async () => {
        if (!selectedClient) {
            toast.error('Please select a client first');
            return;
        }
        try {
            const notePayload = {
                clientID: selectedClient._id,
                appointmentID: noteForm.appointmentID,
                title: noteForm.title,
                type: selectedTemplate ? selectedTemplate.category : 'custom',
                content: selectedTemplate ? noteForm.content : noteForm.content,
                templateUsed: selectedTemplate ? selectedTemplate._id : null,
                tags: noteForm.tags || []
            };
            console.log('Saving client note:', notePayload);
            await addClientNote(notePayload);
            toast.success('Note added successfully');
            setShowNoteModal(false);
            setNoteForm({
                title: '',
                content: '',
                type: 'session',
                tags: [],
                appointmentID: ''
            });
            setSelectedTemplate(null);
        } catch (err) {
            toast.error('Failed to add note');
        }
    };

    // Template CRUD
    const handleAddTemplate = async (template) => {
        try {
            await addNoteTemplate(template);
            setShowTemplateForm(false);
            setEditingTemplate(null);
            await loadTemplates();
            toast.success('Template created successfully');
        } catch (err) {
            toast.error('Failed to create template');
        }
    };
    const handleEditTemplate = async (id, template) => {
        // Not implemented: add edit API if needed
        setShowTemplateForm(false);
        setEditingTemplate(null);
        loadTemplates();
    };
    const handleDeleteTemplate = async (id) => {
        await deleteNoteTemplate(id);
        loadTemplates();
    };

    // Render template form fields
    const renderTemplateFields = () => {
        if (!selectedTemplate) return null;
        return selectedTemplate.fields.map((field) => (
            <div key={field.name} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'textarea' ? (
                    <textarea
                        className="w-full p-2 border rounded"
                        value={noteForm.content[field.name] || ''}
                        onChange={(e) => setNoteForm({
                            ...noteForm,
                            content: {
                                ...noteForm.content,
                                [field.name]: e.target.value
                            }
                        })}
                        placeholder={field.placeholder}
                        required={field.required}
                    />
                ) : field.type === 'select' ? (
                    <select
                        className="w-full p-2 border rounded"
                        value={noteForm.content[field.name] || ''}
                        onChange={(e) => setNoteForm({
                            ...noteForm,
                            content: {
                                ...noteForm.content,
                                [field.name]: e.target.value
                            }
                        })}
                        required={field.required}
                    >
                        <option value="">Select {field.label}</option>
                        {field.options.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={field.type === 'date' ? 'date' : 'text'}
                        className="w-full p-2 border rounded"
                        value={noteForm.content[field.name] || ''}
                        onChange={(e) => setNoteForm({
                            ...noteForm,
                            content: {
                                ...noteForm.content,
                                [field.name]: e.target.value
                            }
                        })}
                        placeholder={field.placeholder}
                        required={field.required}
                    />
                )}
            </div>
        ));
    };

    // Only enable Add Note if a client is selected
    const canAddNote = !!selectedClient;

    // Modal close handlers
    const handleCloseNoteModal = () => {
        setShowNoteModal(false);
        setNoteForm({
            title: '',
            content: '',
            type: 'session',
            tags: [],
            appointmentID: ''
        });
        setSelectedTemplate(null);
    };
    const handleCloseTemplateModal = () => {
        setShowTemplateModal(false);
        setShowTemplateForm(false);
        setEditingTemplate(null);
    };

    // Set Blank Note as default when opening modal
    const openNoteModal = () => {
        setShowNoteModal(true);
        setSelectedTemplate(null); // Blank Note by default
        setNoteForm({
            title: '',
            content: '', // Freeform content for blank note
            type: 'session',
            tags: [],
            appointmentID: ''
        });
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Client Notes</h1>
                <div className="flex gap-4">
                    <button
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                        onClick={() => canAddNote && openNoteModal()}
                        disabled={!canAddNote}
                    >
                        Add Note
                    </button>
                    <button
                        className="px-4 py-2 border border-primary text-primary rounded hover:bg-primary-light"
                        onClick={() => setShowTemplateModal(true)}
                    >
                        Manage Templates
                    </button>
                </div>
            </div>

            {/* Client Status Filter */}
            <div className="flex gap-4 mb-6">
                {['ongoing', 'terminated', 'archived'].map((status) => (
                    <button
                        key={status}
                        className={`px-4 py-2 rounded ${clientStatus === status
                            ? 'bg-primary text-white'
                            : 'border border-gray-300 hover:bg-gray-100'
                            }`}
                        onClick={() => setClientStatus(status)}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)} Clients
                    </button>
                ))}
            </div>

            {/* Search and Client List */}
            <div className="grid grid-cols-4 gap-6">
                <div className="col-span-1">
                    <input
                        type="text"
                        placeholder="Search clients..."
                        className="w-full p-2 border rounded mb-4"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="border rounded max-h-[600px] overflow-y-auto">
                        {clients
                            .filter(client =>
                                client.name.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map(client => {
                                // totalSessions now reflects ALL sessions, not just completed
                                console.log('Rendering client card:', client, 'Total sessions:', client.totalSessions);
                                return (
                                    <div
                                        key={client._id}
                                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedClient?._id === client._id ? 'bg-primary-light' : ''}`}
                                        onClick={() => setSelectedClient(client)}
                                    >
                                        <h3 className="font-medium">{client.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {/* Backend does not provide category, so show N/A if missing */}
                                            {client.category && client.category.trim() ? client.category : 'N/A'} • {typeof client.totalSessions === 'number' ? client.totalSessions : 0} sessions
                                        </p>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* Client Details and Notes */}
                <div className="col-span-3">
                    {selectedClient ? (
                        <div>
                            <div className="bg-white p-4 rounded-lg shadow mb-4">
                                <h2 className="text-xl font-semibold mb-2">{selectedClient.name}</h2>
                                <div className="flex gap-4 text-sm text-gray-600">
                                    <span>Status: {selectedClient.clientStatus}</span>
                                    {/* Backend does not provide category, so show N/A if missing */}
                                    <span>Category: {selectedClient.category && selectedClient.category.trim() ? selectedClient.category : 'N/A'}</span>
                                    <span>Total Sessions: {typeof selectedClient.totalSessions === 'number' ? selectedClient.totalSessions : 0}</span>
                                </div>
                            </div>

                            {/* Notes List */}
                            <div className="space-y-4">
                                {selectedClient.notes?.map(note => (
                                    <div key={note._id} className="bg-white p-4 rounded-lg shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-medium">{note.title}</h3>
                                            <button
                                                className={`text-lg ${note.pinned ? 'text-yellow-500' : 'text-gray-400'}`}
                                                onClick={() => pinClientNote(note._id, !note.pinned)}
                                            >
                                                {note.pinned ? '★' : '☆'}
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {new Date(note.createdAt).toLocaleDateString()}
                                        </p>
                                        <div className="prose max-w-none">
                                            {Object.entries(note.content).map(([key, value]) => (
                                                <div key={key} className="mb-2">
                                                    <strong className="text-gray-700">{key}:</strong>
                                                    <p className="text-gray-600">{value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Select a client to view notes</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Note Modal */}
            {showNoteModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={handleCloseNoteModal}
                >
                    <div
                        className="bg-white p-6 rounded-lg w-2/3 max-h-[90vh] overflow-y-auto relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                            onClick={handleCloseNoteModal}
                        >
                            &times;
                        </button>
                        <h2 className="text-xl font-semibold mb-4">Add New Note</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Template
                            </label>
                            <select
                                className="w-full p-2 border rounded"
                                value={selectedTemplate ? selectedTemplate._id : ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (!val) {
                                        handleTemplateSelect(null);
                                    } else {
                                        const template = templates.find(t => t._id === val);
                                        handleTemplateSelect(template);
                                    }
                                }}
                            >
                                <option value="">Blank Note (No Template)</option>
                                {templates.map(template => (
                                    <option key={template._id} value={template._id}>
                                        {template.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Appointment (required)
                            </label>
                            <select
                                className="w-full p-2 border rounded"
                                value={noteForm.appointmentID || ''}
                                onChange={e => setNoteForm({ ...noteForm, appointmentID: e.target.value })}
                                required
                            >
                                <option value="">Select a past appointment</option>
                                {pastAppointments
                                    .slice() // copy array
                                    .sort((a, b) => {
                                        // Sort by date descending
                                        const dateA = new Date(a.date);
                                        const dateB = new Date(b.date);
                                        return dateB - dateA;
                                    })
                                    .map(app => {
                                        const dateStr = new Date(app.date).toLocaleDateString();
                                        const timeStr = app.timeSlot?.startTime || app.time || '';
                                        const typeStr = app.typeOfAppointment || app.type || '';
                                        return (
                                            <option key={app._id} value={app._id}>
                                                {dateStr}{timeStr ? `, ${timeStr}` : ''} - {typeStr}
                                            </option>
                                        );
                                    })}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title
                            </label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded"
                                value={noteForm.title}
                                onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                                placeholder="Note title"
                                required
                            />
                        </div>
                        {/* Render freeform textarea if blank note, else render template fields */}
                        {!selectedTemplate ? (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Note Content
                                </label>
                                <textarea
                                    className="w-full p-2 border rounded"
                                    value={noteForm.content}
                                    onChange={e => setNoteForm({ ...noteForm, content: e.target.value })}
                                    placeholder="Enter your note here..."
                                    required
                                />
                            </div>
                        ) : (
                            renderTemplateFields()
                        )}
                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                                onClick={handleCloseNoteModal}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                                onClick={handleNoteSubmit}
                                disabled={
                                    !noteForm.appointmentID ||
                                    !noteForm.title.trim() ||
                                    (!selectedTemplate && !noteForm.content.trim())
                                }
                            >
                                Save Note
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Management Modal */}
            {showTemplateModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={handleCloseTemplateModal}
                >
                    <div
                        className="bg-white p-6 rounded-lg w-2/3 max-h-[90vh] overflow-y-auto relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                            onClick={handleCloseTemplateModal}
                        >
                            &times;
                        </button>
                        <h2 className="text-xl font-semibold mb-4">Manage Templates</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {templates.map(template => (
                                <div key={template._id} className="border rounded p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium">{template.name}</h3>
                                        <button
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => handleDeleteTemplate(template._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                                    <div className="text-xs text-gray-500">
                                        {template.fields.length} fields • {template.category}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6">
                            <button
                                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                                onClick={() => setShowTemplateForm(true)}
                            >
                                Add New Template
                            </button>
                        </div>
                        {showTemplateForm && (
                            <div
                                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                                onClick={handleCloseTemplateModal}
                            >
                                <div
                                    className="bg-white p-6 rounded-lg w-full max-w-2xl relative"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <button
                                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                                        onClick={handleCloseTemplateModal}
                                    >
                                        &times;
                                    </button>
                                    <NoteTemplateForm
                                        onSubmit={handleAddTemplate}
                                        onCancel={handleCloseTemplateModal}
                                        initialTemplate={editingTemplate}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientNotes; 