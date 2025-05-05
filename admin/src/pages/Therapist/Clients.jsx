import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Clock,
    FileText,
    Archive,
    ChevronRight,
    BarChart2,
    Tag,
    Search
} from 'lucide-react';
import { useTemplates } from '../../context/TemplateContext';

// Dummy data for clients
const dummyClients = [
    {
        id: 1,
        name: 'Sarah Johnson',
        university: 'University of Colombo',
        status: 'Ongoing',
        lastSession: '2024-03-15',
        totalSessions: 8,
        upcomingSessions: 2,
        goals: ['Anxiety Management', 'Self-Esteem'],
        notes: [
            {
                id: 1,
                date: '2024-03-15',
                type: 'CBT Formulation',
                content: 'Initial assessment completed. Identified core beliefs...'
            }
        ]
    },
    {
        id: 2,
        name: 'Michael Chen',
        university: 'University of Peradeniya',
        status: 'Goal Setting',
        lastSession: '2024-03-10',
        totalSessions: 4,
        upcomingSessions: 1,
        goals: ['Stress Management'],
        notes: []
    },
    {
        id: 3,
        name: 'Emma Wilson',
        university: 'University of Moratuwa',
        status: 'Archived',
        lastSession: '2023-12-20',
        totalSessions: 12,
        upcomingSessions: 0,
        goals: ['Completed'],
        notes: []
    }
];

const Clients = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [templateTab, setTemplateTab] = useState('notes');
    const { psychometricTools, setPsychometricTools, clientNoteTemplates, setClientNoteTemplates } = useTemplates();
    const templates = templateTab === 'notes' ? clientNoteTemplates : psychometricTools;
    const setTemplates = templateTab === 'notes' ? setClientNoteTemplates : setPsychometricTools;

    const filteredClients = dummyClients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.university.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || client.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Ongoing': return 'bg-green-100 text-green-800';
            case 'Goal Setting': return 'bg-blue-100 text-blue-800';
            case 'Archived': return 'bg-gray-100 text-gray-800';
            case 'Terminated': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleAdd = () => {
        navigate('/template/new');
    };
    const handleEdit = (tpl) => {
        navigate(`/template/${tpl.id}/edit`);
    };
    const handleDelete = (id) => {
        setTemplates(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="p-6">

            {/* Client Management Section */}
            <div className="flex justify-between mt-12 items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Client Management</h1>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search clients..."
                            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Goal Setting">Goal Setting</option>
                        <option value="Archived">Archived</option>
                        <option value="Terminated">Terminated</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map((client) => (
                    <div
                        key={client.id}
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
                        onClick={() => navigate(`/client-detail/${client.id}`)}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">{client.name}</h2>
                                <p className="text-gray-600">{client.university}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(client.status)}`}>
                                {client.status}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center text-gray-600">
                                <Calendar size={16} className="mr-2" />
                                <span>Last session: {new Date(client.lastSession).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Clock size={16} className="mr-2" />
                                <span>{client.totalSessions} total sessions</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <FileText size={16} className="mr-2" />
                                <span>{client.upcomingSessions} upcoming sessions</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                            <div className="flex flex-wrap gap-2">
                                {client.goals.map((goal, index) => (
                                    <span
                                        key={index}
                                        className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
                                    >
                                        {goal}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                            <span>View Details</span>
                            <ChevronRight size={16} />
                        </div>
                    </div>
                ))}
            </div>
            {/* Template Management Section */}
            <div className="mb-8 mt-12 bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold mb-4">Manage Client Notes Templates</h2>
                <div className="flex gap-2 mb-4">
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium border ${templateTab === 'notes' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
                        onClick={() => setTemplateTab('notes')}
                    >
                        Client Note Templates
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium border ${templateTab === 'psychometric' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
                        onClick={() => setTemplateTab('psychometric')}
                    >
                        Psychometric Tools
                    </button>
                </div>
                <div>
                    {templates.map(tpl => (
                        <div key={tpl.id} className="flex items-center justify-between border-b py-2">
                            <span className="font-medium">{tpl.name}</span>
                            <div className="flex gap-2">
                                <button className="text-indigo-600" onClick={() => handleEdit(tpl)}>Edit</button>
                                <button className="text-red-500" onClick={() => handleDelete(tpl.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg" onClick={handleAdd}>Add New Template</button>
            </div>
        </div>
    );
};

export default Clients;
