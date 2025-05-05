import React, { useState } from 'react';
import { FaTimes, FaPlus, FaTrash, FaEdit, FaCheck, FaArrowLeft, FaSave, FaEraser } from 'react-icons/fa';
import NoteTemplateSelector from './NoteTemplateSelector';
import { useTemplates } from '../context/TemplateContext';

const defaultTemplates = [
    {
        id: 'cbt',
        name: 'CBT Formulation',
        fields: [
            { id: 'presenting_problem', label: 'Presenting Problem', type: 'textarea' },
            { id: 'core_beliefs', label: 'Core Beliefs', type: 'textarea' },
            { id: 'intermediate_beliefs', label: 'Intermediate Beliefs', type: 'textarea' },
            { id: 'automatic_thoughts', label: 'Automatic Thoughts', type: 'textarea' },
            { id: 'emotional_response', label: 'Emotional Response', type: 'textarea' },
            { id: 'behavioral_response', label: 'Behavioral Response', type: 'textarea' },
            { id: 'homework', label: 'Homework Assigned', type: 'textarea' },
            { id: 'next_steps', label: 'Next Steps', type: 'textarea' }
        ]
    },
    {
        id: 'rebt',
        name: 'REBT Assessment',
        fields: [
            { id: 'activating_event', label: 'Activating Event', type: 'textarea' },
            { id: 'beliefs', label: 'Beliefs', type: 'textarea' },
            { id: 'consequences', label: 'Consequences', type: 'textarea' },
            { id: 'disputation', label: 'Disputation', type: 'textarea' },
            { id: 'new_effect', label: 'New Effect', type: 'textarea' },
            { id: 'homework', label: 'Homework Assigned', type: 'textarea' }
        ]
    },
    {
        id: 'person_centered',
        name: 'Person-Centered Approach',
        fields: [
            { id: 'client_experience', label: 'Client\'s Experience', type: 'textarea' },
            { id: 'therapist_response', label: 'Therapist\'s Response', type: 'textarea' },
            { id: 'client_reaction', label: 'Client\'s Reaction', type: 'textarea' },
            { id: 'therapeutic_process', label: 'Therapeutic Process', type: 'textarea' },
            { id: 'insights', label: 'Key Insights', type: 'textarea' }
        ]
    },
    {
        id: 'history',
        name: 'History Taking',
        fields: [
            { id: 'presenting_complaint', label: 'Presenting Complaint', type: 'textarea' },
            { id: 'history_present_illness', label: 'History of Present Illness', type: 'textarea' },
            { id: 'past_history', label: 'Past History', type: 'textarea' },
            { id: 'family_history', label: 'Family History', type: 'textarea' },
            { id: 'personal_history', label: 'Personal History', type: 'textarea' },
            { id: 'mental_status', label: 'Mental Status Examination', type: 'textarea' },
            { id: 'formulation', label: 'Formulation', type: 'textarea' },
            { id: 'treatment_plan', label: 'Treatment Plan', type: 'textarea' }
        ]
    }
];

const getInitialFieldValues = (template) => {
    if (!template) return {};
    const values = {};
    template.fields.forEach(field => {
        if (field.type === 'checkbox') {
            values[field.label] = [];
        } else {
            values[field.label] = '';
        }
    });
    return values;
};

