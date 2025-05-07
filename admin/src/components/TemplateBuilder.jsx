import React, { useState } from 'react';
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const FIELD_TYPES = [
    { value: 'short_text', label: 'Short Text' },
    { value: 'long_text', label: 'Long Text' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox Group' },
    { value: 'radio', label: 'Radio Group' },
    { value: 'date', label: 'Date Picker' },
    { value: 'section', label: 'Section Header' },
];

const emptyField = {
    label: '',
    type: 'short_text',
    required: false,
    options: [],
};

export default function TemplateBuilder({
    initialTemplate = null,
    onSave,
    onCancel,
}) {
    const [templateName, setTemplateName] = useState(initialTemplate?.name || '');
    const [templateDescription, setTemplateDescription] = useState(initialTemplate?.description || '');
    const [fields, setFields] = useState(initialTemplate?.fields || []);
    const [editingFieldIdx, setEditingFieldIdx] = useState(null);
    const [fieldDraft, setFieldDraft] = useState(emptyField);
    const [showFieldEditor, setShowFieldEditor] = useState(false);

    // --- Field Operations ---
    const startAddField = () => {
        setFieldDraft({ ...emptyField });
        setEditingFieldIdx(null);
        setShowFieldEditor(true);
    };
    const startEditField = (idx) => {
        setFieldDraft({ ...fields[idx] });
        setEditingFieldIdx(idx);
        setShowFieldEditor(true);
    };
    const saveField = () => {
        if (!fieldDraft.label.trim()) return;
        let newFields = [...fields];
        if (editingFieldIdx !== null) {
            newFields[editingFieldIdx] = { ...fieldDraft };
        } else {
            newFields.push({ ...fieldDraft });
        }
        setFields(newFields);
        setShowFieldEditor(false);
        setFieldDraft(emptyField);
        setEditingFieldIdx(null);
    };
    const removeField = (idx) => {
        setFields(fields.filter((_, i) => i !== idx));
    };
    const moveField = (idx, dir) => {
        const newFields = [...fields];
        const [removed] = newFields.splice(idx, 1);
        newFields.splice(idx + dir, 0, removed);
        setFields(newFields);
    };

    // --- Field Editor ---
    const handleFieldTypeChange = (type) => {
        setFieldDraft((prev) => ({
            ...prev,
            type,
            options: ['dropdown', 'checkbox', 'radio'].includes(type) ? ['Option 1'] : [],
        }));
    };
    const handleOptionChange = (idx, value) => {
        setFieldDraft((prev) => {
            const options = [...prev.options];
            options[idx] = value;
            return { ...prev, options };
        });
    };
    const addOption = () => {
        setFieldDraft((prev) => ({ ...prev, options: [...prev.options, `Option ${prev.options.length + 1}`] }));
    };
    const removeOption = (idx) => {
        setFieldDraft((prev) => ({ ...prev, options: prev.options.filter((_, i) => i !== idx) }));
    };

    // --- Save Template ---
    const handleSaveTemplate = () => {
        if (!templateName.trim() || fields.length === 0) return;
        onSave && onSave({
            name: templateName,
            description: templateDescription,
            fields,
        });
    };

    // --- Live Preview ---
    const renderFieldPreview = (field, idx) => {
        switch (field.type) {
            case 'short_text':
                return <input type="text" className="w-full border rounded px-2 py-1" placeholder={field.label} disabled />;
            case 'long_text':
                return <textarea className="w-full border rounded px-2 py-1" placeholder={field.label} disabled />;
            case 'dropdown':
                return (
                    <select className="w-full border rounded px-2 py-1" disabled>
                        {field.options.map((opt, i) => <option key={i}>{opt}</option>)}
                    </select>
                );
            case 'checkbox':
                return field.options.map((opt, i) => (
                    <label key={i} className="mr-4">
                        <input type="checkbox" disabled /> {opt}
                    </label>
                ));
            case 'radio':
                return field.options.map((opt, i) => (
                    <label key={i} className="mr-4">
                        <input type="radio" name={`radio_${idx}`} disabled /> {opt}
                    </label>
                ));
            case 'date':
                return <input type="date" className="w-full border rounded px-2 py-1" disabled />;
            case 'section':
                return <div className="font-semibold text-gray-700 text-md py-2">{field.label}</div>;
            default:
                return null;
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-bold mb-4">Template Builder</h2>
            <div className="mb-6">
                <label className="block font-medium mb-1">Template Name</label>
                <input
                    className="w-full border rounded px-3 py-2 mb-2"
                    value={templateName}
                    onChange={e => setTemplateName(e.target.value)}
                    placeholder="e.g. CBT Formulation"
                />
                <label className="block font-medium mb-1">Description</label>
                <textarea
                    className="w-full border rounded px-3 py-2"
                    value={templateDescription}
                    onChange={e => setTemplateDescription(e.target.value)}
                    placeholder="Describe this template..."
                />
            </div>
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Fields</h3>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" onClick={startAddField}>
                        <FaPlus /> Add Field
                    </button>
                </div>
                {fields.length === 0 && <div className="text-gray-400">No fields yet. Add your first field!</div>}
                <ul className="space-y-2">
                    {fields.map((field, idx) => (
                        <li key={idx} className="flex items-center bg-gray-50 rounded p-3">
                            <div className="flex-1">
                                <span className="font-medium">{field.label}</span>
                                <span className="ml-2 text-xs text-gray-500">[{FIELD_TYPES.find(t => t.value === field.type)?.label}]</span>
                                {field.required && <span className="ml-2 text-xs text-red-500">*required</span>}
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => moveField(idx, -1)} disabled={idx === 0} className="p-1 text-gray-500 hover:text-indigo-600 disabled:opacity-30"><FaArrowUp /></button>
                                <button onClick={() => moveField(idx, 1)} disabled={idx === fields.length - 1} className="p-1 text-gray-500 hover:text-indigo-600 disabled:opacity-30"><FaArrowDown /></button>
                                <button onClick={() => startEditField(idx)} className="p-1 text-gray-500 hover:text-indigo-600"><FaEdit /></button>
                                <button onClick={() => removeField(idx)} className="p-1 text-red-500 hover:text-red-700"><FaTrash /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            {/* Field Editor Modal */}
            {showFieldEditor && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowFieldEditor(false)}><FaTimes /></button>
                        <h4 className="text-lg font-semibold mb-4">{editingFieldIdx !== null ? 'Edit Field' : 'Add Field'}</h4>
                        <div className="mb-3">
                            <label className="block font-medium mb-1">Label</label>
                            <input className="w-full border rounded px-3 py-2" value={fieldDraft.label} onChange={e => setFieldDraft(f => ({ ...f, label: e.target.value }))} />
                        </div>
                        <div className="mb-3">
                            <label className="block font-medium mb-1">Type</label>
                            <select className="w-full border rounded px-3 py-2" value={fieldDraft.type} onChange={e => handleFieldTypeChange(e.target.value)}>
                                {FIELD_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
                            </select>
                        </div>
                        {['dropdown', 'checkbox', 'radio'].includes(fieldDraft.type) && (
                            <div className="mb-3">
                                <label className="block font-medium mb-1">Options</label>
                                {fieldDraft.options.map((opt, i) => (
                                    <div key={i} className="flex gap-2 mb-1">
                                        <input className="flex-1 border rounded px-2 py-1" value={opt} onChange={e => handleOptionChange(i, e.target.value)} />
                                        <button className="text-red-500 hover:text-red-700" onClick={() => removeOption(i)} type="button"><FaTrash /></button>
                                    </div>
                                ))}
                                <button className="mt-1 px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded" type="button" onClick={addOption}><FaPlus /> Add Option</button>
                            </div>
                        )}
                        {fieldDraft.type !== 'section' && (
                            <div className="mb-3 flex items-center gap-2">
                                <input type="checkbox" checked={fieldDraft.required} onChange={e => setFieldDraft(f => ({ ...f, required: e.target.checked }))} id="required" />
                                <label htmlFor="required" className="text-sm">Required</label>
                            </div>
                        )}
                        <div className="flex justify-end gap-2 mt-4">
                            <button className="px-4 py-2 border rounded hover:bg-gray-50" onClick={() => setShowFieldEditor(false)}>Cancel</button>
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" onClick={saveField}>{editingFieldIdx !== null ? 'Update Field' : 'Add Field'}</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Live Preview */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Live Preview</h3>
                <div className="bg-gray-50 rounded p-4 space-y-4">
                    <div className="font-bold text-xl mb-2">{templateName || 'Template Name'}</div>
                    <div className="text-gray-600 mb-4">{templateDescription || 'Template description...'}</div>
                    {fields.length === 0 && <div className="text-gray-400">No fields to preview.</div>}
                    {fields.map((field, idx) => (
                        <div key={idx} className="mb-3">
                            {renderFieldPreview(field, idx)}
                        </div>
                    ))}
                </div>
            </div>
            {/* Save/Cancel */}
            <div className="flex justify-end gap-2 mt-8">
                <button className="px-4 py-2 border rounded hover:bg-gray-50" onClick={onCancel}>Cancel</button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" onClick={handleSaveTemplate} disabled={!templateName.trim() || fields.length === 0}><FaSave className="inline mr-2" />Save Template</button>
            </div>
        </div>
    );
} 