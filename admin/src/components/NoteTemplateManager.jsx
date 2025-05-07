import React, { useState } from 'react';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

const NoteTemplateManager = ({
    templates,
    onAddTemplate,
    onEditTemplate,
    onDeleteTemplate,
    onSelectTemplate
}) => {
    const [showForm, setShowForm] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [templateContent, setTemplateContent] = useState('');
    const [editingTemplate, setEditingTemplate] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingTemplate) {
            onEditTemplate(editingTemplate._id, {
                name: templateName,
                content: templateContent
            });
        } else {
            onAddTemplate({
                name: templateName,
                content: templateContent
            });
        }
        setShowForm(false);
        setTemplateName('');
        setTemplateContent('');
        setEditingTemplate(null);
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setTemplateName(template.name);
        setTemplateContent(template.content);
        setShowForm(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Note Templates</h3>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                    <FaPlus /> New Template
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingTemplate ? 'Edit Template' : 'New Template'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Template Name
                                </label>
                                <input
                                    type="text"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    className="w-full p-2 border rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Template Content
                                </label>
                                <textarea
                                    value={templateContent}
                                    onChange={(e) => setTemplateContent(e.target.value)}
                                    className="w-full p-2 border rounded-lg h-40"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setTemplateName('');
                                        setTemplateContent('');
                                        setEditingTemplate(null);
                                    }}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                >
                                    {editingTemplate ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                    <div
                        key={template._id}
                        className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{template.name}</h4>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(template)}
                                    className="p-2 text-gray-400 rounded-full hover:text-primary"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={() => onDeleteTemplate(template._id)}
                                    className="p-2 text-gray-400 rounded-full hover:text-red-500"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {template.content}
                        </p>
                        <button
                            onClick={() => onSelectTemplate(template)}
                            className="w-full py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white"
                        >
                            Use Template
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NoteTemplateManager; 