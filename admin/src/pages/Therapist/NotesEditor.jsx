import React, { useState } from 'react';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Type,
    Save,
    X
} from 'lucide-react';

const noteTemplates = [
    {
        id: 'cbt',
        name: 'CBT Formulation',
        fields: [
            { id: 'presenting_problem', label: 'Presenting Problem', type: 'text' },
            { id: 'core_beliefs', label: 'Core Beliefs', type: 'text' },
            { id: 'automatic_thoughts', label: 'Automatic Thoughts', type: 'text' },
            { id: 'emotional_response', label: 'Emotional Response', type: 'text' },
            { id: 'behavioral_response', label: 'Behavioral Response', type: 'text' }
        ]
    },
    {
        id: 'mental_status',
        name: 'Mental Status Exam',
        fields: [
            { id: 'appearance', label: 'Appearance', type: 'text' },
            { id: 'mood', label: 'Mood', type: 'text' },
            { id: 'affect', label: 'Affect', type: 'text' },
            { id: 'thought_process', label: 'Thought Process', type: 'text' },
            { id: 'thought_content', label: 'Thought Content', type: 'text' },
            { id: 'cognition', label: 'Cognition', type: 'text' }
        ]
    }
];

const NotesEditor = ({ onSave, onCancel }) => {
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [content, setContent] = useState('');
    const [templateValues, setTemplateValues] = useState({});

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        const initialValues = {};
        template.fields.forEach(field => {
            initialValues[field.id] = '';
        });
        setTemplateValues(initialValues);
    };

    const handleTemplateValueChange = (fieldId, value) => {
        setTemplateValues(prev => ({
            ...prev,
            [fieldId]: value
        }));
    };

    const formatText = (command) => {
        document.execCommand(command, false, null);
    };

    const handleSave = () => {
        let content = '';
        if (selectedTemplate) {
            content = Object.entries(templateValues)
                .map(([label, value]) => `${label}: ${value}`)
                .join('\n');
        } else {
            content = content;
        }
        onSave({
            content,
            fields: templateValues,
            templateId: selectedTemplate?.id,
            templateName: selectedTemplate?.name,
            appointmentId: null,
            date: new Date().toISOString().split('T')[0],
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">New Note</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={onCancel}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Select Template</h3>
                <div className="flex flex-wrap gap-2">
                    {noteTemplates.map(template => (
                        <button
                            key={template.id}
                            onClick={() => handleTemplateSelect(template)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedTemplate?.id === template.id
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {template.name}
                        </button>
                    ))}
                    <button
                        onClick={() => setSelectedTemplate(null)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${!selectedTemplate
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        General Note
                    </button>
                </div>
            </div>

            {selectedTemplate ? (
                <div className="space-y-4">
                    {selectedTemplate.fields.map(field => (
                        <div key={field.id}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {field.label}
                            </label>
                            <textarea
                                value={templateValues[field.id] || ''}
                                onChange={(e) => handleTemplateValueChange(field.id, e.target.value)}
                                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                rows={3}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div>
                    <div className="border rounded-lg mb-4">
                        <div className="border-b p-2 flex space-x-2">
                            <button
                                onClick={() => formatText('bold')}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Bold"
                            >
                                <Bold size={16} />
                            </button>
                            <button
                                onClick={() => formatText('italic')}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Italic"
                            >
                                <Italic size={16} />
                            </button>
                            <button
                                onClick={() => formatText('insertUnorderedList')}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Bullet List"
                            >
                                <List size={16} />
                            </button>
                            <button
                                onClick={() => formatText('insertOrderedList')}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Numbered List"
                            >
                                <ListOrdered size={16} />
                            </button>
                            <button
                                onClick={() => formatText('formatBlock')}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Heading 1"
                            >
                                <Heading1 size={16} />
                            </button>
                            <button
                                onClick={() => formatText('formatBlock')}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Heading 2"
                            >
                                <Heading2 size={16} />
                            </button>
                            <button
                                onClick={() => formatText('formatBlock')}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Heading 3"
                            >
                                <Heading3 size={16} />
                            </button>
                        </div>
                        <div
                            contentEditable
                            className="p-4 min-h-[200px] focus:outline-none"
                            onInput={(e) => setContent(e.target.innerHTML)}
                        />
                    </div>
                </div>
            )}

            <div className="flex justify-end mt-6">
                <button
                    onClick={handleSave}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                >
                    <Save size={16} />
                    <span>Save Note</span>
                </button>
            </div>
        </div>
    );
};

export default NotesEditor; 