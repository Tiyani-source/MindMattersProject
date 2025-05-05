import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Calendar,
    Clock,
    FileText,
    ChevronDown,
    ChevronUp,
    Plus,
    Edit2,
    Trash2,
    Tag,
    X
} from 'lucide-react';
import NoteList from '../../components/NoteList';
import NoteEditor from '../../components/NoteEditor';
import { useTemplates } from '../../context/TemplateContext';

// Dummy data for a specific client's sessions
const dummySessions = [
    {
        id: 1,
        date: '2024-03-15',
        time: '10:00 AM',
        type: 'Online',
        status: 'Completed',
        notes: {
            type: 'CBT Formulation',
            content: 'Initial assessment completed. Identified core beliefs about self-worth and perfectionism. Client reported significant anxiety in academic settings.'
        }
    },
    {
        id: 2,
        date: '2024-03-08',
        time: '11:00 AM',
        type: 'In-person',
        status: 'Completed',
        notes: {
            type: 'Progress Note',
            content: 'Client showed improvement in recognizing automatic thoughts. Practiced grounding techniques.'
        }
    },
    {
        id: 3,
        date: '2024-03-22',
        time: '10:00 AM',
        type: 'Online',
        status: 'Scheduled',
        notes: null
    }
];

// Dummy data for client notes
const dummyNotes = [
    {
        _id: 1,
        content: 'Initial assessment completed. Identified core beliefs about self-worth and perfectionism.',
        templateUsed: 'CBT Formulation',
        createdAt: '2024-03-15T10:00:00Z',
        pinned: false,
        appointmentID: {
            date: '2024-03-15',
            time: '10:00 AM'
        }
    },
    {
        _id: 2,
        content: 'Client showed improvement in recognizing automatic thoughts.',
        templateUsed: 'Progress Note',
        createdAt: '2024-03-08T11:00:00Z',
        pinned: true,
        appointmentID: {
            date: '2024-03-08',
            time: '11:00 AM'
        }
    }
];

