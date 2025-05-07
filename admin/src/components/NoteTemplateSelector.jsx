import React from 'react';
import { FaPlus, FaTrash, FaCheck } from 'react-icons/fa';

const NoteTemplateSelector = ({ templates, selectedTemplate, onSelectTemplate, onCreateTemplate, onDeleteTemplate }) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Note Templates</h3>
                {onCreateTemplate && (
                    <button
                        onClick={onCreateTemplate}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                    >
                        <FaPlus /> New Template
                    </button>
                )}
            </div>
            <div className="space-y-2">
                {templates.map(template => (
                    <div
                        key={template.id}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${selectedTemplate && selectedTemplate.id === template.id ? 'bg-indigo-50 border-indigo-400' : ''}`}
                        onClick={() => onSelectTemplate(selectedTemplate && selectedTemplate.id === template.id ? null : template)}
                    >
                        <div className="flex items-center gap-2">
                            {selectedTemplate && selectedTemplate.id === template.id && (
                                <FaCheck className="text-indigo-600" />
                            )}
                            <div>
                                <h4 className="font-medium">{template.name}</h4>
                            </div>
                        </div>
                        {onDeleteTemplate && (
                            <button
                                onClick={e => { e.stopPropagation(); onDeleteTemplate(template.id); }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                            >
                                <FaTrash />
                            </button>
                        )}
                    </div>
                ))}
                {templates.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No templates created yet</p>
                )}
            </div>
        </div>
    );
};

export default NoteTemplateSelector; 