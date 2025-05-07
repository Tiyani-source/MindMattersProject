import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Clock,
    FileText,
    Archive,
    ChevronRight,
    BarChart2,
    Tag,
    Search,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    XCircle,
    X,
    ChevronUp,
    ChevronDown
} from 'lucide-react';
import { useTemplates } from '../../context/TemplateContext';
import { TherapistContext } from '../../context/TherapistContext';
import { toast } from 'react-toastify';

const Clients = () => {
    const navigate = useNavigate();
    const { getClients, fetchAnalytics } = useContext(TherapistContext);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [templateTab, setTemplateTab] = useState('notes');
    const [analytics, setAnalytics] = useState(null);
    const { psychometricTools, clientNoteTemplates, isLoading: templatesLoading, deleteNoteTemplate } = useTemplates();
    const templates = templateTab === 'notes' ? clientNoteTemplates : psychometricTools;
    const [showTemplates, setShowTemplates] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [clientsData, analyticsData] = await Promise.all([
                    getClients(),
                    fetchAnalytics()
                ]);
                setClients(clientsData);
                setAnalytics(analyticsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [getClients, fetchAnalytics]);

    const filteredClients = clients.filter(client => {
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

    const getEngagementScoreColor = (score) => {
        if (score >= 0.8) return 'text-green-600';
        if (score >= 0.5) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getRetentionPrediction = (clientId) => {
        if (!analytics?.engagementScores?.[clientId]) return null;
        const score = analytics.engagementScores[clientId].score;
        if (score >= 0.8) return { label: 'High', color: 'text-green-600' };
        if (score >= 0.5) return { label: 'Medium', color: 'text-yellow-600' };
        return { label: 'Low', color: 'text-red-600' };
    };

    const handleAdd = () => {
        navigate('/template/new');
    };

    const handleEdit = (tpl) => {
        navigate(`/template/${tpl.id}/edit`);
    };

    const handleDelete = async (templateId) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            try {
                await deleteNoteTemplate(templateId);
                toast.success('Template deleted successfully');
            } catch (error) {
                toast.error('Failed to delete template');
                console.error('Error deleting template:', error);
            }
        }
    };

    return (
        <div className="p-6">
            {/* Top bar with Manage Templates button */}
            <div className="flex mt-5 justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Client Management</h1>
                <button
                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition flex items-center gap-2"
                    onClick={() => setShowTemplates((v) => !v)}
                >
                    {showTemplates ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    Manage Note Templates
                </button>
            </div>

            {/* Expandable Template Management Card */}
            {showTemplates && (
                <div className="w-full max-w-3xl mx-auto mb-8 bg-white rounded-2xl shadow-lg p-8 relative animate-fadeIn">
                    <button
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl"
                        onClick={() => setShowTemplates(false)}
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Manage Client Notes Templates</h2>
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
                    <div className="max-h-72 overflow-y-auto">
                        {templatesLoading ? (
                            <div className="text-center py-4">Loading templates...</div>
                        ) : templates.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">No templates found</div>
                        ) : (
                            templates.map(tpl => (
                                <div key={tpl._id} className="flex items-center justify-between border-b py-2">
                                    <span className="font-medium text-gray-800">{tpl.name}</span>
                                    <div className="flex gap-2">
                                        <button
                                            className="text-indigo-600 hover:text-indigo-800"
                                            onClick={() => handleEdit(tpl)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => handleDelete(tpl._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <button
                        className="mt-6 w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold text-lg shadow hover:bg-indigo-700 transition"
                        onClick={handleAdd}
                    >
                        Add New Template
                    </button>
                </div>
            )}

            {/* Client Management Search & Filter */}
            <div className="flex flex-col md:flex-row md:justify-between items-center gap-4 mb-8">
                <div className="relative w-full md:w-1/2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search clients..."
                        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
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

            {/* Client Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
                {filteredClients.map((client) => {
                    const engagementScore = analytics?.engagementScores?.[client.id]?.score;
                    const retentionPrediction = getRetentionPrediction(client.id);
                    const clientAnalytics = analytics?.engagementScores?.[client.id];

                    return (
                        <div
                            key={client.id}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8 cursor-pointer border border-gray-100 flex flex-col min-h-[340px]"
                            onClick={() => navigate(`/client-detail/${client.id}`)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">{client.name}</h2>
                                    <p className="text-gray-500 text-sm">{client.university}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow ${getStatusColor(client.status)}`}>{client.status}</span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center text-gray-600 text-sm">
                                    <Calendar size={16} className="mr-2" />
                                    <span>Last session: <span className="font-medium text-gray-800">{new Date(client.lastSession).toLocaleDateString()}</span></span>
                                </div>
                                <div className="flex items-center text-gray-600 text-sm">
                                    <Clock size={16} className="mr-2" />
                                    <span><span className="font-medium text-gray-800">{client.totalSessions}</span> total sessions</span>
                                </div>
                                <div className="flex items-center text-gray-600 text-sm">
                                    <FileText size={16} className="mr-2" />
                                    <span><span className="font-medium text-gray-800">{client.upcomingSessions}</span> upcoming sessions</span>
                                </div>
                            </div>

                            {/* AI Predictions Section */}
                            {analytics && (
                                <div className="mt-2 mb-4 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 shadow-sm">
                                    <h3 className="text-xs font-bold text-gray-700 mb-2 tracking-wide uppercase">AI Insights</h3>
                                    <div className="space-y-1">
                                        {engagementScore !== undefined && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">Engagement Score</span>
                                                <span className={`text-base font-bold ${getEngagementScoreColor(engagementScore)}`}>{(engagementScore * 100).toFixed(0)}%</span>
                                            </div>
                                        )}
                                        {retentionPrediction && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">Retention Prediction</span>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${retentionPrediction.color} border-current bg-opacity-10`}>{retentionPrediction.label}</span>
                                            </div>
                                        )}
                                        {clientAnalytics && (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500">Completion Rate</span>
                                                    <span className="text-base font-bold text-gray-800">{((clientAnalytics.completedSessions / clientAnalytics.totalSessions) * 100).toFixed(0)}%</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500">Avg. Session Interval</span>
                                                    <span className="text-base font-bold text-gray-800">{Math.round(clientAnalytics.avgInterval)} days</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 mb-4">
                                {client.goals.map((goal, index) => (
                                    <span
                                        key={index}
                                        className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-medium"
                                    >
                                        {goal}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-auto flex justify-between items-center text-sm text-indigo-600 font-semibold pt-2">
                                <span>View Details</span>
                                <ChevronRight size={18} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Clients;