// Dummy note templates for use in NoteEditor
const dummyTemplates = [
    {
        id: 'cbt',
        name: 'CBT Formulation (Detailed)',
        fields: [
            { id: 'presenting_problem', label: 'Presenting Problem', type: 'textarea' },
            { id: 'precipitating_factors', label: 'Precipitating Factors', type: 'textarea' },
            { id: 'predisposing_factors', label: 'Predisposing Factors', type: 'textarea' },
            { id: 'protective_factors', label: 'Protective Factors', type: 'textarea' },
            { id: 'core_beliefs', label: 'Core Beliefs', type: 'textarea' },
            { id: 'intermediate_beliefs', label: 'Intermediate Beliefs', type: 'textarea' },
            { id: 'automatic_thoughts', label: 'Automatic Thoughts', type: 'textarea' },
            { id: 'emotional_response', label: 'Emotional Response', type: 'textarea' },
            { id: 'behavioral_response', label: 'Behavioral Response', type: 'textarea' },
            { id: 'coping_strategies', label: 'Coping Strategies', type: 'textarea' },
            { id: 'homework', label: 'Homework Assigned', type: 'textarea' },
            { id: 'next_steps', label: 'Next Steps', type: 'textarea' }
        ]
    },
    {
        id: 'history',
        name: 'History Taking (Psychiatric)',
        fields: [
            { id: 'presenting_complaint', label: 'Presenting Complaint', type: 'textarea' },
            { id: 'history_present_illness', label: 'History of Present Illness', type: 'textarea' },
            { id: 'past_psychiatric_history', label: 'Past Psychiatric History', type: 'textarea' },
            { id: 'medical_history', label: 'Medical History', type: 'textarea' },
            { id: 'family_history', label: 'Family History', type: 'textarea' },
            { id: 'personal_history', label: 'Personal History', type: 'textarea' },
            { id: 'substance_use', label: 'Substance Use', type: 'textarea' },
            { id: 'mental_status', label: 'Mental Status Examination', type: 'textarea' },
            { id: 'risk_assessment', label: 'Risk Assessment', type: 'textarea' },
            { id: 'formulation', label: 'Formulation', type: 'textarea' },
            { id: 'treatment_plan', label: 'Treatment Plan', type: 'textarea' }
        ]
    },
    {
        id: 'act',
        name: 'ACT (Acceptance and Commitment Therapy)',
        fields: [
            { id: 'values', label: 'Values', type: 'textarea' },
            { id: 'committed_action', label: 'Committed Action', type: 'textarea' },
            { id: 'acceptance', label: 'Acceptance', type: 'textarea' },
            { id: 'cognitive_defusion', label: 'Cognitive Defusion', type: 'textarea' },
            { id: 'self_as_context', label: 'Self-as-Context', type: 'textarea' },
            { id: 'present_moment', label: 'Contact with Present Moment', type: 'textarea' },
            { id: 'barriers', label: 'Barriers/Obstacles', type: 'textarea' }
        ]
    },
    {
        id: 'das',
        name: 'DAS (Dysfunctional Attitude Scale)',
        fields: [
            { id: 'das_score', label: 'Total DAS Score', type: 'short_text' },
            { id: 'perfectionism', label: 'Perfectionism (1-7)', type: 'short_text' },
            { id: 'approval', label: 'Need for Approval (1-7)', type: 'short_text' },
            { id: 'love', label: 'Love/Relationships (1-7)', type: 'short_text' },
            { id: 'achievement', label: 'Achievement (1-7)', type: 'short_text' },
            { id: 'summary', label: 'Summary/Comments', type: 'textarea' }
        ]
    },
    {
        id: 'phq9',
        name: 'PHQ-9 (Depression Questionnaire)',
        fields: [
            { id: 'q1', label: 'Little interest or pleasure in doing things', type: 'short_text' },
            { id: 'q2', label: 'Feeling down, depressed, or hopeless', type: 'short_text' },
            { id: 'q3', label: 'Trouble falling/staying asleep, or sleeping too much', type: 'short_text' },
            { id: 'q4', label: 'Feeling tired or having little energy', type: 'short_text' },
            { id: 'q5', label: 'Poor appetite or overeating', type: 'short_text' },
            { id: 'q6', label: 'Feeling bad about yourself', type: 'short_text' },
            { id: 'q7', label: 'Trouble concentrating', type: 'short_text' },
            { id: 'q8', label: 'Moving or speaking slowly/being fidgety', type: 'short_text' },
            { id: 'q9', label: 'Thoughts of self-harm', type: 'short_text' },
            { id: 'phq9_total', label: 'PHQ-9 Total Score', type: 'short_text' }
        ]
    },
    {
        id: 'gad7',
        name: 'GAD-7 (Anxiety Questionnaire)',
        fields: [
            { id: 'q1', label: 'Feeling nervous, anxious, or on edge', type: 'short_text' },
            { id: 'q2', label: 'Not being able to stop or control worrying', type: 'short_text' },
            { id: 'q3', label: 'Worrying too much about different things', type: 'short_text' },
            { id: 'q4', label: 'Trouble relaxing', type: 'short_text' },
            { id: 'q5', label: 'Being so restless it is hard to sit still', type: 'short_text' },
            { id: 'q6', label: 'Becoming easily annoyed or irritable', type: 'short_text' },
            { id: 'q7', label: 'Feeling afraid as if something awful might happen', type: 'short_text' },
            { id: 'gad7_total', label: 'GAD-7 Total Score', type: 'short_text' }
        ]
    },
    {
        id: 'progress',
        name: 'Progress Note',
        fields: [
            { id: 'progress', label: 'Progress', type: 'textarea' },
            { id: 'challenges', label: 'Challenges', type: 'textarea' },
            { id: 'next_steps', label: 'Next Steps', type: 'textarea' }
        ]
    }
];

