import axios from 'axios';

// Use a default value if the environment variable is not set
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => ({
    'ttoken': localStorage.getItem('ttoken')
});

export const clientService = {
    // Get all clients
    getClients: async () => {
        const response = await axios.get(`${API_URL}/therapist/clients`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Get client details
    getClientDetails: async (clientId) => {
        const response = await axios.get(`${API_URL}/therapist/client/${clientId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Add/Update note
    addNote: async (noteData) => {
        const response = await axios.post(`${API_URL}/therapist/client/note`, noteData, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Add/Update template
    addTemplate: async (templateData) => {
        const response = await axios.post(`${API_URL}/therapist/template`, templateData, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Add/Update goal
    addGoal: async (goalData) => {
        const response = await axios.post(`${API_URL}/therapist/client/goal`, goalData, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Add progress
    addProgress: async (progressData) => {
        const response = await axios.post(`${API_URL}/therapist/client/progress`, progressData, {
            headers: getAuthHeader()
        });
        return response.data;
    }
};
