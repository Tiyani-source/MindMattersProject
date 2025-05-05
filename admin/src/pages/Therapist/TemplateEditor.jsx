import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTemplates } from '../../context/TemplateContext';

const emptyTemplate = { name: '', fields: [] };

export default function TemplateEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { clientNoteTemplates, setClientNoteTemplates, psychometricTools, setPsychometricTools } = useTemplates();
    const [tab, setTab] = useState('notes');
    const [template, setTemplate] = useState(emptyTemplate);

    // Load template for editing
    useEffect(() => {
        if (id) {
            const allTemplates = [...clientNoteTemplates, ...psychometricTools];
            const found = allTemplates.find(t => t.id === id);
            if (found) {
                setTemplate(found);
                setTab(clientNoteTemplates.some(t => t.id === id) ? 'notes' : 'psychometric');
            }
        }
    }, [id, clientNoteTemplates, psychometricTools]);

    const setTemplates = tab === 'notes' ? setClientNoteTemplates : setPsychometricTools;

    const handleSave = () => {
        if (!template.name.trim()) return;
        if (id) {
            setTemplates(prev => prev.map(t => t.id === id ? { ...template, id } : t));
        } else {
            setTemplates(prev => [...prev, { ...template, id: Date.now().toString() }]);
        }
        navigate('/clients');
    };

    return (
        <div className="p-8">
            <button onClick={() => navigate('/clients')} className="mb-6 text-indigo-600 hover:underline">&larr; Back</button>
            <h1 className="text-2xl font-bold mb-4">{id ? 'Edit Template' : 'New Template'}</h1>

            <div className="flex gap-8">
                {/* Left Column - Template Editor */}
                <div className="flex-1">
                    <div className="flex gap-2 mb-4">
                        <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium border ${tab === 'notes' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
                            onClick={() => setTab('notes')}
                        >
                            Client Note Templates
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium border ${tab === 'psychometric' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
                            onClick={() => setTab('psychometric')}
                        >
                            Psychometric Tools
                        </button>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                        <input
                            type="text"
                            className="w-full border rounded px-2 py-1"
                            value={template.name}
                            onChange={e => setTemplate({ ...template, name: e.target.value })}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fields</label>
                        {template.fields.map((field, idx) => (
                            <div key={idx} className="flex flex-col gap-2 mb-2">
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        className="border rounded px-2 py-1 flex-1"
                                        value={field.label}
                                        onChange={e => {
                                            const newFields = [...template.fields];
                                            newFields[idx].label = e.target.value;
                                            setTemplate({ ...template, fields: newFields });
                                        }}
                                        placeholder="Field Label"
                                    />
                                    <select
                                        className="border rounded px-2 py-1"
                                        value={field.type}
                                        onChange={e => {
                                            const newFields = [...template.fields];
                                            newFields[idx].type = e.target.value;
                                            if (['dropdown', 'checkbox', 'radio'].includes(e.target.value) && !newFields[idx].options) {
                                                newFields[idx].options = ['Option 1'];
                                            }
                                            setTemplate({ ...template, fields: newFields });
                                        }}
                                    >
                                        <option value="textarea">Long Text</option>
                                        <option value="short_text">Short Text</option>
                                        <option value="dropdown">Dropdown</option>
                                        <option value="checkbox">Checkbox</option>
                                        <option value="radio">Radio</option>
                                    </select>
                                    <button
                                        onClick={() => {
                                            const newFields = template.fields.filter((_, i) => i !== idx);
                                            setTemplate({ ...template, fields: newFields });
                                        }}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                                        type="button"
                                    >
                                        &times;
                                    </button>
                                </div>
                                {['dropdown', 'checkbox', 'radio'].includes(field.type) && (
                                    <div className="pl-4 flex flex-col gap-1">
                                        {field.options && field.options.map((opt, oidx) => (
                                            <div key={oidx} className="flex gap-2 items-center">
                                                <input
                                                    type="text"
                                                    className="border rounded px-2 py-1 flex-1"
                                                    value={opt}
                                                    onChange={e => {
                                                        const newFields = [...template.fields];
                                                        newFields[idx].options[oidx] = e.target.value;
                                                        setTemplate({ ...template, fields: newFields });
                                                    }}
                                                    placeholder={`Option ${oidx + 1}`}
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newFields = [...template.fields];
                                                        newFields[idx].options = newFields[idx].options.filter((_, i) => i !== oidx);
                                                        setTemplate({ ...template, fields: newFields });
                                                    }}
                                                    className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                                                    type="button"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => {
                                                const newFields = [...template.fields];
                                                if (!newFields[idx].options) newFields[idx].options = [];
                                                newFields[idx].options.push(`Option ${newFields[idx].options.length + 1}`);
                                                setTemplate({ ...template, fields: newFields });
                                            }}
                                            className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-xs mt-1"
                                            type="button"
                                        >
                                            + Add Option
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={() => setTemplate({ ...template, fields: [...template.fields, { label: '', type: 'textarea' }] })}
                            className="mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-sm"
                            type="button"
                        >
                            + Add Field
                        </button>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => navigate('/clients')}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Save Template
                        </button>
                    </div>
                </div>

                {/* Right Column - Live Preview */}
                <div className="flex-1">
                    <div className="sticky top-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">Live Preview</h2>
                            <form className="space-y-4">
                                {template.fields.map((field, idx) => (
                                    <div key={idx}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                                        {field.type === 'textarea' && (
                                            <textarea
                                                className="w-full border rounded px-2 py-1"
                                                disabled
                                                placeholder="Long text..."
                                                rows={3}
                                            />
                                        )}
                                        {field.type === 'short_text' && (
                                            <input
                                                className="w-full border rounded px-2 py-1"
                                                disabled
                                                placeholder="Short text..."
                                            />
                                        )}
                                        {['dropdown', 'radio'].includes(field.type) && (
                                            <select className="w-full border rounded px-2 py-1" disabled>
                                                {field.options && field.options.map((opt, oidx) => (
                                                    <option key={oidx}>{opt}</option>
                                                ))}
                                            </select>
                                        )}
                                        {field.type === 'checkbox' && field.options && (
                                            <div className="flex flex-col gap-2">
                                                {field.options.map((opt, oidx) => (
                                                    <label key={oidx} className="flex items-center gap-2">
                                                        <input type="checkbox" disabled />
                                                        <span>{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}