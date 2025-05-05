import React, { useState, useEffect } from 'react';
import TemplateBuilder from './TemplateBuilder';
import { FaPlus, FaEdit, FaTrash, FaClone } from 'react-icons/fa';
import { useTemplates } from '../../context/TemplateContext';

const LOCAL_KEY = 'therapist_note_templates';

function loadTemplates() {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
    } catch {
        return [];
    }
}
function saveTemplates(templates) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(templates));
}

export default function TemplateManager({ onSelectTemplate }) {

    const [showBuilder, setShowBuilder] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [cloneMode, setCloneMode] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [templateType, setTemplateType] = useState('notes'); // 'notes' or 'psychometric'
    const [templateEditName, setTemplateEditName] = useState('');
    const [templateEditFields, setTemplateEditFields] = useState([]);

    const { psychometricTools, setPsychometricTools, clientNoteTemplates, setClientNoteTemplates } = useTemplates();

    const templates = templateType === 'notes' ? clientNoteTemplates : psychometricTools;
    const setTemplates = templateType === 'notes' ? setClientNoteTemplates : setPsychometricTools;

    useEffect(() => {
        const loaded = loadTemplates();
        if (loaded.length > 0) setTemplates(loaded);
    }, []);

    const handleSave = (template) => {
        let newTemplates;
        if (editingTemplate && !cloneMode) {
            // Edit
            newTemplates = templates.map(t => t === editingTemplate ? { ...template, id: editingTemplate.id } : t);
        } else {
            // New or Clone
            newTemplates = [
                ...templates,
                { ...template, id: Date.now().toString() }
            ];
        }
        setTemplates(newTemplates);
        saveTemplates(newTemplates);
        setShowBuilder(false);
        setEditingTemplate(null);
        setCloneMode(false);
    };

    const handleDelete = (id) => {
        if (!window.confirm('Delete this template?')) return;
        const newTemplates = templates.filter(t => t.id !== id);
        setTemplates(newTemplates);
        saveTemplates(newTemplates);
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setShowBuilder(true);
        setCloneMode(false);
    };

    const handleClone = (template) => {
        setEditingTemplate(template);
        setShowBuilder(true);
        setCloneMode(true);
    };

    const handleCreate = () => {
        setEditingTemplate(null);
        setShowBuilder(true);
        setCloneMode(false);
    };

    const openAddTemplate = () => {
        setEditingTemplate(null);
        setTemplateEditName('');
        setTemplateEditFields([]);
        setShowTemplateModal(true);
    };

    const openEditTemplate = (tpl) => {
        setEditingTemplate(tpl);
        setTemplateEditName(tpl.name);
        setTemplateEditFields(tpl.fields.map(f => ({ ...f })));
        setShowTemplateModal(true);
    };

    const handleSaveTemplate = () => {
        if (!templateEditName.trim() || templateEditFields.length === 0) return;
        const newTemplate = {
            id: editingTemplate ? editingTemplate.id : Date.now().toString(),
            name: templateEditName,
            fields: templateEditFields.map(f => ({ ...f, id: f.id || Date.now() + Math.random() }))
        };
        setTemplates(prev =>
            editingTemplate
                ? prev.map(t => t.id === editingTemplate.id ? newTemplate : t)
                : [...prev, newTemplate]
        );
        setShowTemplateModal(false);
    };

    const handleDeleteTemplate = (id) => {
        setTemplates(prev => prev.filter(t => t.id !== id));
        if (editingTemplate && editingTemplate.id === id) setEditingTemplate(null);
    };

    const handleAddField = () => {
        setTemplateEditFields(fields => [...fields, { id: Date.now(), label: '', type: 'textarea' }]);
    };

    const handleFieldChange = (idx, key, value) => {
        setTemplateEditFields(fields => fields.map((f, i) => i === idx ? { ...f, [key]: value } : f));
    };

    const handleRemoveField = (idx) => {
        setTemplateEditFields(fields => fields.filter((_, i) => i !== idx));
    };

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Note Templates</h1>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" onClick={handleCreate}>
                    <FaPlus /> New Template
                </button>
            </div>
            {templates.length === 0 && <div className="text-gray-400 mb-8">No templates yet. Create your first template!</div>}
            <ul className="space-y-4 mb-10">
                {templates.map(template => (
                    <li key={template.id} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                            <div className="font-semibold text-lg">{template.name}</div>
                            <div className="text-gray-500 text-sm mb-2">{template.description}</div>
                            <div className="text-xs text-gray-400">{template.fields.length} fields</div>
                        </div>
                        <div className="flex gap-2 mt-2 md:mt-0">
                            <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50 flex items-center gap-1" onClick={() => onSelectTemplate && onSelectTemplate(template)}>
                                Use
                            </button>
                            <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50 flex items-center gap-1" onClick={() => handleEdit(template)}>
                                <FaEdit /> Edit
                            </button>
                            <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50 flex items-center gap-1" onClick={() => handleClone(template)}>
                                <FaClone /> Clone
                            </button>
                            <button className="px-3 py-1 text-sm border rounded hover:bg-red-50 text-red-600 flex items-center gap-1" onClick={() => handleDelete(template.id)}>
                                <FaTrash /> Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            {showBuilder && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="w-full max-w-3xl">
                        <TemplateBuilder
                            initialTemplate={editingTemplate}
                            onSave={handleSave}
                            onCancel={() => { setShowBuilder(false); setEditingTemplate(null); setCloneMode(false); }}
                        />
                    </div>
                </div>
            )}
            {showTemplateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
                        <button
                            onClick={() => setShowTemplateModal(false)}
                            className="absolute top-3 right-3 p-2 text-gray-500 hover:text-gray-700"
                            aria-label="Close"
                        >
                            <FaTrash />
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
                                        onChange={e => handleFieldChange(idx, 'label', e.target.value)}
                                        placeholder="Field Label"
                                    />
                                    <select
                                        className="border rounded px-2 py-1"
                                        value={field.type}
                                        onChange={e => handleFieldChange(idx, 'type', e.target.value)}
                                    >
                                        <option value="textarea">Long Text</option>
                                        <option value="short_text">Short Text</option>
                                        <option value="dropdown">Dropdown</option>
                                        <option value="checkbox">Checkbox</option>
                                        <option value="radio">Radio</option>
                                        <option value="date">Date</option>
                                        <option value="number">Number</option>
                                    </select>
                                    <button
                                        onClick={() => handleRemoveField(idx)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                                        type="button"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={handleAddField}
                                className="mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-sm"
                                type="button"
                            >
                                <FaPlus className="inline mr-1" /> Add Field
                            </button>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowTemplateModal(false)}
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
} 