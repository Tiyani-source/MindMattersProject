import React, { useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

const TemplateSelector = ({
    templates,
    onSelectTemplate,
    onAddTemplate,
    onDeleteTemplate
}) => {
    const [showAddTemplate, setShowAddTemplate] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [newTemplateContent, setNewTemplateContent] = useState('');

    const handleAddTemplate = () => {
        if (newTemplateName && newTemplateContent) {
            onAddTemplate({
                name: newTemplateName,
                content: newTemplateContent
            });
            setNewTemplateName('');
            setNewTemplateContent('');
            setShowAddTemplate(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Note Templates</h3>
                <button
                    onClick={() => setShowAddTemplate(!showAddTemplate)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-dark"
                >
                    <FaPlus /> Add Template
                </button>
            </div>

            {showAddTemplate && (
                <div className="p-4 border rounded-lg space-y-4">
                    <input
                        type="text"
                        placeholder="Template Name"
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                    />
                    <textarea
                        placeholder="Template Content"
                        value={newTemplateContent}
                        onChange={(e) => setNewTemplateContent(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                        rows={4}
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setShowAddTemplate(false)}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddTemplate}
                            className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-dark"
                        >
                            Save Template
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {templates.map((template) => (
                    <div
                        key={template._id}
                        className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50"
                    >
                        <button
                            onClick={() => onSelectTemplate(template)}
                            className="flex-1 text-left"
                        >
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">
                                {template.content}
                            </p>
                        </button>
                        <button
                            onClick={() => onDeleteTemplate(template._id)}
                            className="p-2 text-gray-400 rounded-full hover:text-red-600"
                        >
                            <FaTrash />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TemplateSelector; 