const ClientDetail = () => {
    const { id } = useParams();
    const [expandedSession, setExpandedSession] = useState(null);
    const [showNoteEditor, setShowNoteEditor] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [notes, setNotes] = useState(dummyNotes);
    const [searchQuery, setSearchQuery] = useState('');
    const [clientStatus, setClientStatus] = useState('Ongoing');
    const [clientGoals, setClientGoals] = useState(['Anxiety Management', 'Self-Esteem']);
    const [showGoalInput, setShowGoalInput] = useState(false);
    const [newGoal, setNewGoal] = useState('');

    const { psychometricTools, clientNoteTemplates } = useTemplates();

    const handleAddNote = (note) => {
        const newNote = {
            _id: Date.now(),
            content: note.content || '',
            templateUsed: note.templateName || note.type || '',
            fields: note.fields || null,
            createdAt: new Date().toISOString(),
            pinned: false,
            appointmentID: note.appointmentID || null
        };
        setNotes([...notes, newNote]);
        setShowNoteEditor(false);
    };

    const handleEditNote = (note) => {
        setEditingNote(note);
        setShowNoteEditor(true);
    };

    const handleUpdateNote = (updatedNote) => {
        setNotes(notes.map(note =>
            note._id === editingNote._id
                ? {
                    ...note,
                    content: updatedNote.content || '',
                    templateUsed: updatedNote.templateName || updatedNote.type || '',
                    fields: updatedNote.fields || null
                }
                : note
        ));
        setShowNoteEditor(false);
        setEditingNote(null);
    };

    const handleDeleteNote = (noteId) => {
        setNotes(notes.filter(note => note._id !== noteId));
    };

    const handlePinNote = (noteId, pinned) => {
        setNotes(notes.map(note =>
            note._id === noteId ? { ...note, pinned } : note
        ));
    };

    const handleAddGoal = () => {
        if (newGoal.trim()) {
            setClientGoals([...clientGoals, newGoal.trim()]);
            setNewGoal('');
            setShowGoalInput(false);
        }
    };

    const handleRemoveGoal = (goalToRemove) => {
        setClientGoals(clientGoals.filter(goal => goal !== goalToRemove));
    };

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm p-6 mt-5 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Client Details</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Sarah Johnson</h2>
                            <p className="text-gray-600">University of Colombo</p>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        value={clientStatus}
                                        onChange={(e) => setClientStatus(e.target.value)}
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Ongoing">Ongoing</option>
                                        <option value="Goal Setting">Goal Setting</option>
                                        <option value="Archived">Archived</option>
                                        <option value="Terminated">Terminated</option>
                                    </select>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-700">Goals</label>
                                        <button
                                            onClick={() => setShowGoalInput(!showGoalInput)}
                                            className="text-indigo-600 hover:text-indigo-800"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {clientGoals.map((goal, index) => (
                                            <div
                                                key={index}
                                                className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                            >
                                                <span>{goal}</span>
                                                <button
                                                    onClick={() => handleRemoveGoal(goal)}
                                                    className="text-indigo-600 hover:text-indigo-800"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    {showGoalInput && (
                                        <div className="mt-2 flex gap-2">
                                            <input
                                                type="text"
                                                value={newGoal}
                                                onChange={(e) => setNewGoal(e.target.value)}
                                                placeholder="Add new goal..."
                                                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <button
                                                onClick={handleAddGoal}
                                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center text-gray-600">
                                <Calendar size={16} className="mr-2" />
                                <span>Next session: March 22, 2024</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Clock size={16} className="mr-2" />
                                <span>Total sessions: 8</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Session Timeline</h2>

                    <div className="space-y-4">
                        {dummySessions.map((session) => (
                            <div
                                key={session.id}
                                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <Calendar size={24} className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-800">
                                                {new Date(session.date).toLocaleDateString()} at {session.time}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {session.type} Session • {session.status}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                                        className="text-indigo-600 hover:text-indigo-800"
                                    >
                                        {expandedSession === session.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                </div>

                                {expandedSession === session.id && (
                                    <div className="mt-4 pt-4 border-t">
                                        {session.notes ? (
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                                            {session.notes.type}
                                                        </span>
                                                        <p className="mt-2 text-gray-700">{session.notes.content}</p>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button className="text-gray-500 hover:text-gray-700">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button className="text-gray-500 hover:text-red-600">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <button
                                                    onClick={() => setShowNoteEditor(true)}
                                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                                                >
                                                    <Plus size={16} />
                                                    <span>Add Note</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Client Notes</h2>
                        <button
                            onClick={() => setShowNoteEditor(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                        >
                            <Plus size={16} />
                            <span>Add Note</span>
                        </button>
                    </div>

                    <NoteList
                        notes={notes}
                        onPinNote={handlePinNote}
                        onDeleteNote={handleDeleteNote}
                        onEditNote={handleEditNote}
                        searchQuery={searchQuery}
                    />
                </div>
            </div>

            {showNoteEditor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl">
                        <NoteEditor
                            onSave={editingNote ? handleUpdateNote : handleAddNote}
                            onCancel={() => {
                                setShowNoteEditor(false);
                                setEditingNote(null);
                            }}
                            initialContent={editingNote?.content}
                            isEditing={!!editingNote}
                            template={editingNote && editingNote.fields ? clientNoteTemplates.find(t => t.name === editingNote.templateUsed) : null}
                            templates={clientNoteTemplates}
                            psychometricTools={psychometricTools}
                            clientNoteTemplates={clientNoteTemplates}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientDetail; 