const NoteEditor = ({
    onSave,
    onCancel,
    initialContent = '',
    isEditing = false,
    template = null,
    psychometricTools = [],
    clientNoteTemplates = [],
    appointments = []
}) => {
    const [content, setContent] = useState(initialContent);
    const [showTemplates, setShowTemplates] = useState(true);
    const [showManageTemplates, setShowManageTemplates] = useState(false);
    const [templateSection, setTemplateSection] = useState('notes');
    const [selectedAppointment, setSelectedAppointment] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState(template || null);
    const [fieldValues, setFieldValues] = useState(getInitialFieldValues(template));
    const [errors, setErrors] = useState({});
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [templateEditFields, setTemplateEditFields] = useState([]);
    const [templateEditName, setTemplateEditName] = useState('');
    const { setPsychometricTools, setClientNoteTemplates } = useTemplates();
    const templates = templateSection === 'psychometric' ? psychometricTools : clientNoteTemplates;

    // --- Template Management ---
    const openEditTemplate = (tpl) => {
        setEditingTemplate(tpl);
        setTemplateEditName(tpl.name);
        setTemplateEditFields(tpl.fields.map(f => ({ ...f })));
        setShowManageTemplates(true);
    };
    const openNewTemplate = () => {
        setEditingTemplate(null);
        setTemplateEditName('New Template');
        setTemplateEditFields([]);
        setShowManageTemplates(true);
    };
    const handleTemplateFieldChange = (idx, key, value) => {
        setTemplateEditFields(fields => fields.map((f, i) => i === idx ? { ...f, [key]: value } : f));
    };
    const handleAddTemplateField = () => {
        setTemplateEditFields(fields => [...fields, { id: Date.now(), label: '', type: 'textarea' }]);
    };
    const handleRemoveTemplateField = (idx) => {
        setTemplateEditFields(fields => fields.filter((_, i) => i !== idx));
    };
    const handleSaveTemplate = () => {
        if (!templateEditName.trim() || templateEditFields.length === 0) return;
        const newTemplate = {
            id: editingTemplate ? editingTemplate.id : Date.now().toString(),
            name: templateEditName,
            fields: templateEditFields.map(f => ({ ...f, id: f.id || Date.now() + Math.random() }))
        };
        if (templateSection === 'psychometric') {
            setPsychometricTools(prev =>
                editingTemplate
                    ? prev.map(t => t.id === editingTemplate.id ? newTemplate : t)
                    : [...prev, newTemplate]
            );
        } else {
            setClientNoteTemplates(prev =>
                editingTemplate
                    ? prev.map(t => t.id === editingTemplate.id ? newTemplate : t)
                    : [...prev, newTemplate]
            );
        }
        setShowManageTemplates(false);
        setEditingTemplate(null);
        setTemplateEditFields([]);
        setTemplateEditName('');
    };
    const handleDeleteTemplate = (id) => {
        if (templateSection === 'psychometric') {
            setPsychometricTools(prev => prev.filter(t => t.id !== id));
        } else {
            setClientNoteTemplates(prev => prev.filter(t => t.id !== id));
        }
        if (selectedTemplate && selectedTemplate.id === id) setSelectedTemplate(null);
    };

    const handleTemplateSelect = (tpl) => {
        setSelectedTemplate(tpl);
        setFieldValues(getInitialFieldValues(tpl));
    };

    const handleFieldChange = (label, value) => {
        setFieldValues(prev => ({ ...prev, [label]: value }));
    };

    const handleCheckboxChange = (label, option) => {
        setFieldValues(prev => {
            const arr = prev[label] || [];
            if (arr.includes(option)) {
                return { ...prev, [label]: arr.filter(o => o !== option) };
            } else {
                return { ...prev, [label]: [...arr, option] };
            }
        });
    };

    const validate = () => {
        if (!selectedTemplate) return true;
        const newErrors = {};
        selectedTemplate.fields.forEach(field => {
            if (field.required) {
                if (field.type === 'checkbox') {
                    if (!fieldValues[field.label] || fieldValues[field.label].length === 0) {
                        newErrors[field.label] = 'Required';
                    }
                } else if (!fieldValues[field.label] || fieldValues[field.label].toString().trim() === '') {
                    newErrors[field.label] = 'Required';
                }
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedTemplate) {
            if (!validate()) return;
            onSave({
                templateId: selectedTemplate.id,
                templateName: selectedTemplate.name,
                fields: fieldValues,
                appointmentID: selectedAppointment || null
            });
        } else {
            onSave({
                content,
                type: 'General Note',
                appointmentID: selectedAppointment || null
            });
        }
    };

    const handleClear = () => {
        if (selectedTemplate) {
            setFieldValues(getInitialFieldValues(selectedTemplate));
        } else {
            setContent('');
        }
        setErrors({});
    };

    // --- Render Dynamic Fields ---
    const renderField = (field) => {
        const fieldClasses = "w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500";
        const labelClasses = "block text-sm font-medium text-gray-700 mb-2";
        const errorClasses = "text-red-500 text-sm mt-1";

        switch (field.type) {
            case 'short_text':
                return (
                    <div className="mb-6">
                        <label className={labelClasses}>{field.label}</label>
                        <input
                            type="text"
                            className={fieldClasses}
                            value={fieldValues[field.label] || ''}
                            onChange={e => handleFieldChange(field.label, e.target.value)}
                            placeholder={field.label}
                        />
                        {errors[field.label] && <div className={errorClasses}>{errors[field.label]}</div>}
                    </div>
                );
            case 'long_text':
            case 'textarea':
                return (
                    <div className="mb-6">
                        <label className={labelClasses}>{field.label}</label>
                        <textarea
                            className={`${fieldClasses} min-h-[120px]`}
                            value={fieldValues[field.label] || ''}
                            onChange={e => handleFieldChange(field.label, e.target.value)}
                            placeholder={field.label}
                        />
                        {errors[field.label] && <div className={errorClasses}>{errors[field.label]}</div>}
                    </div>
                );
            case 'dropdown':
                return (
                    <div className="mb-6">
                        <label className={labelClasses}>{field.label}</label>
                        <select
                            className={fieldClasses}
                            value={fieldValues[field.label] || ''}
                            onChange={e => handleFieldChange(field.label, e.target.value)}
                        >
                            <option value="">Select...</option>
                            {field.options && field.options.map((opt, i) => (
                                <option key={i} value={opt}>{opt}</option>
                            ))}
                        </select>
                        {errors[field.label] && <div className={errorClasses}>{errors[field.label]}</div>}
                    </div>
                );
            case 'checkbox':
                return (
                    <div className="mb-6">
                        <label className={labelClasses}>{field.label}</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {field.options && field.options.map((opt, i) => (
                                <label key={i} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={fieldValues[field.label]?.includes(opt) || false}
                                        onChange={() => handleCheckboxChange(field.label, opt)}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className="text-gray-700">{opt}</span>
                                </label>
                            ))}
                        </div>
                        {errors[field.label] && <div className={errorClasses}>{errors[field.label]}</div>}
                    </div>
                );
            case 'radio':
                return (
                    <div className="mb-6">
                        <label className={labelClasses}>{field.label}</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {field.options && field.options.map((opt, i) => (
                                <label key={i} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={field.label}
                                        checked={fieldValues[field.label] === opt}
                                        onChange={() => handleFieldChange(field.label, opt)}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    />
                                    <span className="text-gray-700">{opt}</span>
                                </label>
                            ))}
                        </div>
                        {errors[field.label] && <div className={errorClasses}>{errors[field.label]}</div>}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white border-b px-8 py-4 flex items-center">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                >
                    <FaArrowLeft />
                    <span>Back</span>
                </button>
                <h2 className="mx-auto text-xl font-bold text-gray-800">
                    {isEditing ? 'Edit Note' : 'Add Note'}
                </h2>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-8 py-6">
                <div className="max-w-3xl mx-auto">
                    {/* Template Picker */}
                    <div className="mb-8">
                        <div className="flex gap-2 mb-4">
                            <button
                                className={`px-4 py-2 rounded-lg text-sm font-medium border ${templateSection === 'notes'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-gray-700'
                                    }`}
                                onClick={() => setTemplateSection('notes')}
                            >
                                Client Notes
                            </button>
                            <button
                                className={`px-4 py-2 rounded-lg text-sm font-medium border ${templateSection === 'psychometric'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-gray-700'
                                    }`}
                                onClick={() => setTemplateSection('psychometric')}
                            >
                                Psychometric Tools
                            </button>
                        </div>
                        <div className="border rounded-lg p-4 bg-white">
                            <NoteTemplateSelector
                                templates={templates}
                                selectedTemplate={selectedTemplate}
                                onSelectTemplate={handleTemplateSelect}
                                onDeleteTemplate={handleDeleteTemplate}
                                onEditTemplate={openEditTemplate}
                            />
                        </div>
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {selectedTemplate ? (
                            <div className="space-y-6">
                                {selectedTemplate.fields.map((field, idx) => (
                                    <div key={idx} className="bg-white rounded-lg p-6 border">
                                        {renderField(field)}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg p-6 border">
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-48 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter your notes here..."
                                    required
                                />
                            </div>
                        )}
                    </form>
                </div>
            </main>

            {/* Footer */}
            <footer className="sticky bottom-0 z-10 bg-white border-t px-8 py-4 flex justify-end gap-4">
                <button
                    onClick={handleClear}
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                    <FaEraser />
                    <span>Clear</span>
                </button>
                <button
                    onClick={onCancel}
                    className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    <FaSave />
                    <span>Save Note</span>
                </button>
            </footer>

            {/* Template Management Modal */}
            {showManageTemplates && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
                        <button
                            onClick={() => setShowManageTemplates(false)}
                            className="absolute top-3 right-3 p-2 text-gray-500 hover:text-gray-700"
                            aria-label="Close"
                        >
                            <FaTimes />
                        </button>
                        <h4 className="text-lg font-semibold mb-4">{editingTemplate ? 'Edit Template' : 'New Template'}</h4>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                            <input
                                type="text"
                                className="w-full border rounded px-2 py-1"
                                value={templateEditName}
                                onChange={e => setTemplateEditName(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fields</label>
                            {templateEditFields.map((field, idx) => (
                                <div key={field.id || idx} className="flex gap-2 mb-2 items-center">
                                    <input
                                        type="text"
                                        className="border rounded px-2 py-1 flex-1"
                                        value={field.label}
                                        onChange={e => handleTemplateFieldChange(idx, 'label', e.target.value)}
                                        placeholder="Field Label"
                                    />
                                    <select
                                        className="border rounded px-2 py-1"
                                        value={field.type}
                                        onChange={e => handleTemplateFieldChange(idx, 'type', e.target.value)}
                                    >
                                        <option value="textarea">Long Text</option>
                                        <option value="short_text">Short Text</option>
                                        <option value="dropdown">Dropdown</option>
                                        <option value="checkbox">Checkbox</option>
                                        <option value="radio">Radio</option>
                                    </select>
                                    <button
                                        onClick={() => handleRemoveTemplateField(idx)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                                        type="button"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={handleAddTemplateField}
                                className="mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-sm"
                                type="button"
                            >
                                <FaPlus className="inline mr-1" /> Add Field
                            </button>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowManageTemplates(false)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveTemplate}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Save Template
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoteEditor; 