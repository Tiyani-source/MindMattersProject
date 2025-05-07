import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// // --- Psychometric Tools (full official questions, radio/number fields) ---
// const initialPsychometricTools = [
//     {
//         id: 'phq9',
//         name: 'PHQ-9 (Depression Questionnaire)',
//         fields: [
//             { id: 'q1', label: 'Little interest or pleasure in doing things', type: 'radio', options: ['0 - Not at all', '1 - Several days', '2 - More than half the days', '3 - Nearly every day'] },
//             { id: 'q2', label: 'Feeling down, depressed, or hopeless', type: 'radio', options: ['0 - Not at all', '1 - Several days', '2 - More than half the days', '3 - Nearly every day'] },
//             { id: 'q3', label: 'Trouble falling/staying asleep, or sleeping too much', type: 'radio', options: ['0 - Not at all', '1 - Several days', '2 - More than half the days', '3 - Nearly every day'] },
//             { id: 'q4', label: 'Feeling tired or having little energy', type: 'radio', options: ['0 - Not at all', '1 - Several days', '2 - More than half the days', '3 - Nearly every day'] },
//             { id: 'q5', label: 'Poor appetite or overeating', type: 'radio', options: ['0 - Not at all', '1 - Several days', '2 - More than half the days', '3 - Nearly every day'] },
//             { id: 'q6', label: 'Feeling bad about yourself', type: 'radio', options: ['0 - Not at all', '1 - Several days', '2 - More than half the days', '3 - Nearly every day'] },
//             { id: 'q7', label: 'Trouble concentrating', type: 'radio', options: ['0 - Not at all', '1 - Several days', '2 - More than half the days', '3 - Nearly every day'] },
//             { id: 'q8', label: 'Moving or speaking slowly/being fidgety', type: 'radio', options: ['0 - Not at all', '1 - Several days', '2 - More than half the days', '3 - Nearly every day'] },
//             { id: 'q9', label: 'Thoughts of self-harm', type: 'radio', options: ['0 - Not at all', '1 - Several days', '2 - More than half the days', '3 - Nearly every day'] },
//             { id: 'phq9_total', label: 'PHQ-9 Total Score', type: 'number' }
//         ]
//     },
//     {
//         id: 'gad7',
//         name: 'GAD-7 (Anxiety Questionnaire)',
//         fields: [
//             { id: 'q1', label: 'Feeling nervous, anxious, or on edge', type: 'radio', options: ['0 - Not at all', '1 - Several days', '2 - More than half the days', '3 - Nearly every day'] },
//             { id: 'q2', label: 'Not being able to stop or control worrying', type: 'radio', options: ['0 - Not at all', '1 - Several days', '2 - More than half the days', '3 - Nearly every day'] },
//             { id: 'q3', label: 'Worrying too much about different things', type: 'radio', options: ['0 - Not at all', '1 - Several days', '2 - More than half the days', '3 - Nearly every day'] },
//             { id: 'q4', label: 'Trouble relaxing', type: 'radio', options: ['0 - Not at all', '1 - Several days', '2 - More than half the days', '3 - Nearly every day'] },
//             { id: 'q5', label: 'Being so restless it is hard to sit still', type: 'radio', options: ['0 - Not at all', '1 - Several days', '2 - More than half the days', '3 - Nearly every day'] },
//             { id: 'q6', label: 'Becoming easily annoyed or irritable', type: 'radio', options: ['0 - Not at all', '1 - Several days', '2 - More than half the days', '3 - Nearly every day'] },
//             { id: 'q7', label: 'Feeling afraid as if something awful might happen', type: 'radio', options: ['0 - Not at all', '1 - Several days', '2 - More than half the days', '3 - Nearly every day'] },
//             { id: 'gad7_total', label: 'GAD-7 Total Score', type: 'number' }
//         ]
//     },
//     {
//         id: 'das',
//         name: 'DAS (Dysfunctional Attitude Scale)',
//         fields: [
//             { id: 'das_score', label: 'Total DAS Score', type: 'number' },
//             { id: 'perfectionism', label: 'Perfectionism', type: 'radio', options: ['1', '2', '3', '4', '5', '6', '7'] },
//             { id: 'approval', label: 'Need for Approval', type: 'radio', options: ['1', '2', '3', '4', '5', '6', '7'] },
//             { id: 'love', label: 'Love/Relationships', type: 'radio', options: ['1', '2', '3', '4', '5', '6', '7'] },
//             { id: 'achievement', label: 'Achievement', type: 'radio', options: ['1', '2', '3', '4', '5', '6', '7'] },
//             { id: 'summary', label: 'Summary/Comments', type: 'textarea' }
//         ]
//     }
// ];

