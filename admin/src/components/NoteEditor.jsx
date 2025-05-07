import React, { useState, useEffect, useContext } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useTemplates } from '../context/TemplateContext';
import { toast } from 'react-toastify';
import { TherapistContext } from '../context/TherapistContext';
import { X } from 'lucide-react';

const NoteEditor = ({ onClose, onCancel, onSave, clientId, appointments = [], selectedSessionId = null }) => {
    const { addClientNote } = useContext(TherapistContext);
    const { psychometricTools, clientNoteTemplates, isLoading: templatesLoading } = useTemplates();

    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [fieldValues, setFieldValues] = useState({});
    const [content, setContent] = useState('');
    const [appointmentID, setAppointmentID] = useState(selectedSessionId || '');
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [templateTab, setTemplateTab] = useState('notes');

    const templates = templateTab === 'notes' ? clientNoteTemplates : psychometricTools;

    useEffect(() => {
        if (selectedSessionId) {
            setAppointmentID(selectedSessionId);
        }
    }, [selectedSessionId]);

    useEffect(() => {
        if (selectedTemplate) {
            const initialValues = {};
            selectedTemplate.fields.forEach(field => {
                initialValues[field.label] = '';
            });
            setFieldValues(initialValues);
        }
    }, [selectedTemplate]);

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        setShowTemplateSelector(false);
    };

    const handleFieldChange = (fieldLabel, value) => {
        setFieldValues(prev => ({
            ...prev,
            [fieldLabel]: value
        }));
    };

    const handleClose = () => {
        if (onClose) onClose();
        if (onCancel) onCancel();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            const noteData = {
                clientId,
                appointmentId: appointmentID || null,
                date: new Date().toISOString(),
                tags: [],
                status: 'published'
            };

            if (selectedTemplate) {
                noteData.templateUsed = selectedTemplate.name;
                noteData.fields = fieldValues;
                noteData.content = Object.entries(fieldValues)
                    .map(([label, value]) => `${label}: ${value}`)
                    .join('\n');
            } else {
                if (!content.trim()) {
                    toast.error('Note content is required');
                    return;
                }
                noteData.content = content;
                noteData.templateUsed = 'General';
                noteData.fields = {};
            }

            console.log('Sending note data:', noteData);
            await onSave(noteData);
            handleClose();
        } catch (error) {
            console.error('Error saving note:', error);
            toast.error('Failed to save note');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Add Note</h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                        <select
                            value={appointmentID}
                            onChange={(e) => setAppointmentID(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="">Select a session</option>
                            {appointments.map(appointment => (
                                <option key={appointment._id} value={appointment._id}>
                                    {new Date(appointment.date).toLocaleDateString()} - {appointment.time}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Template Type</label>
                        <div className="flex gap-2 mb-4">
                            <button
                                type="button"
                                className={`px-4 py-2 rounded-lg text-sm font-medium border ${templateTab === 'notes' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
                                onClick={() => setTemplateTab('notes')}
                            >
                                Client Notes
                            </button>
                            <button
                                type="button"
                                className={`px-4 py-2 rounded-lg text-sm font-medium border ${templateTab === 'psychometric' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
                                onClick={() => setTemplateTab('psychometric')}
                            >
                                Psychometric Tools
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                {selectedTemplate ? 'Change Template' : 'Select Template'}
                            </button>
                            {selectedTemplate && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedTemplate(null)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                >
                                    Clear Template
                                </button>
                            )}
                        </div>
                    </div>

                    {showTemplateSelector && (
                        <div className="border rounded-md p-4">
                            <h3 className="font-medium mb-2">Select a Template</h3>
                            {templatesLoading ? (
                                <div className="text-center py-4">Loading templates...</div>
                            ) : templates.length === 0 ? (
                                <div className="text-center py-4 text-gray-500">No templates found</div>
                            ) : (
                                <div className="space-y-2">
                                    {templates.map(template => (
                                        <button
                                            key={template._id}
                                            onClick={() => handleTemplateSelect(template)}
                                            className="w-full text-left p-2 hover:bg-gray-100 rounded-md"
                                        >
                                            {template.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {selectedTemplate ? (
                        <div className="space-y-4">
                            {selectedTemplate.fields.map(field => (
                                <div key={field.label}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {field.label}
                                    </label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            value={fieldValues[field.label] || ''}
                                            onChange={(e) => handleFieldChange(field.label, e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            rows={4}
                                        />
                                    ) : field.type === 'radio' ? (
                                        <div className="space-y-2">
                                            {field.options.map(option => (
                                                <label key={option} className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name={`field-${field.label}`}
                                                        value={option}
                                                        checked={fieldValues[field.label] === option}
                                                        onChange={() => handleFieldChange(field.label, option)}
                                                        className="mr-2"
                                                    />
                                                    {option}
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <input
                                            type={field.type}
                                            value={fieldValues[field.label] || ''}
                                            onChange={(e) => handleFieldChange(field.label, e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Note Content</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                rows={6}
                                placeholder="Enter your note here..."
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Note'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NoteEditor; 