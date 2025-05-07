import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const ClientNoteForm = ({ appointment, templates, initialData, onSave, onCancel }) => {
    const [content, setContent] = useState(initialData?.content || '');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [showTemplates, setShowTemplates] = useState(false);

    useEffect(() => {
        if (selectedTemplate) {
            const template = templates.find(t => t.name === selectedTemplate);
            if (template) {
                setContent(template.content);
            }
        }
    }, [selectedTemplate, templates]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            content,
            templateUsed: selectedTemplate || undefined
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                    {initialData ? 'Edit Note' : 'Add New Note'}
                </h2>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <FaTimes size={20} />
                </button>
            </div>

            {appointment && (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium">Appointment Details</h3>
                    <p className="text-sm text-gray-600">
                        {appointment.type} - {new Date(appointment.date).toLocaleDateString()}
                    </p>
                </div>
            )}

            {/* Appointment Dropdown */}
            {Array.isArray(appointment) && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Appointment (required)
                    </label>
                    <select
                        className="w-full p-2 border rounded"
                        required
                    // You may want to manage selected appointment in parent or here
                    >
                        <option value="">Select a past appointment</option>
                        {appointment
                            .slice()
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
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
            )}

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Note Template (Optional)
                </label>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="w-full text-left px-3 py-2 border rounded-lg bg-white"
                    >
                        {selectedTemplate || 'Select a template...'}
                    </button>
                    {showTemplates && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            <div
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                    setSelectedTemplate('');
                                    setShowTemplates(false);
                                }}
                            >
                                No Template
                            </div>
                            {templates.map(template => (
                                <div
                                    key={template._id}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                        setSelectedTemplate(template.name);
                                        setShowTemplates(false);
                                    }}
                                >
                                    {template.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Note Content
                </label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={10}
                    placeholder="Enter your notes here..."
                    required
                />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                    {initialData ? 'Update Note' : 'Save Note'}
                </button>
            </div>
        </form>
    );
};

export default ClientNoteForm; 