// // --- Client Note Templates (session notes, formulations, etc) ---
// const initialClientNoteTemplates = [
//     {
//         id: 'cbt',
//         name: 'CBT Formulation (Detailed)',
//         fields: [
//             { id: 'presenting_problem', label: 'Presenting Problem', type: 'textarea' },
//             { id: 'precipitating_factors', label: 'Precipitating Factors', type: 'textarea' },
//             { id: 'predisposing_factors', label: 'Predisposing Factors', type: 'textarea' },
//             { id: 'protective_factors', label: 'Protective Factors', type: 'textarea' },
//             { id: 'core_beliefs', label: 'Core Beliefs', type: 'textarea' },
//             { id: 'intermediate_beliefs', label: 'Intermediate Beliefs', type: 'textarea' },
//             { id: 'automatic_thoughts', label: 'Automatic Thoughts', type: 'textarea' },
//             { id: 'emotional_response', label: 'Emotional Response', type: 'textarea' },
//             { id: 'behavioral_response', label: 'Behavioral Response', type: 'textarea' },
//             { id: 'coping_strategies', label: 'Coping Strategies', type: 'textarea' },
//             { id: 'homework', label: 'Homework Assigned', type: 'textarea' },
//             { id: 'next_steps', label: 'Next Steps', type: 'textarea' }
//         ]
//     },
//     {
//         id: 'history',
//         name: 'History Taking (Psychiatric)',
//         fields: [
//             { id: 'presenting_complaint', label: 'Presenting Complaint', type: 'textarea' },
//             { id: 'history_present_illness', label: 'History of Present Illness', type: 'textarea' },
//             { id: 'past_psychiatric_history', label: 'Past Psychiatric History', type: 'textarea' },
//             { id: 'medical_history', label: 'Medical History', type: 'textarea' },
//             { id: 'family_history', label: 'Family History', type: 'textarea' },
//             { id: 'personal_history', label: 'Personal History', type: 'textarea' },
//             { id: 'substance_use', label: 'Substance Use', type: 'textarea' },
//             { id: 'mental_status', label: 'Mental Status Examination', type: 'textarea' },
//             { id: 'risk_assessment', label: 'Risk Assessment', type: 'textarea' },
//             { id: 'formulation', label: 'Formulation', type: 'textarea' },
//             { id: 'treatment_plan', label: 'Treatment Plan', type: 'textarea' }
//         ]
//     },
//     {
//         id: 'act',
//         name: 'ACT (Acceptance and Commitment Therapy)',
//         fields: [
//             { id: 'values', label: 'Values', type: 'textarea' },
//             { id: 'committed_action', label: 'Committed Action', type: 'textarea' },
//             { id: 'acceptance', label: 'Acceptance', type: 'textarea' },
//             { id: 'cognitive_defusion', label: 'Cognitive Defusion', type: 'textarea' },
//             { id: 'self_as_context', label: 'Self-as-Context', type: 'textarea' },
//             { id: 'present_moment', label: 'Contact with Present Moment', type: 'textarea' },
//             { id: 'barriers', label: 'Barriers/Obstacles', type: 'textarea' }
//         ]
//     },
//     {
//         id: 'progress',
//         name: 'Progress Note',
//         fields: [
//             { id: 'progress', label: 'Progress', type: 'textarea' },
//             { id: 'challenges', label: 'Challenges', type: 'textarea' },
//             { id: 'next_steps', label: 'Next Steps', type: 'textarea' }
//         ]
//     }
// ];

