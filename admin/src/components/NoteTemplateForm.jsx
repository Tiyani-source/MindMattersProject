import React, { useState } from 'react';

const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'select', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'date', label: 'Date' },
    { value: 'rating', label: 'Rating' }
];

const templateCategories = [
    { value: 'assessment', label: 'Assessment' },
    { value: 'formulation', label: 'Formulation' },
    { value: 'session', label: 'Session Notes' },
    { value: 'progress', label: 'Progress Notes' },
    { value: 'custom', label: 'Custom' }
];

const defaultTemplates = {
    assessment: {
        name: 'Mental Health Assessment',
        description: 'Comprehensive mental health assessment template',
        fields: [
            { name: 'presenting_problem', type: 'textarea', label: 'Presenting Problem', required: true },
            { name: 'history', type: 'textarea', label: 'History of Presenting Problem', required: true },
            { name: 'mental_state', type: 'textarea', label: 'Mental State Examination', required: true },
            { name: 'risk_assessment', type: 'textarea', label: 'Risk Assessment', required: true },
            { name: 'diagnosis', type: 'select', label: 'Provisional Diagnosis', options: ['Anxiety', 'Depression', 'PTSD', 'Other'], required: true }
        ]
    },
    formulation: {
        name: 'CBT Formulation',
        description: 'Cognitive Behavioral Therapy formulation template',
        fields: [
            { name: 'situation', type: 'textarea', label: 'Triggering Situation', required: true },
            { name: 'thoughts', type: 'textarea', label: 'Automatic Thoughts', required: true },
            { name: 'emotions', type: 'textarea', label: 'Emotional Response', required: true },
            { name: 'behaviors', type: 'textarea', label: 'Behavioral Response', required: true },
            { name: 'core_beliefs', type: 'textarea', label: 'Core Beliefs', required: true }
        ]
    },
    session: {
        name: 'Session Notes',
        description: 'Standard session notes template',
        fields: [
            { name: 'session_date', type: 'date', label: 'Session Date', required: true },
            { name: 'session_focus', type: 'textarea', label: 'Session Focus', required: true },
            { name: 'interventions', type: 'textarea', label: 'Interventions Used', required: true },
            { name: 'homework', type: 'textarea', label: 'Homework Assigned', required: false },
            { name: 'next_session', type: 'date', label: 'Next Session Date', required: false }
        ]
    }
};

const NoteTemplateForm = ({ onSubmit, onCancel, initialTemplate = null }) => {
    const [template, setTemplate] = useState(initialTemplate || {
        name: '',
        description: '',
        category: 'custom',
        fields: [],
        isDefault: false
    });

    const [newField, setNewField] = useState({
        name: '',
        type: 'text',
        label: '',
        placeholder: '',
        required: false,
        options: []
    });

    const [showFieldForm, setShowFieldForm] = useState(false);

    const handleAddField = () => {
        if (!newField.name || !newField.label) return;

        setTemplate({
            ...template,
            fields: [...template.fields, { ...newField }]
        });

        setNewField({
            name: '',
            type: 'text',
            label: '',
            placeholder: '',
            required: false,
            options: []
        });
        setShowFieldForm(false);
    };

    const handleRemoveField = (index) => {
        setTemplate({
            ...template,
            fields: template.fields.filter((_, i) => i !== index)
        });
    };

    const handleLoadDefault = (category) => {
        const defaultTemplate = defaultTemplates[category];
        if (defaultTemplate) {
            setTemplate({
                ...template,
                name: defaultTemplate.name,
                description: defaultTemplate.description,
                category: category,
                fields: defaultTemplate.fields
            });
        }
        
    };

    const handleSubmit = () => {
        let finalTemplate = { ...template };
        if (!finalTemplate.category) {
            finalTemplate.category = 'custom';
        }
        if (!finalTemplate.name.trim() || !finalTemplate.category || !finalTemplate.fields.length) {
            alert('Please fill all required fields and add at least one field.');
            return;
        }
        for (const field of finalTemplate.fields) {
            if (!field.name || !field.type || !field.label) {
                alert('Each field must have a name, type, and label.');
                return;
            }
        }
        console.log('Submitting template:', finalTemplate);
        onSubmit(finalTemplate);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Template Name
                    </label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={template.name}
                        onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                    </label>
                    <select
                        className="w-full p-2 border rounded"
                        value={template.category}
                        onChange={(e) => {
                            setTemplate({ ...template, category: e.target.value });
                            if (e.target.value !== 'custom') {
                                handleLoadDefault(e.target.value);
                            }
                        }}
                    >
                        {templateCategories.map(category => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                </label>
                <textarea
                    className="w-full p-2 border rounded"
                    value={template.description}
                    onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                    rows={3}
                />
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Fields</h3>
                    <button
                        className="px-3 py-1 bg-primary text-white rounded text-sm"
                        onClick={() => setShowFieldForm(true)}
                    >
                        Add Field
                    </button>
                </div>

                {showFieldForm && (
                    <div className="border rounded p-4 mb-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Field Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={newField.name}
                                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Field Type
                                </label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={newField.type}
                                    onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                                >
                                    {fieldTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Label
                            </label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded"
                                value={newField.label}
                                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                            />
                        </div>

                        {newField.type === 'select' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Options (one per line)
                                </label>
                                <textarea
                                    className="w-full p-2 border rounded"
                                    value={newField.options.join('\n')}
                                    onChange={(e) => setNewField({
                                        ...newField,
                                        options: e.target.value.split('\n').filter(opt => opt.trim())
                                    })}
                                    rows={3}
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={newField.required}
                                    onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                                    className="mr-2"
                                />
                                Required
                            </label>
                            <button
                                className="px-3 py-1 bg-primary text-white rounded text-sm"
                                onClick={handleAddField}
                            >
                                Add Field
                            </button>
                            <button
                                className="px-3 py-1 border border-gray-300 rounded text-sm"
                                onClick={() => setShowFieldForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    {template.fields.map((field, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded">
                            <div className="flex-1">
                                <span className="font-medium">{field.label}</span>
                                <span className="text-sm text-gray-500 ml-2">({field.type})</span>
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </div>
                            <button
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleRemoveField(index)}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <button
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                    onClick={handleSubmit}
                >
                    Save Template
                </button>
            </div>
        </div>
    );
};

export default NoteTemplateForm; 