const TemplateContext = createContext();

export const useTemplates = () => useContext(TemplateContext);

export const TemplateProvider = ({ children }) => {
    const [psychometricTools, setPsychometricTools] = useState([]);
    const [clientNoteTemplates, setClientNoteTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const dToken = localStorage.getItem('dToken');

    // Fetch all templates on mount, but only once
    useEffect(() => {
        if (!isInitialized && !isLoading) {
            fetchNoteTemplates();
            setIsInitialized(true);
        }
    }, [isInitialized]);

    const fetchNoteTemplates = async () => {
        if (isLoading) return; // Prevent concurrent calls

        try {
            setIsLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/therapist/note-templates`, {
                headers: { ttoken: dToken }
            });

            if (data.success) {
                const templates = data.templates || [];
                setClientNoteTemplates(templates.filter(t => t.type === 'client_note'));
                setPsychometricTools(templates.filter(t => t.type === 'psychometric'));
            } else {
                console.error('Failed to fetch templates:', data.message);
                toast.error('Failed to load templates');
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
            toast.error('Failed to load templates');
        } finally {
            setIsLoading(false);
        }
    };

    const addNoteTemplate = async (template) => {
        if (isLoading) return;

        try {
            setIsLoading(true);
            const { data } = await axios.post(`${backendUrl}/api/therapist/note-templates`, template, {
                headers: { ttoken: dToken }
            });
            await fetchNoteTemplates();
            return data.template;
        } catch (error) {
            console.error('Error adding template:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const editNoteTemplate = async (templateId, template) => {
        if (isLoading) return;

        try {
            setIsLoading(true);
            const templateData = {
                name: template.name,
                description: template.description,
                type: template.type,
                fields: template.fields,
                status: template.status || 'active'
            };

            const { data } = await axios.put(`${backendUrl}/api/therapist/note-templates/${templateId}`, templateData, {
                headers: { ttoken: dToken }
            });

            if (data.success) {
                await fetchNoteTemplates();
                return data.template;
            } else {
                throw new Error(data.message || 'Failed to update template');
            }
        } catch (error) {
            console.error('Error editing template:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteNoteTemplate = async (templateId) => {
        if (isLoading) return;

        try {
            setIsLoading(true);
            const { data } = await axios.delete(`${backendUrl}/api/therapist/note-templates/${templateId}`, {
                headers: { ttoken: dToken }
            });

            if (data.success) {
                await fetchNoteTemplates();
            } else {
                throw new Error(data.message || 'Failed to delete template');
            }
        } catch (error) {
            console.error('Error deleting template:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const ensureFieldIds = (fields) =>
        fields.map(field => ({
            ...field,
            id: field.id || Date.now().toString() + Math.random().toString(36).substr(2, 5)
        }));

    const handleSave = async () => {
        if (!template.name.trim()) return;
        const type = tab === 'notes' ? 'client_note' : 'psychometric';
        // Ensure all fields have an id
        const fieldsWithIds = ensureFieldIds(template.fields);
        const templateToSave = { ...template, type, fields: fieldsWithIds };
        if (id) {
            await editNoteTemplate(id, templateToSave);
        } else {
            await addNoteTemplate(templateToSave);
        }
        navigate('/clients');
    };

    return (
        <TemplateContext.Provider value={{
            psychometricTools,
            clientNoteTemplates,
            isLoading,
            fetchNoteTemplates,
            addNoteTemplate,
            editNoteTemplate,
            deleteNoteTemplate
        }}>
            {children}
        </TemplateContext.Provider>
    );
}; 